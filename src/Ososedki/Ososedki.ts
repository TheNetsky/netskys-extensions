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
    Response,
    TagSection,
    SourceIntents,
    HomeSectionType
} from '@paperback/types'

import {
    parseChapterDetails,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseTags
} from './OsosedkiParser'

const OS_DOMAIN = 'https://ososedki.com'

export const OsosedkiInfo: SourceInfo = {
    version: '1.0.0',
    name: 'Ososedki',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from Ososedki.com',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: OS_DOMAIN,
    sourceTags: [
        {
            text: '18+',
            type: BadgeColor.YELLOW
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class Ososedki extends Source {
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${OS_DOMAIN}/`,
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

    override getMangaShareUrl(mangaId: string): string { return `${OS_DOMAIN}/${mangaId}` }

    override async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${OS_DOMAIN}/photos/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        return parseChapters(mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${OS_DOMAIN}/photos/${chapterId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId)
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: App.createRequest({
                    url: `${OS_DOMAIN}`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'new',
                    title: 'New Galleries',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                }),
            },
            {
                request: App.createRequest({
                    url: `${OS_DOMAIN}/cosplays`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'cosplay',
                    title: 'Cosplay Galleries',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                request: App.createRequest({
                    url: `${OS_DOMAIN}/top`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'top',
                    title: 'Top Galleries',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                request: App.createRequest({
                    url: `${OS_DOMAIN}/random`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'random',
                    title: 'Random Galleries',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            }
        ]

        const promises: Promise<void>[] = []

        for (const section of sections) {
            sectionCallback(section.sectionID)
            promises.push(
                this.requestManager.schedule(section.request, 1)
                    .then(response => {
                        this.CloudFlareError(response.status)
                        const $ = this.cheerio.load(response.data)
                        const items = parseHomeSections($, OS_DOMAIN, section.sectionID.id)
                        section.sectionID.items = items
                        sectionCallback(section.sectionID)
                    })
            )
        }

        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        if (metadata?.completed) return metadata

        const page: number = metadata?.page ?? 1
        let param = ''

        switch (homepageSectionId) {
            case 'new':
                param = `/?page=${page}`
                break
            case 'cosplay':
                param = `/cosplays?page=${page}`
                break
            case 'top':
                param = `/top?page=${page}`
                break
            case 'random':
                param = `/random?page=${page}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = App.createRequest({
            url: OS_DOMAIN + param,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = parseHomeSections($, OS_DOMAIN, homepageSectionId)

        metadata = { page: page + 1 }
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: OS_DOMAIN,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseTags($)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        let request
        // Regular search
        if (query.title) {
            request = App.createRequest({
                url: `${OS_DOMAIN}/?page=${page}`, // Site does not support title search
                method: 'GET'
            })

            // Tag Search
        } else {
            request = App.createRequest({
                url: `${OS_DOMAIN}/category/${query?.includedTags?.map((x: any) => x.id)[0]}?page=${page}`,
                method: 'GET'
            })
        }

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseHomeSections($, OS_DOMAIN, '')

        metadata = { page: page + 1 }
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    CloudFlareError(status: number): void {
        if (status == 503) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${Ososedki.name}> and press the cloud icon.`)
        }
    }

    override async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: OS_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${OS_DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}
