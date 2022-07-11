import {
    Chapter,
    Tag,
    HomeSection,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
    HomeSectionType
} from 'paperback-extensions-common'

import entities = require('entities')

export interface UpdatedManga {
    ids: string[];
    loadMore: boolean
}

const MH_CDN_THUMBS_DOMAIN = 'https://thumb.mghubcdn.com'

export const parseMangaDetails = (data: any, mangaId: string): Manga => {

    const titles = []
    titles.push(decodeHTMLEntity(data.title)) //Main Title

    if (data.alternativeTitle) {
        for (const title of data.alternativeTitle.split(/\\|;/)) {
            if (title == '') continue
            titles.push(decodeHTMLEntity(title.trim()))
        }
    }

    const author = decodeHTMLEntity(data.author ?? '')
    const artist = decodeHTMLEntity(data.artist ?? '')
    const description = decodeHTMLEntity(data.description ?? 'No description available')

    let hentai = false

    const arrayTags: Tag[] = []
    for (const tag of data.genres.split(',')) {
        const label = tag
        const id = tag.toLowerCase().replace(' ', '-')
        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase()) || data.isPorn || data.isSoftPorn) hentai = true
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    let status = MangaStatus.ONGOING
    switch (data.status.toUpperCase()) {
        case 'ONGOING':
            status = MangaStatus.ONGOING
            break
        case 'COMPLETED':
            status = MangaStatus.COMPLETED
            break
        default:
            status = MangaStatus.ONGOING
            break
    }

    return createManga({
        id: mangaId,
        titles: titles,
        image: data?.image ? `${MH_CDN_THUMBS_DOMAIN}/${data.image}` : 'https://i.imgur.com/GYUxEX8.png',
        status: status,
        author: author == '' ? 'Unknown' : author,
        artist: artist == '' ? 'Unknown' : artist,
        tags: tagSections,
        desc: description,
        hentai: hentai
    })
}

export const parseChapters = (data: any, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of data) {
        const number = chapter.number
        const title = chapter.title ? chapter.title : 'Chapter ' + number
        const date = new Date(chapter.date)
        chapters.push(createChapter({
            id: String(number),
            mangaId: mangaId,
            name: title,
            langCode: LanguageCode.ENGLISH,
            chapNum: number,
            time: date,
        }))
    }
    return chapters
}

export const parseUpdatedManga = (data: any, time: Date, ids: string[]): UpdatedManga => {
    const updatedManga: string[] = []
    let loadMore = true

    for (const manga of data.data.search.rows) {
        const id = manga.slug ?? ''
        const mangaDate = new Date(manga.updatedDate)
        if (!id) continue
        if (mangaDate > time) {
            if (ids.includes(id)) {
                updatedManga.push(id)
            }
        } else {
            loadMore = false
        }
    }
    return {
        ids: updatedManga,
        loadMore

    }
}

export const parseHomeSections = (data: any, sectionCallback: (section: HomeSection) => void): void => {

    const sections = [
        {
            data: data.data.popular.rows,
            section: createHomeSection({ id: 'popular_manga', title: 'Popular Manga', view_more: true, type: HomeSectionType.singleRowLarge })
        },
        {
            data: data.data.latest_popular,
            section: createHomeSection({ id: 'popular_update', title: 'Popular Updates', view_more: false })
        },
        {
            data: data.data.latest,
            section: createHomeSection({ id: 'latest_update', title: 'Latest Updates', view_more: false })
        },
        {
            data: data.data.new.rows,
            section: createHomeSection({ id: 'new_manga', title: 'New Manga', view_more: true })
        },
        {
            data: data.data.completed.rows,
            section: createHomeSection({ id: 'completed_manga', title: 'Completed Manga', view_more: true })
        }
    ]


    const collectedIds: string[] = []

    for (const section of sections) {
        const mangaItemsArray: MangaTile[] = []

        for (const manga of section.data) {
            const title = manga.title
            const id = manga.slug
            const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : 'https://i.imgur.com/GYUxEX8.png'
            const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''
            if (!id || !title || collectedIds.includes(manga.id)) continue
            mangaItemsArray.push(createMangaTile({
                id: id,
                image: image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }))
            collectedIds.push(manga.id)

        }
        section.section.items = mangaItemsArray
        sectionCallback(section.section)
    }
}

export const parseViewMore = (homepageSectionId: string, data: any,): MangaTile[] => {

    const collectedIds: string[] = []
    let mangaData

    switch (homepageSectionId) {
        case 'popular_manga':
            mangaData = data.data.popular.rows
            break
        case 'new_manga':
            mangaData = data.data.new.rows
            break
        case 'completed_manga':
            mangaData = data.data.completed.rows
            break
    }



    const moreManga: MangaTile[] = []

    for (const manga of mangaData) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : 'https://i.imgur.com/GYUxEX8.png'
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''

        if (!id || !title || collectedIds.includes(manga.id)) continue

        moreManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
        collectedIds.push(manga.id)

    }
    return moreManga
}

export const parseSearch = (data: any): any[] => {

    const collectedIds: string[] = []
    const searchResults: MangaTile[] = []
    for (const manga of data.data.search.rows) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : 'https://i.imgur.com/GYUxEX8.png'
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''
        if (!id || !title || collectedIds.includes(manga.id)) continue
        searchResults.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
        collectedIds.push(manga.id)

    }
    return searchResults
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}