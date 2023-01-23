import {
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    BadgeColor,
    TagSection,
    ContentRating,
    SourceIntents,
    ChapterProviding,
    MangaProviding,
    Searchable,
    Response,
    Request
} from '@paperback/types'

import {
    parseTags,
    parseSearch,
    isLastPage,
    parseChapterDetails,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore
} from './MangaJarParser'

const MJ_DOMAIN = 'https://mangajar.com'

export const MangaJarInfo: SourceInfo = {
    version: '3.0.1',
    name: 'MangaJar',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaJar.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MJ_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class MangaJar implements Searchable, MangaProviding, ChapterProviding {

    constructor(private cheerio: CheerioAPI) { }

    requestManager = App.createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 20000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.cookies = [
                    App.createCookie({ name: 'adultConfirmed', value: '1', domain: 'mangajar.com' }),
                    App.createCookie({ name: 'readingMode', value: 'v', domain: 'mangajar.com' })]
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });

    getMangaShareUrl(mangaId: string): string { return `${MJ_DOMAIN}/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${MJ_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        return parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        let chapters: any = []
        let page = 1
        let isLast = false

        while (!isLast) {
            const request = App.createRequest({
                url: `${MJ_DOMAIN}/manga/${mangaId}/chaptersList`,
                method: 'GET',
                param: `?infinite=1&page=${page++}`
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data as string)

            isLast = !isLastPage($) ? false : true
            chapters = chapters.concat(parseChapters($, mangaId))
        }
        return chapters
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${MJ_DOMAIN}/manga/${mangaId}/chapter/${chapterId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        return parseChapterDetails($, mangaId, chapterId)
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: MJ_DOMAIN,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        parseHomeSections($, sectionCallback)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''

        switch (homepageSectionId) {
            case 'hot_update':
                param = `/manga?sortBy=-last_chapter_at&page=${page}`
                break
            case 'new_trending':
                param = `/manga?sortBy=-year&page=${page}`
                break
            case 'popular_manga':
                param = `/manga?sortBy=popular&page=${page}`
                break
            case 'new_manga':
                param = `/manga?sortBy=-published_at&page=${page}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = App.createRequest({
            url: MJ_DOMAIN,
            method: 'GET',
            param
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseViewMore($)

        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        if (query.title) {
            const request = App.createRequest({
                url: `${MJ_DOMAIN}/search?q=`,
                method: 'GET',
                param: `${encodeURI(query.title)}&page=${page}`
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data as string)
            const manga = parseSearch($, false)

            metadata = !isLastPage($) ? { page: page + 1 } : undefined
            return App.createPagedResults({
                results: manga,
                metadata
            })

        } else {
            const request = App.createRequest({
                url: MJ_DOMAIN,
                method: 'GET',
                param: `/genre/${query?.includedTags?.map((x: any) => x.id)[0]}?page=${page}`
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data as string)
            const manga = parseSearch($, true)

            metadata = !isLastPage($) ? { page: page + 1 } : undefined
            return App.createPagedResults({
                results: manga,
                metadata
            })
        }
    }

    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${MJ_DOMAIN}/genre`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        return parseTags($)
    }
}
