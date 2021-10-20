import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    MangaUpdates,
    TagType,
    TagSection,
    MangaTile,
    ContentRating,
    Request
} from 'paperback-extensions-common'
import {
    parseUpdatedManga,
    parseChapterDetails,
    isLastPage,
    parseTags,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore,
    UpdatedManga,
} from './ReadmParser'

const RM_DOMAIN = 'https://readm.org'

export const ReadmInfo: SourceInfo = {
    version: '2.0.1',
    name: 'Readm',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from Readm.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: RM_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Cloudflare',
            type: TagType.RED
        }
    ]
}

export class Readm extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
    })


    override getMangaShareUrl(mangaId: string): string { return `${RM_DOMAIN}/manga/${mangaId}` }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${RM_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId,
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${RM_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapters($, mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${RM_DOMAIN}/manga/${mangaId}/${chapterId}`,
            method: 'GET',
            param: '/all-pages'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data, { xmlMode: false })
        return parseChapterDetails($, mangaId, chapterId)
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: RM_DOMAIN,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseTags($) || []
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page = 1
        let updatedManga: UpdatedManga = {
            ids: [],
            loadMore: true
        }

        while (updatedManga.loadMore) {
            const request = createRequestObject({
                url: `${RM_DOMAIN}/latest-releases/${page++}`,
                method: 'GET',
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)

            updatedManga = parseUpdatedManga($, time, ids)
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }))
            }
        }

    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: RM_DOMAIN,
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
            case 'popular_manga':
                param = `/popular-manga/${page}`
                break
            case 'latest_updates':
                param = `/latest-releases/${page}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = createRequestObject({
            url: RM_DOMAIN,
            method: 'GET',
            param,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const manga = parseViewMore($, homepageSectionId)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        //Regular search
        if (query.title) {
            const request = createRequestObject({
                url: `${RM_DOMAIN}/service/search`,
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-type': 'application/x-www-form-urlencoded',
                },
                data: `dataType=json&phrase=${encodeURI(query.title)}`
            })

            let response = await this.requestManager.schedule(request, 1)
            response = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data
            const data = Object(response)


            if (!data.manga) throw new Error('API Error: Failed to create proper response object, missing manga property!')

            //Create the search results
            const manga: MangaTile[] = []
            for (const m of data.manga) {
                if (!m.url || !m.title) {
                    console.log('Missing URL or Title property in manga object!')
                    continue
                }

                const id: string = m.url.replace('/manga/', '')
                const image: string = RM_DOMAIN + m.image
                const title: string = m.title

                if (!id || !title) continue

                manga.push(createMangaTile({
                    id,
                    image: image,
                    title: createIconText({ text: title }),
                }))
            }

            return createPagedResults({
                results: manga,
            })

            //Genre search, no advanced search since it requires reCaptcha
        } else {
            const request = createRequestObject({
                url: `${RM_DOMAIN}/category/${query?.includedTags?.map((x: any) => x.id)[0]}/watch/${page}`,
                method: 'GET',
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)
            const manga = parseViewMore($, 'hot_manga')
            metadata = !isLastPage($) ? { page: page + 1 } : undefined
            return createPagedResults({
                results: manga,
                metadata
            })

        }
    }

    override getCloudflareBypassRequest(): Request {
        return createRequestObject({
            url: RM_DOMAIN,
            method: 'GET',
        })
    }
}