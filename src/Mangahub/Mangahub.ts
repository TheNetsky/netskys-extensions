import { gcm } from '@noble/ciphers/aes.js'
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
    Tag,
    ContentRating,
    PartialSourceManga,
    Request,
    Response,
    SourceIntents,
    ChapterProviding,
    MangaProviding,
    SearchResultsProviding,
    HomePageSectionsProviding,
    CloudflareBypassRequestProviding
} from '@paperback/types'

import {
    parseChapters,
    parseMangaDetails,
    parseViewMore,
    parseHomeSections,
    parseSearch
} from './MangahubParser'

const MH_DOMAIN = 'https://mangahub.io'
const MH_API_DOMAIN = 'https://api.mghcdn.com/graphql'
const MH_CDN_DOMAIN = 'https://imgx.mghcdn.com'

function base64UrlToBytes(str: string): Uint8Array {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4 !== 0) {
        base64 += '='
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let buffer = 0
    let bits = 0
    const output: number[] = []
    for (let i = 0; i < base64.length; i++) {
        const c = base64[i]
        if (c === '=') break
        const val = chars.indexOf(c)
        if (val === -1) continue
        buffer = (buffer << 6) | val
        bits += 6
        if (bits >= 8) {
            bits -= 8
            output.push((buffer >> bits) & 0xff)
        }
    }
    return new Uint8Array(output)
}


