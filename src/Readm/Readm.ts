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
    PartialSourceManga,
    ContentRating,
    Request,
    Response,
    SourceIntents,
    ChapterProviding,
    MangaProviding,
    SearchResultsProviding,
    HomePageSectionsProviding,
    Tag
} from '@paperback/types'

import {
    parseChapterDetails,
    isLastPage,
    parseTags,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore
} from './ReadmParser'

const RM_DOMAIN = 'https://readm.today'

export const ReadmInfo: SourceInfo = {
    version: '2.1.7',
    name: 'Readm',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from readm.org',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: RM_DOMAIN,
    sourceTags: [],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class Readm implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {

    constructor(private cheerio: CheerioAPI) { }

    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${RM_DOMAIN}/`,
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

    getMangaShareUrl(mangaId: string): string { return `${RM_DOMAIN}/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${RM_DOMAIN}/manga/${mangaId}`,
            method: 'GET',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        return parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${RM_DOMAIN}/manga/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        return parseChapters($, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${RM_DOMAIN}/manga/${mangaId}/${chapterId}/all-pages`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string, { xmlMode: false })
        return parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: RM_DOMAIN,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        return parseTags($) || []
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: RM_DOMAIN,
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
            case 'popular_manga':
                param = `popular-manga/${page}`
                break
            case 'latest_updates':
                param = `latest-releases/${page}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = App.createRequest({
            url: `${RM_DOMAIN}/${param}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseViewMore($, homepageSectionId)

        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        // Regular search
        if (query.title) {
            const request = App.createRequest({
                url: `${RM_DOMAIN}/service/search`,
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                data: `dataType=json&phrase=${encodeURI(query.title)}`
            })

            let response = await this.requestManager.schedule(request, 1)
            this.CloudFlareError(response.status)
            response = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data
            const data = Object(response)

            if (!data.manga) {
                console.log('API Error: Failed to create proper response object, missing manga property!')
                return App.createPagedResults({
                    results: []
                })
            }

            // Create the search results
            const manga: PartialSourceManga[] = []
            for (const m of data.manga) {
                if (!m.url || !m.title) {
                    console.log('Missing URL or Title property in manga object!')
                    continue
                }

                const id: string = m.url.split('/').pop().split('?')[0]
                const image: string = RM_DOMAIN + m.image
                const title: string = m.title

                if (!id || !title) continue
                manga.push(App.createPartialSourceManga({
                    image: image,
                    title: title,
                    mangaId: id,
                    subtitle: undefined
                }))
            }
            return App.createPagedResults({
                results: manga
            })

            // Genre search, no advanced search since it requires reCaptcha
        } else {
            const request = App.createRequest({
                url: `${RM_DOMAIN}/category/${query?.includedTags?.map((x: Tag) => x.id)[0]}/watch/${page}`,
                method: 'GET'
            })

            const response = await this.requestManager.schedule(request, 1)
            this.CloudFlareError(response.status)
            const $ = this.cheerio.load(response.data as string)
            const manga = parseViewMore($, 'popular_manga')

            metadata = !isLastPage($) ? { page: page + 1 } : undefined
            return App.createPagedResults({
                results: manga,
                metadata
            })
        }
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${Readm.name}> and press the cloud icon.`)
        }
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: RM_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${RM_DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}
