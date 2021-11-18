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
    //TagSection,
    ContentRating,
    MangaTile
} from 'paperback-extensions-common'
import {
    parseUpdatedManga,
    isLastPage,
    //parseTags,
    parseChapters,
    parseMangaDetails,
    parseSearch,
    parseViewMore,
    UpdatedManga,
    parseHomeSections
} from './MangahubParser'

const MH_DOMAIN = 'https://mangahub.io'
const MH_API_DOMAIN = 'https://api.mghubcdn.com/graphql'
//const MH_CDN_DOMAIN = 'https://img.mghubcdn.com'


export const MangahubInfo: SourceInfo = {
    version: '2.0.0',
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
            type: TagType.GREEN
        }
    ]
}

export class Mangahub extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
    })

    override getMangaShareUrl(mangaId: string): string { return `${MH_DOMAIN}/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: `query {
                manga(x: m01, slug: "sweet-guy_132") {
                    author
                    image
                    artist
                    genres
                    status
                    description
                    title
                    alternativeTitle
                }
             }`
        })





        const response = await this.requestManager.schedule(request, 1)
        console.log('REQ')
        console.log(JSON.stringify(request.url))
        console.log(JSON.stringify(request.method))
        console.log(JSON.stringify(request.headers))
        console.log(JSON.stringify(request.data))
        console.log('RES')
        console.log(JSON.stringify(response.data))

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            console.log(e)
        }
        if (!data?.manga) throw new Error(`Failed to parse manga property from data object mangaId:${mangaId}`)
        return parseMangaDetails(data, mangaId)
    }

    //TODO
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${MH_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapters($, mangaId)
    }

    //TODO
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {

        const request = createRequestObject({
            url: 'https://api.mghubcdn.com/graphql',
            method: 'POST',
            /// data: `{\"query\":\"{chapter(x:m01,slug:\\\"${mangaId}\\\",number:${chapterNumber}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`
        })

        let response = await this.requestManager.schedule(request, 1)
        response = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
        const data = Object(response.data)
        if (!data?.chapter) throw new Error('Missing "chapter" property!')
        if (!data.chapter?.pages) throw new Error('Missing "pages" property!')
        const rawPages = JSON.parse(data.chapter.pages)

        const pages: string[] = []
        for (const i in rawPages) {
            pages.push('https://img.mghubcdn.com/file/imghub/' + rawPages[i])
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })
    }
    /*
        override async getTags(): Promise<TagSection[]> {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/search`,
                method: 'GET',
            })
    
            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)
            return //parseTags($)
        }
        */

    //TODO
    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let updatedManga: UpdatedManga = {
            ids: [],
        }

        const request = createRequestObject({
            url: MH_DOMAIN,
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

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: '{"query": "{ latestPopular(x: m01) {id title slug image latestChapter } latest(x: m01, limit: 30) { id title slug image latestChapter } search(x: m01, mod: POPULAR, limit: 30) { rows { id title slug image latestChapter }}}"}'
        })

        const response = await this.requestManager.schedule(request, 1)
        try {
            const data = JSON.parse(response.data)
            parseHomeSections(data, sectionCallback)
        } catch (e) {
            console.log(e)
        }

    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0
        let query = ''
        switch (homepageSectionId) {
            case 'hot_manga':
                query = `{"query": "{search(x:m01,mod:LATEST,count:true,offset:${offset}){rows{id,rank,title,slug,status,author,genres,image,latestChapter,unauthFile,createdDate},count}}"}`
                break
            case 'latest_updates':
                query = `{"query": "{search(x:m01,mod:POPULAR,count:true,offset:${offset}){rows{id,rank,title,slug,status,author,genres,image,latestChapter,unauthFile,createdDate},count}}"}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: query,
        })

        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            console.log(e)
        }

        const manga = parseViewMore(data)
        metadata = { offset: offset + 30 }

        return createPagedResults({
            results: manga,
            metadata
        })

    }
    
    //TODO
    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const search = encodeURI(query?.title ?? '')
        const request = createRequestObject({
            url: MH_DOMAIN,
            method: 'GET',
            param: `/search/page/${page}?q=${search}&order=POPULAR&genre=all`
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }
}
