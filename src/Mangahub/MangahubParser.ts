import {
    Chapter,
    Tag,
    HomeSection,
    SourceManga,
    PartialSourceManga,
    TagSection,
    HomeSectionType
} from '@paperback/types'

import { decode as decodeHTMLEntity } from 'html-entities'

const MH_CDN_THUMBS_DOMAIN = 'https://thumb.mghcdn.com'

export const parseMangaDetails = (data: any, mangaId: string): SourceManga => {
    const titles: string[] = []

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

    const arrayTags: Tag[] = []
    for (const tag of data.genres.split(',')) {
        const label = tag
        const id = tag.toLowerCase().replace(' ', '-')

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    let status = 'ONGOING'
    switch (data.status.toUpperCase()) {
        case 'ONGOING':
            status = 'Ongoing'
            break
        case 'COMPLETED':
            status = 'Completed'
            break
        default:
            status = 'Ongoing'
            break
    }
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: data?.image ? `${MH_CDN_THUMBS_DOMAIN}/${data.image}` : '',
            status: status,
            author: author == '' ? '' : author,
            artist: artist == '' ? '' : artist,
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapters = (data: any, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of data) {
        const number = chapter.number
        const title = chapter.title ? chapter.title : 'Chapter ' + number
        const date = new Date(chapter.date)

        chapters.push(App.createChapter({
            id: String(number),
            name: title,
            langCode: '🇬🇧',
            chapNum: number,
            time: date
        }))
    }

    if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
    }

    return chapters
}

export const parseHomeSections = (data: any, sectionCallback: (section: HomeSection) => void): void => {
    const sections = [
        {
            data: data.data.popular.rows,
            section: App.createHomeSection({
                id: 'popular_manga',
                title: 'Popular Manga',
                containsMoreItems: true,
                type: HomeSectionType.singleRowLarge
            })
        },
        {
            data: data.data.latest_popular,
            section: App.createHomeSection({
                id: 'popular_update',
                title: 'Popular Updates',
                containsMoreItems: false,
                type: HomeSectionType.singleRowNormal
            })
        },
        {
            data: data.data.latest,
            section: App.createHomeSection({
                id: 'latest_update',
                title: 'Latest Updates',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            })
        },
        {
            data: data.data.new.rows,
            section: App.createHomeSection({
                id: 'new_manga',
                title: 'New Manga',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            })
        },
        {
            data: data.data.completed.rows,
            section: App.createHomeSection({
                id: 'completed_manga',
                title: 'Completed Manga',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            })
        }
    ]

    const collectedIds: string[] = []

    for (const section of sections) {
        const mangaItemsArray: PartialSourceManga[] = []

        for (const manga of section.data) {
            const title = manga.title
            const id = manga.slug
            const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : '*'
            const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''

            if (!id || !title || collectedIds.includes(manga.id)) continue
            mangaItemsArray.push(App.createPartialSourceManga({
                image: image,
                title: decodeHTMLEntity(title),
                mangaId: id,
                subtitle: subtitle
            }))

            collectedIds.push(manga.id)
        }
        section.section.items = mangaItemsArray
        sectionCallback(section.section)
    }
}

export const parseViewMore = (homepageSectionId: string, data: any): PartialSourceManga[] => {
    const collectedIds: string[] = []

    let mangaData
    switch (homepageSectionId) {
        case 'latest_update':
            mangaData = data.data.latest.rows
            break
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

    const moreManga: PartialSourceManga[] = []
    for (const manga of mangaData) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : ''
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''

        if (!id || !title || collectedIds.includes(manga.id)) continue
        moreManga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
        collectedIds.push(manga.id)
    }
    return moreManga
}

export const parseSearch = (data: any): PartialSourceManga[] => {
    const collectedIds: string[] = []
    const searchResults: PartialSourceManga[] = []

    for (const manga of data.data.search.rows) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : ''
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''

        if (!id || !title || collectedIds.includes(manga.id)) continue
        searchResults.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
        collectedIds.push(manga.id)
    }
    return searchResults
}