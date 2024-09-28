import {
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    ContentRating,
    Request,
    Response,
    SourceIntents,
    ChapterProviding,
    MangaProviding,
    SearchResultsProviding,
    HomePageSectionsProviding,
    HomeSectionType,
    Tag,
    TagSection,
    BadgeColor
} from '@paperback/types'

import * as cheerio from 'cheerio'

import {
    parseChapterDetails,
    isLastPage,
    parseChapters,
    parseMangaDetails,
    parseGallery,
    parseTags
} from './CoomerSuParser'

import { getFirstOfMonth } from './CoomerUtils'

import { Post } from './interface/Post'

const CSU_DOMAIN = 'https://coomer.su'
const CSU_API_DOMAIN = CSU_DOMAIN + '/api/v1'

export const CoomerSuInfo: SourceInfo = {
    version: '1.0.2',
    name: 'CoomerSu',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls comics from coomer.su',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: CSU_DOMAIN,
    sourceTags: [
        {
            text: '18+',
            type: BadgeColor.YELLOW
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class CoomerSu implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {

    baseURL = CSU_DOMAIN

    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${CSU_DOMAIN}/`,
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

    stateManager = App.createSourceStateManager()


    getMangaShareUrl(mangaId: string): string { return `${CSU_DOMAIN}/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${CSU_API_DOMAIN}/${mangaId}`, // fansly/user/512004663294308352 is the format of the mangaId
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        try {
            const data: Post[] = JSON.parse(response.data as string)
            return parseMangaDetails(this, data, mangaId)
        } catch (error) {
            throw new Error(error as string)
        }

    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${CSU_API_DOMAIN}/${mangaId}`, // fansly/user/512004663294308352 is the format of the mangaId
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        try {
            const data: Post[] = JSON.parse(response.data as string)
            return parseChapters(this, data, mangaId)
        } catch (error) {
            throw new Error(error as string)
        }

    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${CSU_API_DOMAIN}/${mangaId}/post/${chapterId}`, // fansly/user/512004663294308352 is the format of the mangaId, 633162354124664833 is post id aka chapterId
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        try {
            const data: Post = JSON.parse(response.data as string)
            return parseChapterDetails(this, data, mangaId, chapterId)
        } catch (error) {
            throw new Error(error as string)
        }

    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: App.createRequest({
                    url: `${CSU_DOMAIN}/artists`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'popular-creators',
                    title: 'Popular Creators',
                    containsMoreItems: false, // Unable to load JS to get more listings
                    type: HomeSectionType.singleRowLarge
                })
            },
            {
                request: App.createRequest({
                    url: `${CSU_DOMAIN}/artists/updated`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'recent-creators',
                    title: 'Recent Creators',
                    containsMoreItems: false, // Unable to load JS to get more listings
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                request: App.createRequest({
                    url: `${CSU_DOMAIN}/posts`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'latest',
                    title: 'Latest Posts',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                request: App.createRequest({
                    url: `${CSU_DOMAIN}/posts/popular`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'popular',
                    title: 'Popular Posts',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                request: App.createRequest({
                    url: `${CSU_DOMAIN}/posts/popular?date=${getFirstOfMonth()}&period=month`,
                    method: 'GET'
                }),
                sectionID: App.createHomeSection({
                    id: 'popular-month',
                    title: 'Monthly Popular Posts',
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
                    .then(async response => {
                        this.CloudFlareError(response.status)
                        const $ = cheerio.load(response.data as string)
                        const items = await parseGallery(this, $, section.sectionID.id)
                        section.sectionID.items = items
                        sectionCallback(section.sectionID)
                    })
            )
        }

        await Promise.all(promises)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 0
        let param = ''

        switch (homepageSectionId) {
            case 'popular-creators':
                param = `artists#o=${page}`
                break
            case 'recent-creators':
                param = `artists/updated#o=${page}`
                break
            case 'latest':
                param = `posts?o=${page}`
                break
            case 'popular':
                param = `posts/popular?o=${page}`
                break
            case 'popular-month':
                param = `posts/popular?o=${page}&date=${getFirstOfMonth()}&period=month`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = App.createRequest({
            url: `${CSU_DOMAIN}/${param}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = cheerio.load(response.data as string)

        const posts = await parseGallery(this, $, homepageSectionId)
        metadata = !isLastPage($) ? { page: page + 50 } : undefined
        return App.createPagedResults({
            results: posts,
            metadata
        })
    }

    /* // Crashes the app for some reason lmfao
        async getSearchTags(): Promise<TagSection[]> {
            const request = App.createRequest({
                url: `${CSU_DOMAIN}/posts/tags`,
                method: 'GET'
            })
    
            const response = await this.requestManager.schedule(request, 1)
            const $ = cheerio.load(response.data as string)
            return parseTags($)
        }
    */

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 0
        let request

        // Regular search
        if (query.title) {
            const q = page > 0 ? `?o=${page}&q=${encodeURI(query.title ?? '')}` : `?q=${encodeURI(query.title ?? '')}`

            request = App.createRequest({
                url: `${CSU_DOMAIN}/posts${q}`,
                method: 'GET'
            })

            // Tag Search
        } else {
            const q = page > 0 ? `?o=${page}&tag=${query?.includedTags?.map((x: Tag) => x.id)[0]}` : `?tag=${query?.includedTags?.map((x: Tag) => x.id)[0]}`

            request = App.createRequest({
                url: `${CSU_DOMAIN}/posts${q}`,
                method: 'GET'
            })
        }

        metadata = { page: page + 50 }

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = cheerio.load(response.data as string)
        const posts = await parseGallery(this, $)

        return App.createPagedResults({
            results: posts,
            metadata
        })

    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${CoomerSu.name}> and press the cloud icon.`)
        }
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: CSU_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${CSU_DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}
