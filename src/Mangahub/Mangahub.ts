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
    Tag,
    ContentRating,
} from 'paperback-extensions-common'
import {
    parseUpdatedManga,
    parseChapters,
    parseMangaDetails,
    parseViewMore,
    UpdatedManga,
    parseHomeSections
} from './MangahubParser'

const MH_DOMAIN = 'https://mangahub.io'
const MH_API_DOMAIN = 'https://api.mghubcdn.com/graphql'
const MH_CDN_DOMAIN = 'https://img.mghubcdn.com/file/imghub/'


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
        requestsPerSecond: 3,
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
                 }`,
            }
        })

        const response = await this.requestManager.schedule(request, 1)

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
        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
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
                 }`,
            }
        })

        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if (!data.data?.manga) throw new Error(`Failed to parse manga property from data object mangaId:${mangaId}`)
        if (data.data.manga.chapters?.length == 0) throw new Error(`Failed to parse chapters property from manga object mangaId:${mangaId}`)
        return parseChapters(data.data.manga.chapters, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: {
                query: `query {
                    chapter(x: m01, slug: "${mangaId}", number: ${chapterId}) {
                      pages
                      title
                      slug
                    }
                  }
                  `,
            }
        })

        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if (!data.data?.chapter?.pages) throw new Error(`Failed to parse chapter or pages property from data object mangaId:${mangaId} chapterId:${chapterId}`)

        const pages = []
        try {
            const parsedPages = JSON.parse(data.data.chapter.pages)
            for (const i in parsedPages) {
                pages.push(MH_CDN_DOMAIN + parsedPages[i])
            }
        } catch (e) {
            throw new Error(`${e}`)
        }

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: {
                query: `query {
                    genres {
                      id
                      slug
                      title
                    }
                }`,
            }
        })

        const response = await this.requestManager.schedule(request, 1)

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
        return [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let updatedManga: UpdatedManga = {
            ids: [],
            loadMore: true
        }

        let offset = 0
        while (updatedManga.loadMore) {
            const request = createRequestObject({
                url: MH_API_DOMAIN,
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                data: {
                    query: `query {
                        search (x: m01, mod: LATEST, offset: ${offset}, limit: 100){
                          rows {
                            id
                            title
                            slug
                            latestChapter
                            updatedDate
                          }
                        }
                      }`,
                }
            })

            const response = await this.requestManager.schedule(request, 1)

            let data
            try {
                data = JSON.parse(response.data)
            } catch (e) {
                throw new Error(`${e}`)
            }
            offset = offset + 100
            updatedManga = parseUpdatedManga(data, time, ids)
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }))
            }
        }
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: {
                query: `query {
                    latestPopular(x: m01) {
                        id
                        title
                        slug
                        image
                        latestChapter
                      }
                      latest(x: m01, limit: 30) {
                        id
                        title
                        slug
                        image
                        latestChapter
                      }
                      search(x: m01, mod: POPULAR, limit: 30) {
                        rows {
                          id
                          title
                          slug
                          image
                          latestChapter
                        }
                      }
                    }`,
            }
        })

        const response = await this.requestManager.schedule(request, 1)
        try {
            const data = JSON.parse(response.data)
            parseHomeSections(data, sectionCallback)
        } catch (e) {
            throw new Error(`${e}`)
        }

    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0
        let mod = ''
        switch (homepageSectionId) {
            case 'popular_manga':
                mod = 'POPULAR'
                break
            case 'latest_updates':
                mod = 'LATEST'
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
            data: {
                query: `query {
                    search(x:m01,mod:${mod},offset:${offset}){
                    rows
                    {
                      id    
                      rank
                      title
                      slug
                      author
                      image
                      latestChapter
                    },
                  }
                }`,
            }
        })

        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseViewMore(data)
        metadata = { offset: offset + 30 }

        return createPagedResults({
            results: manga,
            metadata
        })

    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const offset: number = metadata?.offset ?? 0

        const searchTag: any = query?.includedTags?.map((x: any) => x.id)

        const request = createRequestObject({
            url: MH_API_DOMAIN,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: {
                query: `query {
                    search (x: m01, alt: true, q: "${query?.title ? query.title : ''}", genre: "${searchTag[0] ? searchTag[0] : ''}", offset: ${offset}){
                      rows {
                        id
                        title
                        slug
                        image
                        latestChapter
                        genres
                      }
                    }
                  }`,
            }
        })

        const response = await this.requestManager.schedule(request, 1)

        
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseViewMore(data)
        metadata = { offset: offset + 30 }
        return createPagedResults({
            results: manga,
            metadata
        })
    }
}
