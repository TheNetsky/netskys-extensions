import {
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    ContentRating,
    BadgeColor,
    Request,
    Response,
    TagSection,
    SourceIntents,
    MangaProviding,
    ChapterProviding,
    Searchable
} from '@paperback/types'

import {
    parseChapterDetails,
    isLastPage,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore,
    parseSearch,
    parseTags
} from './HentaiHereParser'

const HH_DOMAIN = 'https://hentaihere.com'

export const HentaiHereInfo: SourceInfo = {
    version: '3.0.1',
    name: 'HentaiHere',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from HentaiHere',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: HH_DOMAIN,
    sourceTags: [
        {
            text: '18+',
            type: BadgeColor.YELLOW
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class HentaiHere implements Searchable, MangaProviding, ChapterProviding {

    constructor(private cheerio: CheerioAPI) { }
    
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${HH_DOMAIN}/`,
                        'user-agent': await this.requestManager.getDefaultUserAgent()
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });

    getMangaShareUrl(mangaId: string): string { return `${HH_DOMAIN}/m/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${HH_DOMAIN}/m/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        return parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${HH_DOMAIN}/m/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        return parseChapters($)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${HH_DOMAIN}/m/${mangaId}/${chapterId}/1`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        return parseChapterDetails(response.data, mangaId, chapterId)
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: HH_DOMAIN,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        parseHomeSections($, sectionCallback)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''

        switch (homepageSectionId) {
            case 'newest':
                param = `/directory/newest?page=${page}`
                break
            case 'trending':
                param = `/directory/trending?page=${page}`
                break
            case 'staff_pick':
                param = `/directory/staff_pick?page=${page}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = App.createRequest({
            url: HH_DOMAIN,
            method: 'GET',
            param
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseViewMore($)

        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${HH_DOMAIN}/tags/category`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        return parseTags($)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        let request
        if (query.title) {
            request = App.createRequest({
                url: `${HH_DOMAIN}/search?s=`,
                method: 'GET',
                param: `${encodeURI(query.title)}&page=${page}`
            })
        } else {
            request = App.createRequest({
                url: `${HH_DOMAIN}`,
                method: 'GET',
                param: `/search/${query?.includedTags?.map((x: any) => x.id)[0]}/most-popular?page=${page}`
            })
        }

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseSearch($)

        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    CloudFlareError(status: number): void {
        if (status == 503) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${HentaiHere.name}> and press the cloud icon.`)
        }
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: HH_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${HH_DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}
