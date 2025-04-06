import {
    Extension,
    SearchResultsProviding,
    MangaProviding,
    ChapterProviding,
    DiscoverSectionProviding,
    CloudflareBypassRequestProviding,
    BasicRateLimiter,
    CookieStorageInterceptor,
    Chapter,
    ChapterDetails,
    Cookie,
    DiscoverSection,
    DiscoverSectionItem,
    DiscoverSectionType,
    PagedResults,
    SearchFilter,
    SearchQuery,
    SearchResultItem,
    SourceManga,
    URL,
    CloudflareError,
    Response,
    Tag,
    TagSection
} from '@paperback/types'

import * as cheerio from 'cheerio'

import pbconfig from './pbconfig'
import { Interceptor } from './interceptor'
import { Parser } from './parser'

type Metadata = {
    page?: number;
    completed?: boolean;
}

export class MitakuExtension implements Extension, SearchResultsProviding, MangaProviding, ChapterProviding, DiscoverSectionProviding, CloudflareBypassRequestProviding {

    domain = 'https://mitaku.net'

    parser = new Parser()

    defaultContentRating = pbconfig.contentRating

    language = pbconfig.language

    cookieStorageInterceptor = new CookieStorageInterceptor({
        storage: 'stateManager'
    })

    requestManager = new Interceptor('main', this)

    globalRateLimiter = new BasicRateLimiter('ratelimiter', {
        numberOfRequests: 20,
        bufferInterval: 1,
        ignoreImages: true
    })

    async initialise(): Promise<void> {
        this.cookieStorageInterceptor.registerInterceptor()
        this.globalRateLimiter.registerInterceptor()
        this.requestManager.registerInterceptor()
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const [response, buffer] = await Application.scheduleRequest({
            url: `${this.domain}/?p=${mangaId}`,
            method: 'GET'
        })
        await this.checkResponseError(response)

        const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer))
        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(sourceManga: SourceManga): Promise<Chapter[]> {
        // There are not chapters, so do it manually
        return this.parser.parseChapterList(sourceManga, this)
    }

    async getChapterDetails(chapter: Chapter): Promise<ChapterDetails> {
        const mangaId = chapter.sourceManga.mangaId

        const [response, buffer] = await Application.scheduleRequest({
            url: `${this.domain}/?p=${mangaId}`,
            method: 'GET'
        })
        await this.checkResponseError(response)

        const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer))

        return this.parser.parseChapterDetails($, chapter, this)
    }

    async getDiscoverSections(): Promise<DiscoverSection[]> {
        return [
            {
                id: 'ero_cosplay_galleries',
                title: 'Ero Cosplay Galleries',
                type: DiscoverSectionType.simpleCarousel
            },
            {
                id: 'nude_galleries',
                title: 'Nude Galleries',
                type: DiscoverSectionType.simpleCarousel
            },
            {
                id: 'sexy_set_galleries',
                title: 'Sexy Set Galleries',
                type: DiscoverSectionType.simpleCarousel
            }
        ]
    }

    async getDiscoverSectionItems(section: DiscoverSection, metadata: Metadata | undefined): Promise<PagedResults<DiscoverSectionItem>> {
        let param = ''
        const page = metadata?.page ?? 1

        switch (section.id) {
        case 'ero_cosplay_galleries':
            param = 'category/ero-cosplay'
            break
        case 'nude_galleries':
            param = 'category/nude'
            break
        case 'sexy_set_galleries':
            param = 'category/sexy-set'
            break

        default:
            throw new Error('Invalid sectionId provided!')
        }

        const [response, buffer] = await Application.scheduleRequest({
            url: `${this.domain}/${param}/page/${page}`,
            method: 'GET'
        })
        await this.checkResponseError(response)

        const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer))
        const items = await this.parser.parseDiscoverSections($, section, this)

        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        return {
            items: items,
            metadata: metadata
        }
    }

    async getSearchFilters(): Promise<SearchFilter[]> {
        const [response, buffer] = await Application.scheduleRequest({
            url: `${this.domain}/wp-json/wp/v2/tags?per_page=100`,
            method: 'GET'
        })
        await this.checkResponseError(response)

        const tagJSON = JSON.parse(Application.arrayBufferToUTF8String(buffer))

        const arrayTags: Tag[] = []
        for (const tag of tagJSON) {
            const title = tag.name
            const id = tag.slug

            if (!title || !id) continue
            arrayTags.push({ id: id, title: title })
        }

        const tagSections: TagSection[] = [{ title: 'genres', id: 'genres', tags: arrayTags }]
        const genreTags = tagSections.find((x) => x.id === 'genres') as TagSection

        return [
            {
                type: 'multiselect',
                options: genreTags.tags.map((x) => ({
                    id: x.id,
                    value: x.title
                })),
                id: genreTags.id,
                allowExclusion: false,
                title: genreTags.title,
                value: {},
                allowEmptySelection: true,
                maximum: 1
            }
        ]
    }

    async getSearchResults(query: SearchQuery, metadata: Metadata | undefined): Promise<PagedResults<SearchResultItem>> {
        const page = metadata?.page ?? 1

        const [response, buffer] = await this.constructSearchRequest(page, query)

        await this.checkResponseError(response)

        const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer))

        const results = await this.parser.parseSearchResults($, this)

        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        return {
            items: results,
            metadata: metadata
        }
    }

    async saveCloudflareBypassCookies(cookies: Cookie[]): Promise<void> {
        // Clear all the cookies
        for (const cookie of cookies) {
            this.cookieStorageInterceptor.deleteCookie(cookie)
        }

        // Set all the cookies
        for (const cookie of cookies) {
            this.cookieStorageInterceptor.setCookie(cookie)
        }
    }

    // Utility
    constructSearchRequest(page: number, query: SearchQuery) {
        const urlBuilder = new URL(this.domain)

        const genreFilters = Object.keys(query.filters.find(x => x.id === 'genres')?.value ?? {})

        if (query.title) {
            urlBuilder.addPathComponent('page')
            urlBuilder.addPathComponent(page.toString())
            urlBuilder.setQueryItem('s', encodeURIComponent(this.sanitizeQuery(query?.title ?? '')))
        } else if (genreFilters.length) {
            urlBuilder.addPathComponent('tag')
            urlBuilder.addPathComponent(genreFilters[0] ?? '')
            urlBuilder.addPathComponent('page')
            urlBuilder.addPathComponent(page.toString())
        }

        return Application.scheduleRequest({
            url: urlBuilder.toString(),
            method: 'GET'
        })
    }

    sanitizeQuery(query: string): string {
        return query
            .replace(/'[^ ]*/g, '') // Remove apostrophes and the following characters up to a space
            .replace(/\.+/g, '')   // Remove all periods
            .replace(/["']/g, '')  // Remove quotes
            .trim()
    }

    async checkResponseError(response: Response): Promise<void> {
        const status = response.status
        switch (status) {
        case 403:
        case 503:
            throw new CloudflareError({
                url: this.domain,
                method: 'GET',
                headers: {
                    'referer': `${this.domain}/`,
                    'origin': `${this.domain}/`,
                    'user-agent': await Application.getDefaultUserAgent()
                }
            }, 'Cloudflare detected!\nPlease do the Cloudflare bypass to continue!')
        case 404:
            throw new Error(`The requested page ${response.url} was not found!`)
        }
    }
}


export const Mitaku = new MitakuExtension()