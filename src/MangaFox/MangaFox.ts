/* eslint-disable linebreak-style */
import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    MangaUpdates,
    TagType,
    TagSection,
    ContentRating
} from 'paperback-extensions-common'
import {
    parseUpdatedManga,
    isLastPage,
    parseTags,
    parseChapterDetails,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseSearch,
    parseViewMore,
    UpdatedManga
} from './MangaFoxParser'

import { URLBuilder } from './MangaFoxHelper'

const FF_DOMAIN = 'https://fanfox.net'
const FF_DOMAIN_MOBILE = 'https://m.fanfox.net'
const headers = {
    'content-type': 'application/x-www-form-urlencoded'
}

export const MangaFoxInfo: SourceInfo = {
    version: '2.0.2',
    name: 'MangaFox',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaHere.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: FF_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class MangaFox extends Source {
    readonly cookies = [createCookie({ name: 'isAdult', value: '1', domain: 'www.mangahere.cc' })];

    requestManager = createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 20000,
    })

    override getMangaShareUrl(mangaId: string): string { return `${FF_DOMAIN}/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${FF_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId,
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${FF_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId,
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapters($, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${FF_DOMAIN_MOBILE}/roll_manga/${mangaId}/${chapterId}`,
            method: 'GET',
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page = 1
        let updatedManga: UpdatedManga = {
            ids: [],
            loadMore: true
        }

        while (updatedManga.loadMore) {
            const request = createRequestObject({
                url: `${FF_DOMAIN}/releases/${page++}`,
                method: 'GET',
                cookies: this.cookies
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)

            updatedManga = parseUpdatedManga($, time, ids)
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }))
            }
        }

    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {

        const request = createRequestObject({
            url: FF_DOMAIN,
            method: 'GET',
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        parseHomeSections($, sectionCallback)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''
        switch (homepageSectionId) {
            case 'hot_release':
                param = '/hot/'
                break
            case 'new_manga':
                param = `/directory/${page}.htm?news`
                break
            case 'latest_updates':
                param = `/releases/${page}`
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }
        const request = createRequestObject({
            url: `${FF_DOMAIN}/`,
            method: 'GET',
            param,
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const manga = parseViewMore($, homepageSectionId)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const url = new URLBuilder(FF_DOMAIN)
            .addPathComponent('search')
            .addQueryParameter('page', page)
            .addQueryParameter('title', encodeURI(query?.title || ''))
            .addQueryParameter('genres', query.includedTags?.map((x: any) => x.id).join('%2C'))
            .buildUrl()

        const request = createRequestObject({
            url: url,
            method: 'GET',
            headers,
            cookies: this.cookies,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${FF_DOMAIN}/search?`,
            method: 'GET',
            cookies: this.cookies,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseTags($)
    }
}