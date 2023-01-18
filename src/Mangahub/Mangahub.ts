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
    Tag,
    ContentRating,
    PartialSourceManga,
    Request,
    Response,
    Cookie,
    SourceIntents
} from '@paperback/types'

import {
    parseChapters,
    parseMangaDetails,
    parseViewMore,
    parseHomeSections,
    parseSearch
} from './MangahubParser'

const MH_DOMAIN = 'https://mangahub.io'
const MH_API_DOMAIN = 'https://api.mghubcdn.com/graphql'
const MH_CDN_DOMAIN = 'https://img.mghubcdn.com/file/imghub/'

export const MangahubInfo: SourceInfo = {
    version: '3.0.3',
    name: 'Mangahub',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from Mangahub.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MH_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        },
        {
            text: 'Cloudlare',
            type: BadgeColor.RED
        },
        {
            text: 'Buggy',
            type: BadgeColor.RED
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class Mangahub extends Source {

    requestManager = App.createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${MH_DOMAIN}/`,
                        'user-agent': await this.getUserAgent(),
                        'x-mhub-access': await this.getMhubAccess(),
                        'accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'DNT': '1',
                        'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                        'Sec-CH-UA-Mobile': '?0',
                        'Sec-CH-UA-Platform': '"Windows"',
                        'Sec-Fetch-Dest': 'image',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Site': 'cross-site'
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });

    stateManager = App.createSourceStateManager()

    getMhubAccess = async (): Promise<string> => {
        const cookies = this.requestManager?.cookieStore?.getAllCookies() ?? []
        let key

        for (const cookieRaw of cookies) {
            const cookie = cookieRaw as Cookie
            const cName = cookie.name

            if (cName == 'mhub_access') {
                key = cookie.value
                break
            }
        }

        if (!key) throw new Error('MISSING MANGAHUB KEY:\nDo the Cloudflare bypass by pressing the cloud icon!')
        return key
    }

    getUserAgent = async (): Promise<string> => {
        const storedUserAgent = await this.stateManager.retrieve('userAgent') as string
        if (storedUserAgent && storedUserAgent !== 'null') return storedUserAgent

        const userAgent = await this.requestManager.getDefaultUserAgent() // Mozilla/5.0 (iPad; CPU OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148
        const regEx = /AppleWebKit\/([^\s]+)/
        const match = userAgent.match(regEx)

        let newUserAgent: string = userAgent
        if (match && match[1]) {
            newUserAgent = userAgent.replace(match[1], `${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 99)}.${Math.floor(Math.random() * 99)}`)
        }

        await this.stateManager.store('userAgent', newUserAgent)
        return newUserAgent
    }

    override getMangaShareUrl(mangaId: string): string { return `${MH_DOMAIN}/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'user-agent': await this.getUserAgent(),
                'x-mhub-access': await this.getMhubAccess(),
                'origin': `${MH_DOMAIN}/`,
                'referer': `${MH_DOMAIN}/`,
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                'Sec-CH-UA-Mobile': '?0',
                'Sec-CH-UA-Platform': '"Windows"'
            },
            data: {
                query: `query {
                    manga(x: m01, slug: "${mangaId}") {
                        title
                        alternativeTitle
                        author
                        artist
                        image
                        status
                        genres
                        description
                        isPorn
                        isSoftPorn                    
                    }
                 }`
            }
        })

        const response: any = await this.requestManager.schedule(request, 1)
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if (!data.data?.manga) throw new Error(`Failed to parse manga property from data object mangaId:${mangaId}`)
        return parseMangaDetails(data.data.manga, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'user-agent': await this.getUserAgent(),
                'x-mhub-access': await this.getMhubAccess(),
                'origin': `${MH_DOMAIN}/`,
                'referer': `${MH_DOMAIN}/`,
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                'Sec-CH-UA-Mobile': '?0',
                'Sec-CH-UA-Platform': '"Windows"'
            },
            data: {
                query: `query {
                    manga(x: m01, slug: "${mangaId}") {
                        title
                        chapters {
                          number
                          title
                          slug
                          date
                        }                  
                    }
                 }`
            }
        })

        const response: any = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if (!data.data?.manga) throw new Error(`Failed to parse manga property from data object mangaId:${mangaId}`)
        if (data.data.manga.chapters?.length == 0) throw new Error(`Failed to parse chapters property from manga object mangaId:${mangaId}`)
        return parseChapters(data.data.manga.chapters)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'user-agent': await this.getUserAgent(),
                'x-mhub-access': await this.getMhubAccess(),
                'origin': `${MH_DOMAIN}/`,
                'referer': `${MH_DOMAIN}/`,
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Sec-CH-UA': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
                'Sec-CH-UA-Mobile': '?0',
                'Sec-CH-UA-Platform': '"Windows"',
                'sec-fetch-dest': 'image',
                'sec-fetch-mode': 'no-cors',
                'sec-fetch-site': 'cross-site'
            },
            data: {
                query: `query {
                    chapter(x: m01, slug: "${mangaId}", number: ${Number(chapterId)}) {
                      pages
                      title
                      slug
                    }
                  }
                  `
            }
        })

        const response: any = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            // Silently log errors
            console.log(`${e}`)
        }

        if (data?.errors) {
            throw new Error('API LIMIT EXCEEDED!\nTry doing to CloudFlare again bypass or come back later!')
        }

        if (!data.data?.chapter?.pages) throw new Error(`Failed to parse chapter or pages property from data object mangaId:${mangaId} chapterId:${chapterId}`)
        const pages: string[] = []

        try {
            const parsedPages = JSON.parse(data.data.chapter.pages)
            for (const i in parsedPages) {
                pages.push(MH_CDN_DOMAIN + parsedPages[i])
            }
        } catch (e) {
            throw new Error(`${e}`)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        })
    }

    override async getTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'user-agent': await this.getUserAgent(),
                'x-mhub-access': await this.getMhubAccess(),
                'origin': `${MH_DOMAIN}/`,
                'referer': `${MH_DOMAIN}/`,
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                'Sec-CH-UA-Mobile': '?0',
                'Sec-CH-UA-Platform': '"Windows"'
            },
            data: {
                query: `query {
                    genres {
                      id
                      slug
                      title
                    }
                }`
            }
        })

        const response: any = await this.requestManager.schedule(request, 1)
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if (data.data.genres?.length == 0) throw new Error('Failed to parse genres property from data object!')

        const arrayTags: Tag[] = []
        for (const genre of data.data.genres) {
            arrayTags.push({ id: genre.slug, label: genre.title })
        }
        return [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'user-agent': await this.getUserAgent(),
                'x-mhub-access': await this.getMhubAccess(),
                'origin': `${MH_DOMAIN}/`,
                'referer': `${MH_DOMAIN}/`,
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                'Sec-CH-UA-Mobile': '?0',
                'Sec-CH-UA-Platform': '"Windows"'
            },
            data: {
                query: `query {
                    latest_popular: latestPopular(x: m01) {
                        id
                        title
                        slug
                        image
                        latestChapter
                      }
                      latest: latest(x: m01, limit: 30) {
                        id
                        title
                        slug
                        image
                        latestChapter
                      }
                      popular: search(x: m01, mod: POPULAR, limit: 30) {
                        rows {
                          id
                          title
                          slug
                          image
                          latestChapter
                        }
                      }
                      new: search(x: m01, mod: NEW, limit: 30) {
                        rows {
                          id
                          title
                          slug
                          image
                          latestChapter
                        }
                      }
                      completed: search(x: m01, mod: COMPLETED, limit: 30) {
                        rows {
                          id
                          title
                          slug
                          image
                          latestChapter
                    }
                }
            }`
            }
        })
        const response: any = await this.requestManager.schedule(request, 1)

        try {
            const data = JSON.parse(response.data)
            parseHomeSections(data, sectionCallback)
        } catch (e) {
            throw new Error(`${e}`)
        }
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'user-agent': await this.getUserAgent(),
                'x-mhub-access': await this.getMhubAccess(),
                'origin': `${MH_DOMAIN}/`,
                'referer': `${MH_DOMAIN}/`,
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                'Sec-CH-UA-Mobile': '?0',
                'Sec-CH-UA-Platform': '"Windows"'
            },
            data: {
                query: `query {
                    latest: search(x: m01, mod: LATEST, offset: ${offset}) {
                        rows {
                            id
                            title
                            slug
                            image
                            latestChapter
                        }
                      }
                      popular: search(x: m01, mod: POPULAR, offset: ${offset}) {
                        rows {
                            id
                            title
                            slug
                            image
                            latestChapter
                        }
                      }
                      new: search(x: m01, mod: NEW, offset: ${offset}) {
                        rows {
                            id
                            title
                            slug
                            image
                            latestChapter
                        }
                      }
                      completed: search(x: m01, mod: COMPLETED, offset: ${offset}) {
                        rows {
                            id
                            title
                            slug
                            image
                            latestChapter
                    }
                }
            }`
            }
        })

        const response: any = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseViewMore(homepageSectionId, data)
        metadata = { offset: offset + 30 }
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0
        const searchTag: any = query?.includedTags?.map((x: any) => x.id)

        const requests = [
            //No Alt Titles
            {
                request: App.createRequest({
                    url: MH_API_DOMAIN,
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'user-agent': await this.getUserAgent(),
                        'x-mhub-access': await this.getMhubAccess(),
                        'origin': `${MH_DOMAIN}/`,
                        'referer': `${MH_DOMAIN}/`,
                        'Accept-Language': 'en-US,en;q=0.5',
                        'DNT': '1',
                        'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                        'Sec-CH-UA-Mobile': '?0',
                        'Sec-CH-UA-Platform': '"Windows"'
                    },
                    data: {
                        query: `query {
                            search(x: m01, alt: false, q: "${query?.title ? query.title : ''}", genre: "${searchTag[0] ? searchTag[0] : ''}", offset:${offset}) {
                              rows {
                                id
                                title
                                slug
                                image
                                latestChapter
                                genres
                              }
                            }
                          }
                          `
                    }
                })
            },
            {
                request: App.createRequest({
                    url: MH_API_DOMAIN,
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'user-agent': await this.getUserAgent(),
                        'x-mhub-access': await this.getMhubAccess(),
                        'origin': `${MH_DOMAIN}/`,
                        'referer': `${MH_DOMAIN}/`,
                        'Accept-Language': 'en-US,en;q=0.5',
                        'DNT': '1',
                        'Sec-CH-UA': '"Chromium";v="104", " Not A;Brand";v="104", "Microsoft Edge";v="104"',
                        'Sec-CH-UA-Mobile': '?0',
                        'Sec-CH-UA-Platform': '"Windows"'
                    },
                    data: {
                        query: `query {
                            search(x: m01, alt: true, q: "${query?.title ? query.title : ''}", genre: "${searchTag[0] ? searchTag[0] : ''}", offset:${offset}) {
                              rows {
                                id
                                title
                                slug
                                image
                                latestChapter
                                genres
                              }
                            }
                          }
                          `
                    }
                })
            }
        ]

        const promises: Promise<void>[] = []
        let manga: PartialSourceManga[] = []

        for (const req of requests) {
            promises.push(this.requestManager.schedule(req.request, 1).then((response: any) => {
                let data
                try {
                    data = JSON.parse(response.data)
                } catch (e) {
                    throw new Error(`${e}`)
                }
                manga = manga.concat(parseSearch(data))
            }))
        }

        await Promise.all(promises)

        const seen = new Set()
        manga = manga.filter(x => {
            const duplicate = seen.has(x.mangaId)
            seen.add(x.mangaId)
            return !duplicate
        })

        metadata = { offset: offset + 30 }
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getCloudflareBypassRequestAsync(): Promise<Request> {
        // Remove stored UserAgent
        await this.stateManager.store('userAgent', 'null')

        // Clear old cookies
        this.requestManager?.cookieStore?.getAllCookies().forEach(x => { this.requestManager?.cookieStore?.removeCookie(x) })

        return App.createRequest({
            url: `${MH_DOMAIN}/chapter/the-last-human/chapter-1?reloadKey=1`,
            method: 'GET',
            headers: {
                'referer': `${MH_DOMAIN}/`,
                'user-agent': await this.getUserAgent()
            }
        })
    }
}