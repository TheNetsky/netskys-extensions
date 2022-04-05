import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    TagType,
    TagSection,
    ContentRating,
    Request,
    Response
} from 'paperback-extensions-common'

import {
    parseChapterDetails,
    isLastPage,
    parseTags,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore,
    parseSearch
} from './ReadComicOnlineParser'

const RCO_DOMAIN = 'https://readcomiconline.li'

export const ReadComicOnlineInfo: SourceInfo = {
    version: '1.1.7',
    name: 'ReadComicOnline',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls comics from ReadComicOnline.li.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: RCO_DOMAIN,
    sourceTags: [
        {
            text: 'Cloudflare',
            type: TagType.RED
        }
    ]
}

export class ReadComicOnline extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0`,
                        'referer': RCO_DOMAIN
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    override getMangaShareUrl(mangaId: string): string { return `${RCO_DOMAIN}/Comic/${mangaId}` }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${RCO_DOMAIN}/Comic/`,
            method: 'GET',
            param: mangaId
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${RCO_DOMAIN}/Comic/`,
            method: 'GET',
            param: mangaId,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapters($, mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${RCO_DOMAIN}/Comic/${mangaId}/${chapterId}`,
            method: 'GET',
            param: '?readType=1&quality=hq'
        })

        const response = await this.requestManager.schedule(request, 1)
        return parseChapterDetails(response.data, mangaId, chapterId)
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${RCO_DOMAIN}/ComicList`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseTags($)
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: RCO_DOMAIN,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        parseHomeSections($, sectionCallback)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''
        switch (homepageSectionId) {
            case 'latest_comic':
                param = `/LatestUpdate?page=${page}`
                break
            case 'new_comic':
                param = `/Newest?page=${page}`
                break
            case 'popular_comic':
                param = `/MostPopular?page=${page}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = createRequestObject({
            url: `${RCO_DOMAIN}/ComicList`,
            method: 'GET',
            param,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const manga = parseViewMore($, this.cheerio)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let request

        //Regular search
        if (query.title) {
            request = createRequestObject({
                url: `${RCO_DOMAIN}/Search/Comic`,
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-type': 'application/x-www-form-urlencoded',
                },
                data: `keyword=${encodeURI(query.title ?? '')}`
            })

            //Tag Search
        } else {
            request = createRequestObject({
                url: `${RCO_DOMAIN}/Genre/`,
                method: 'GET',
                param: `${query?.includedTags?.map((x: any) => x.id)[0]}?page=${page}`
            })
        }
        
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($, this.cheerio)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })

        //Genre search, no advanced search since it requires reCaptcha
    }

    override getCloudflareBypassRequest(): Request {
        return createRequestObject({
            url: RCO_DOMAIN,
            method: 'GET',
            headers: {
                'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0`,
            }
        })
    }
}
