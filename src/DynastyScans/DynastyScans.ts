import {
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    TagSection,
    ContentRating,
    Request,
    Response,
    SourceIntents,
    SearchResultsProviding,
    ChapterProviding,
    MangaProviding,
    HomePageSectionsProviding,
    Tag,
    HomeSectionType,
    PartialSourceManga
} from '@paperback/types'

import {
    Chapters,
    Series,
    Doujin,
    RecentlyAdded
} from './Interface'

const DS_DOMAIN = 'https://dynasty-scans.com'

export const DynastyScansInfo: SourceInfo = {
    version: '2.0.0',
    name: 'Dynasty Scans',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from dynasty-scans.com.',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DS_DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class DynastyScans implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {

    constructor(private cheerio: CheerioAPI) { }

    requestManager = App.createRequestManager({
        requestsPerSecond: 10,
        requestTimeout: 20000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${DS_DOMAIN}/`,
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

    stateManager = App.createSourceStateManager()

    getMangaShareUrl(mangaId: string): string { return `${DS_DOMAIN}/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/${mangaId}.json`, // series/alice_quartet or doujins/alice_quartet
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data: Doujin | Series = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const author = data.tags.filter(x => x.type == 'Author')
        const status = data.tags.find(x => x.type == 'Status')

        const arrayTags: Tag[] = []
        for (const tag of data.tags.filter(x => x.type == 'General')) {
            const label = tag.name
            const id = tag.permalink
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

        let description
        if (data.description) {
            const $ = this.cheerio.load(`<div>${data.description}</div>`)
            description = $('div').text().trim()
        } else {
            description = `Tags: ${data.tags.map((x: { name: string }) => x.name).join(', ')}`
        }

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [...[data.name], ...data.aliases],
                image: await this.getOrSetThumbnail('SET', mangaId, DS_DOMAIN + data.cover),
                status: status ? status.name : 'Ongoing',
                author: author[0]?.name ? author[0].name : 'Unknown',
                artist: author[1]?.name ? author[1].name : author[0]?.name ? author[0].name : 'Unknown',
                tags: tagSections,
                desc: description
            })
        })

    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/${mangaId}.json`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const seriesData = data as Series
        const doujinData = data as Doujin

        const chapters: Chapter[] = []

        const chapterRegex = /Chapter (\d+(\.\d+)?)/
        const volumeRegex = /Volume (\d+(\.\d+)?)/

        let sortingIndex = 0
        switch (data.type) {
            // For doujin/alice_quartet
            case 'Doujin':
                for (const chapter of doujinData.taggings.reverse()) {
                    if (!chapter.permalink || !chapter.title) continue

                    const chapNumRegex = chapter.title.match(chapterRegex)
                    let chapNum = 0
                    if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

                    const volNumRegex = chapter.title.match(volumeRegex)
                    let volNum = 0
                    if (volNumRegex && volNumRegex[1]) volNum = Number(volNumRegex[1])

                    chapters.push({
                        id: chapter.permalink,
                        name: chapter.title,
                        langCode: '🇬🇧',
                        chapNum: chapNum,
                        sortingIndex,
                        group: chapter.tags.map(x => x.name).join(', '),
                        time: new Date(chapter.released_on),
                        volume: volNum
                    })
                    sortingIndex--
                }
                break
            // For series/alice_quartet
            case 'Series':
                for (const chapter of seriesData.taggings.reverse()) {
                    if (!chapter.permalink || !chapter.title) continue

                    const chapNumRegex = chapter.title.match(chapterRegex)
                    let chapNum = 0
                    if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

                    const volNumRegex = chapter.title.match(volumeRegex)
                    let volNum = 0
                    if (volNumRegex && volNumRegex[1]) volNum = Number(volNumRegex[1])

                    chapters.push({
                        id: chapter.permalink,
                        name: chapter.title,
                        langCode: '🇬🇧',
                        chapNum: chapNum,
                        sortingIndex,
                        time: new Date(chapter.released_on),
                        volume: volNum,
                        group: ''
                    })
                    sortingIndex--
                }
                break
            // For chapters/alice_quartet (Not used)
            default:
                break
        }

        if (chapters.length == 0) {
            throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
        }

        return chapters.map(chapter => {
            chapter.sortingIndex += chapters.length
            return App.createChapter(chapter)
        })
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/chapters/${chapterId}.json`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data: Chapters = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const images: string[] = []

        for (const image of data.pages) {
            images.push(DS_DOMAIN + image.url)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: images
        })

    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/chapters/added.json`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data: RecentlyAdded = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const sections = [
            App.createHomeSection({
                id: 'recently_added', title: 'Recently Added', type: HomeSectionType.singleRowNormal, containsMoreItems: true
            }),
            App.createHomeSection({
                id: 'recently_added_doujin', title: 'Recently Added Douijins', type: HomeSectionType.singleRowNormal, containsMoreItems: true
            }),
            App.createHomeSection({
                id: 'recently_added_series', title: 'Recently Added Series', type: HomeSectionType.singleRowNormal, containsMoreItems: true
            })
        ]

        for (const section of sections) {
            const sectionItems: PartialSourceManga[] = []
            const items = data.chapters

            switch (section.id) { // Doujins only
                case 'recently_added_doujin':
                    for (const item of items.filter(x => !x.series).slice(0, 10)) {
                        const id = item.tags.find(t => t.type == 'Doujin')

                        if (!id) continue
                        sectionItems.push(App.createPartialSourceManga({
                            mangaId: `doujins/${id?.permalink}`,
                            image: await this.getOrSetThumbnail('FETCH', `doujins/${id?.permalink}`),
                            title: item.title,
                            subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                        }))
                    }
                    break

                case 'recently_added_series': // Series only
                    for (const item of items.filter(x => x.series).slice(0, 10)) {
                        const id = item.tags.find(t => t.type == 'Series')

                        if (!id) continue
                        sectionItems.push(App.createPartialSourceManga({
                            mangaId: `series/${id?.permalink}`,
                            image: await this.getOrSetThumbnail('FETCH', `series/${id?.permalink}`),
                            title: item.title,
                            subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                        }))
                    }
                    break
                default: // Mixed
                    for (const item of items.slice(0, 10)) {
                        let id = ''
                        if (item.series) {
                            const sId = item.tags.find(t => t.type == 'Series')
                            id = `series/${sId?.permalink}`
                        } else {
                            const dId = item.tags.find(t => t.type == 'Doujin')
                            id = `doujins/${dId?.permalink}`
                        }

                        if (!id) continue
                        sectionItems.push(App.createPartialSourceManga({
                            mangaId: id,
                            image: await this.getOrSetThumbnail('FETCH', id),
                            title: item.title,
                            subtitle: item.tags.map(t => t.name).join(', ')
                        }))
                    }
                    break
            }


            section.items = [...new Map(sectionItems.map(x => [x.mangaId, x])).values()]
            sectionCallback(section)
        }

    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = App.createRequest({
            url: `${DS_DOMAIN}/chapters/added.json?page=${page}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data: RecentlyAdded = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const sectionItems: PartialSourceManga[] = []
        const items = data.chapters

        switch (homepageSectionId) { // Doujins only
            case 'recently_added_doujin':
                for (const item of items.filter(x => !x.series)) {
                    const id = item.tags.find(t => t.type == 'Doujin')

                    if (!id) continue
                    sectionItems.push(App.createPartialSourceManga({
                        mangaId: `doujins/${id?.permalink}`,
                        image: await this.getOrSetThumbnail('GET', `doujins/${id?.permalink}`),
                        title: item.title,
                        subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                    }))
                }
                break

            case 'recently_added_series': // Series only
                for (const item of items.filter(x => x.series)) {
                    const id = item.tags.find(t => t.type == 'Series')

                    if (!id) continue
                    sectionItems.push(App.createPartialSourceManga({
                        mangaId: `series/${id?.permalink}`,
                        image: await this.getOrSetThumbnail('GET', `series/${id?.permalink}`),
                        title: item.title,
                        subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                    }))
                }
                break
            default: // Mixed
                for (const item of items) {
                    let id = ''
                    if (item.series) {
                        const sId = item.tags.find(t => t.type == 'Series')
                        id = `series/${sId?.permalink}`
                    } else {
                        const dId = item.tags.find(t => t.type == 'Doujin')
                        id = `doujins/${dId?.permalink}`
                    }

                    if (!id) continue
                    sectionItems.push(App.createPartialSourceManga({
                        mangaId: id,
                        image: await this.getOrSetThumbnail('GET', id),
                        title: item.title,
                        subtitle: item.tags.map(t => t.name).join(', ')
                    }))
                }
                break
        }


        metadata = data.current_page < data.total_pages ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: [...new Map(sectionItems.map(x => [x.mangaId, x])).values()],
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const tagSections: TagSection[] = []

        let getMore = true
        let page = 1
        while (getMore) {
            const request = App.createRequest({
                url: `${DS_DOMAIN}/tags.json?page=${page++}`,
                method: 'GET'
            })

            const response = await this.requestManager.schedule(request, 1)
            const data: any = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

            for (const tagType of data.tags) {

                for (const key of Object.keys(tagType)) {
                    const tags: Tag[] = []

                    for (const tag of tagType[key]) {
                        tags.push({
                            id: tag.permalink,
                            label: tag.name
                        })
                    }
                    tagSections.push(App.createTagSection({ id: key, label: key, tags: tags.map(x => App.createTag(x)) }))
                }
            }

            if (data.current_page >= data.total_pages) {
                getMore = false
            }
        }

        return tagSections
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {

        async function getTagId(global: any, tags: Tag[]) {
            const tagIds: string[] = []

            for (const tag of tags) {
                const request = App.createRequest({
                    url: `${DS_DOMAIN}/tags/suggest?query=${tag.label}`,
                    method: 'POST'
                })

                const response = await global.requestManager.schedule(request, 1)
                const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

                const tagId = data.find((x: { type: string; }) => x.type == 'General')
                tagIds.push(tagId.id)
            }

            return tagIds
        }

        let tagString = ''
        const includedTagIds = await getTagId(this, query?.includedTags)
        if (includedTagIds.length > 0) {
            tagString = tagString + includedTagIds.map(x => '&with%5B%5D=' + x).join()
        }

        const excludedTagIds = await getTagId(this, query?.excludedTags)
        if (includedTagIds.length > 0) {
            tagString = tagString + excludedTagIds.map(x => '&without%5B%5D=' + x).join()
        }

        const page: number = metadata?.page ?? 1

        const request = App.createRequest({
            url: `${DS_DOMAIN}/search?page=${page}&q=${encodeURI(query?.title ?? '')}&classes%5B%5D=Doujin&classes%5B%5D=Series${tagString}&sort=`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)

        const results: PartialSourceManga[] = []

        for (const item of $('dl.chapter-list > dd').toArray()) {
            const id = $('a.name', item).attr('href')?.replace(/\/$/, '') ?? ''
            const title = $('a.name', item).text().trim() ?? ''
            const tags = $('span.tags > a', item).toArray().map(x => $(x).text().trim()).join(', ')

            if (!id || !title) continue

            results.push(App.createPartialSourceManga({
                mangaId: id,
                image: await this.getOrSetThumbnail('FETCH', id),
                title: title,
                subtitle: tags
            }))
        }


        metadata = { page: page + 1 }
        return App.createPagedResults({ results: results })
    }

    async getOrSetThumbnail(method: 'GET' | 'SET' | 'FETCH', mangaId: string, coverURL?: string): Promise<string> {

        async function fetchThumbnail(global: any) {
            const request = App.createRequest({
                url: `${DS_DOMAIN}/${mangaId}.json`, // series/alice_quartet or doujins/alice_quartet
                method: 'GET'
            })

            const response = await global.requestManager.schedule(request, 1)
            const data: Doujin | Series = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

            return data.cover ? DS_DOMAIN + data.cover : ''
        }

        const hasCover = await this.stateManager.retrieve(mangaId) as string ?? ''

        let cover = ''
        switch (method) {
            case 'GET':
                cover = hasCover
                break
            case 'SET':
                if (!coverURL) {
                    throw new Error('Cannot set new cover with providing a coverURL!')
                }

                await this.stateManager.store(mangaId, coverURL)
                cover = coverURL
                break
            case 'FETCH':
                if (hasCover) {
                    cover = hasCover
                    break
                }

                cover = await fetchThumbnail(this)
                await this.stateManager.store(mangaId, cover)
                break
        }
        return cover
    }
}