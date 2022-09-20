import {
    Source,
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
    Response
} from '@paperback/types'

import {
    parseChapterDetails,
    isLastPage,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore,
    parseSearch
} from './ReadComicsOnlineParser'

const RCO_DOMAIN = 'https://readcomicsonline.ru'

export const ReadComicsOnlineInfo: SourceInfo = {
    version: '1.1.0',
    name: 'ReadComicsOnline',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls comics from ReadComicsOnline.ru.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: RCO_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        }
    ]
}

export class ReadComicsOnline extends Source {
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${RCO_DOMAIN}/`,
                        'user-agent': await this.requestManager.getDefaultUserAgent()
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })


    override getMangaShareUrl(mangaId: string): string { return `${RCO_DOMAIN}/comic/${mangaId}` }

    override async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/comic/`,
            method: 'GET',
            param: mangaId
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/comic/`,
            method: 'GET',
            param: mangaId,
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return parseChapters($)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/comic/${mangaId}/${chapterId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId)
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: RCO_DOMAIN,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        parseHomeSections($, sectionCallback)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''

        switch (homepageSectionId) {
            case 'latest_comic':
                param = `?page=${page}&sortBy=last_release&asc=false`
                break
            case 'popular_comic':
                param = `?page=${page}&sortBy=views&asc=false`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = App.createRequest({
            url: `${RCO_DOMAIN}/filterList`,
            method: 'GET',
            param
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        const manga = parseViewMore($)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest): Promise<PagedResults> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/search?query=${encodeURI(query.title ?? '')}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const manga = parseSearch(response.data)

        return App.createPagedResults({
            results: manga,
        })

    }

    CloudFlareError(status: number): void {
        if (status == 503) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${ReadComicsOnline.name}> and press the cloud icon.`)
        }
    }

    override async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: RCO_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${RCO_DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}