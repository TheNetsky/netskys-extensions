import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SearchRequest,
    PagedResults,
    SourceInfo,
    MangaUpdates,
    TagType,
    ContentRating,
    LanguageCode,
    MangaStatus,
    MangaTile,
} from 'paperback-extensions-common'

const GUYA_DOMAIN = 'https://guya.cubari.moe'
const GUYA_API_BASE = 'https://guya.cubari.moe/api'

export const GuyaInfo: SourceInfo = {
    version: '2.0.0',
    name: 'Guya',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from Guya.moe.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: GUYA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class Guya extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 10000
    })


    override getMangaShareUrl(mangaId: string): string { return `${GUYA_DOMAIN}/read/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${GUYA_API_BASE}/series_page_data/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const titles = [].concat(data.series).concat(data.alt_titles)

        return createManga({
            id: mangaId,
            titles: titles,
            image: data.cover_vol_url ? GUYA_DOMAIN + data.cover_vol_url : 'https://i.imgur.com/GYUxEX8.png',
            status: MangaStatus.ONGOING,
            author: data.metadata[0][1],
            artist: data.metadata[1][1],
            desc: data.synopsis,
        })
    }


    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${GUYA_API_BASE}/series/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const rawChapters = data.chapters

        const chapters = []

        for (const c in rawChapters) {
            const chapter = rawChapters[c]
            for (const group in chapter.groups) {
                chapters.push(createChapter({
                    id: `${c}&&${chapter.folder}&&${group}`,
                    mangaId: mangaId,
                    name: chapter.title,
                    langCode: LanguageCode.ENGLISH,
                    chapNum: isNaN(Number(c)) ? 0 : Number(c),
                    volume: chapter.volume,
                    time: new Date(chapter.release_date[group] * 1000),
                }))
            }
        }

        return chapters
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${GUYA_API_BASE}/series/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const rawChapters = data.chapters

        const [chapterNum, storage, group] = chapterId.split('&&')
        storage
        group

        const pages = []
        const images = rawChapters[Number(chapterNum)].groups[Number(group)]

        for (const image of images) {
            pages.push(`${GUYA_DOMAIN}/media/manga/${mangaId}/chapters/${storage}/${group}/${image}`)
        }

        return createChapterDetails({
            id: chapterId,
            longStrip: false,
            mangaId: mangaId,
            pages: pages
        })


        return createChapterDetails({
            id: chapterId,
            longStrip: false,
            mangaId: mangaId,
            pages: []
        })


        //`${GUYA_API_BASE}/media/manga/${mangaId}/chapters/${rawChapters[chapter]["folder"]}/${group}/${page}`

    }


    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {

        const request = createRequestObject({
            url: `${GUYA_API_BASE}/get_all_series`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const updatedManga: string[] = []
        for (const item in data) {
            const manga = data[item]
            const mangaDate = new Date(manga.last_updated * 1000)
            const id = manga.slug

            if (mangaDate > time) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
            }
        }

        if (updatedManga.length > 0) {
            mangaUpdatesFoundCallback(createMangaUpdates({
                ids: updatedManga
            }))

        }

    }


    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: `${GUYA_API_BASE}/get_all_series`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const sections = [
            createHomeSection({ id: 'guya_featured', title: 'Featured Items', type: HomeSectionType.featured })
        ]
        const mangaArray: MangaTile[] = []

        for (const item in data) {
            const manga = data[item]
            const id = manga.slug

            mangaArray.push(createMangaTile({
                id: id,
                image: manga.cover ? GUYA_DOMAIN + manga.cover : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: item })
            }))
        }

        for (const section of sections) {
            section.items = mangaArray
            sectionCallback(section)
        }

    }

    
    async getSearchResults(query: SearchRequest): Promise<PagedResults> {
        const request = createRequestObject({
            url: `${GUYA_API_BASE}/get_all_series`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const searchQuery = query.title ? query.title.toLowerCase() : ''

        const searchFiltered = Object.keys(data).filter((e) => e.toLowerCase().includes(searchQuery))

        const results: MangaTile[] = []

        for (const item of searchFiltered) {
            const manga = data[item]
            manga
            results.push(createMangaTile({
                id: manga.slug,
                image: manga.cover ? GUYA_DOMAIN + manga.cover : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: item })
            }))
        }
        return createPagedResults({ results: results })
    }

}