import {
    Source,
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    BadgeColor,
    TagSection,
    ContentRating
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
    version: '3.0.0',
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
        },
        {
            text: 'Buggy',
            type: BadgeColor.RED
        }
    ]
}

export class MangaJar extends Source {
    readonly cookies = [
        App.createCookie({ name: 'adultConfirmed', value: '1', domain: 'mangajar.com' }),
        App.createCookie({ name: 'readingMode', value: 'v', domain: 'mangajar.com' })
    ];

    requestManager = App.createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 20000
    });

    override getMangaShareUrl(mangaId: string): string { return `${MJ_DOMAIN}/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${MJ_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId,
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
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
                param: `?infinite=1&page=${page++}`,
                cookies: this.cookies
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)

            isLast = !isLastPage($) ? false : true
            chapters = chapters.concat(parseChapters($, mangaId))
        }
        return chapters
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${MJ_DOMAIN}/manga/${mangaId}/chapter/${chapterId}`,
            method: 'GET',
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId)
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: MJ_DOMAIN,
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
            param,
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
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
                param: `${encodeURI(query.title)}&page=${page}`,
                cookies: this.cookies
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)
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
                param: `/genre/${query?.includedTags?.map((x: any) => x.id)[0]}?page=${page}`,
                cookies: this.cookies
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)
            const manga = parseSearch($, true)
            
            metadata = !isLastPage($) ? { page: page + 1 } : undefined
            return App.createPagedResults({
                results: manga,
                metadata
            })
        }
    }

    override async getTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${MJ_DOMAIN}/genre`,
            method: 'GET',
            cookies: this.cookies
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseTags($)
    }
}