export const MangahubInfo: SourceInfo = {
    version: '3.1.2',
    name: 'Mangahub',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from mangahub.io',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MH_DOMAIN,
    sourceTags: [
        {
            text: 'Buggy',
            type: BadgeColor.RED
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class Mangahub implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding, CloudflareBypassRequestProviding {

    CloudFlareError(status: number): void {
        if (status === 503 || status === 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${Mangahub.name}> and press the cloud icon.`)
        }
    }

    requestManager = App.createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'Referer': `${MH_DOMAIN}/`,
                        'Origin': `${MH_DOMAIN}`,
                        'User-Agent': await this.requestManager.getDefaultUserAgent(),
                        'x-mhub-access': await this.getMhubAccess()
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
        const cookies = this.requestManager.cookieStore?.getAllCookies() ?? []
        const mhubCookie = cookies.find(x => x.name === 'mhub_access')
        if (mhubCookie?.value) {
            return mhubCookie.value
        }

        const stored = await this.stateManager.retrieve('mhub_key')
        if (typeof stored === 'string' && stored) {
            const match = /mhub_access=([^;]+)/.exec(stored)
            return match ? (match[1] ?? '') : stored
        }
        return ''
    }

    getMangaShareUrl(mangaId: string): string { return `${MH_DOMAIN}/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        let data
        try {
            data = JSON.parse(response.data as string)
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
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data
        try {
            data = JSON.parse(response.data as string)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if (!data.data?.manga) throw new Error(`Failed to parse manga property from data object mangaId:${mangaId}`)
        if (data.data.manga.chapters?.length == 0) throw new Error(`Failed to parse chapters property from manga object mangaId:${mangaId}`)
        return parseChapters(data.data.manga.chapters, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data
        try {
            data = JSON.parse(response.data as string)
        } catch (e) {
            // Silently log errors
            console.log(`${e}`)
        }

        if (data?.errors) {
            await this.refreshAPIKey()
            throw new Error('API LIMIT EXCEEDED!\nTry doing to CloudFlare again bypass or come back later!')
        }

        if (!data.data?.chapter?.pages) throw new Error(`Failed to parse chapter or pages property from data object mangaId:${mangaId} chapterId:${chapterId}`)
        let pagesString = data.data.chapter.pages as string
        if (pagesString.startsWith('enc:v1')) {
            pagesString = await this.decryptPages(pagesString)
        }

        const pages: string[] = []

        try {
            const parsedPages = JSON.parse(pagesString)
            if (parsedPages.i && Array.isArray(parsedPages.i)) {
                for (const img of parsedPages.i) {
                    pages.push(`${MH_CDN_DOMAIN}/${parsedPages.p ?? ''}${img}`)
                }
            } else if (Array.isArray(parsedPages)) {
                for (const img of parsedPages) {
                    pages.push(img.startsWith('http') ? img : `${MH_CDN_DOMAIN}/${String(img).replace(/^\//, '')}`)
                }
            } else if (typeof parsedPages === 'object' && parsedPages !== null) {
                for (const img of Object.values(parsedPages)) {
                    pages.push(String(img).startsWith('http') ? String(img) : `${MH_CDN_DOMAIN}/${String(img).replace(/^\//, '')}`)
                }
            }
        } catch (e) {
            throw new Error(`Failed to parse chapter pages JSON: ${e}`)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        })
    }

    async decryptPages(pages: string): Promise<string> {
        const request = App.createRequest({
            url: `${MH_DOMAIN}/api/chapter-crypto`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Referer': `${MH_DOMAIN}/`,
                'User-Agent': await this.requestManager.getDefaultUserAgent(),
                'x-mhub-access': await this.getMhubAccess()
            }
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let cryptoParams: any
        try {
            cryptoParams = JSON.parse(response.data as string)
        } catch (e) {
            throw new Error(`Failed to parse chapter-crypto response: ${e}`)
        }

        const parts = pages.split(':')
        const keyId = parts[2]
        const iv = parts[3]
        const authTag = parts[4]
        const ciphertext = parts[5]

        if (!keyId || !iv || !authTag || !ciphertext) {
            throw new Error(`Malformed encrypted pages payload: ${pages}`)
        }

        const keyData = cryptoParams?.keys?.[keyId] ??
            (cryptoParams?.key && (!cryptoParams?.keyId || cryptoParams?.keyId === keyId) ? cryptoParams.key : undefined)

        if (!keyData) {
            throw new Error(`Decryption key not found for keyId: ${keyId}`)
        }

        const keyBytes = base64UrlToBytes(keyData)
        const ivBytes = base64UrlToBytes(iv)
        const authTagBytes = base64UrlToBytes(authTag)
        const cipherBytes = base64UrlToBytes(ciphertext)

        const combined = new Uint8Array(cipherBytes.length + authTagBytes.length)
        combined.set(cipherBytes, 0)
        combined.set(authTagBytes, cipherBytes.length)

        const cipher = gcm(keyBytes, ivBytes)
        const decryptedBytes = cipher.decrypt(combined)
        return new TextDecoder().decode(decryptedBytes)
    }

    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
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

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        let data
        try {
            data = JSON.parse(response.data as string)
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

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        try {
            const data = JSON.parse(response.data as string)
            parseHomeSections(data, sectionCallback)
        } catch (e) {
            throw new Error(`${e}`)
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0
        const request = App.createRequest({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data
        try {
            data = JSON.parse(response.data as string)
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

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0
        const searchTag = query?.includedTags?.map((x: Tag) => x.id)

        const requests = [
            //No Alt Titles
            {
                request: App.createRequest({
                    url: MH_API_DOMAIN,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
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
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
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
            promises.push(this.requestManager.schedule(req.request, 1).then((response) => {
                this.CloudFlareError(response.status)
                let data
                try {
                    data = JSON.parse(response.data as string)
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

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        // Remove stored UserAgent
        await this.stateManager.store('userAgent', 'null')

        return App.createRequest({
            url: `${MH_DOMAIN}/`,
            method: 'GET',
            headers: {
                'Referer': `${MH_DOMAIN}/`,
                'User-Agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }

    async refreshAPIKey() {
        const currentKey = await this.getMhubAccess()

        // Reset stored access key
        await this.stateManager.store('mhub_key', '')

        // Delete cookies
        this.requestManager?.cookieStore?.getAllCookies().forEach(x => { this.requestManager?.cookieStore?.removeCookie(x) })

        // Request new access token
        const request = App.createRequest({
            url: `${MH_DOMAIN}/`,
            method: 'GET',
            headers: {
                'Referer': `${MH_DOMAIN}/`,
                'User-Agent': await this.requestManager.getDefaultUserAgent(),
                'Cookie': currentKey ? `mhub_access=${currentKey};` : ''
            }
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        const cookieHeaders = response.headers['Set-Cookie']

        let mhub_key = ''
        if (cookieHeaders) {
            const match = /mhub_access=([^;]+)/.exec(cookieHeaders)
            if (match) {
                mhub_key = match[1] ?? ''
            }
        }

        if (mhub_key) {
            await this.stateManager.store('mhub_key', mhub_key)
            this.requestManager?.cookieStore?.addCookie(App.createCookie({
                name: 'mhub_access',
                value: mhub_key,
                domain: 'mangahub.io'
            }))
        }
    }

}