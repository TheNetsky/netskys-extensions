/* eslint-disable linebreak-style */
import {
    Chapter,
    ChapterDetails,
    Tag,
    HomeSection,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection
} from 'paperback-extensions-common'

import entities = require('entities')

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

    const titles = []
    titles.push(decodeHTMLEntity($('h1.heading').first().text().trim()))

    const altTitles = $('div.alt_name').text().split(';')
    for (const title of altTitles) {
        titles.push(decodeHTMLEntity(title.trim()))
    }

    const image = $('div.media div.cover img').attr('src')
    const author = $('.author').text().trim()
    const description = decodeHTMLEntity($('.summary > p').text().trim())

    let hentai = false

    const arrayTags: Tag[] = []
    for (const tag of $('.genres > a').toArray()) {
        const label = $(tag).text().trim()
        const id = $(tag).attr('href')?.split('genre/')[1] ?? ''
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus = $('.value.status').text().trim()
    let status = MangaStatus.ONGOING
    switch (rawStatus.toUpperCase()) {
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
        image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
        status: status,
        author: author,
        tags: tagSections,
        desc: description,
        hentai
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const elem of $('tr:has(.chapter)').toArray()) {
        const title = $('a', elem).text()
        const date = new Date($('.update_time', elem).text() ?? '')
        const chapterId = $('a', elem).attr('href')?.split('/').pop()

        if (!chapterId) continue

        const chapRegex = chapterId?.match(/c([0-9.]+)/)
        let chapNum = 0
        if (chapRegex && chapRegex[1]) chapNum = Number(chapRegex[1])

        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: title,
            langCode: LanguageCode.ENGLISH,
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: date,
        }))
    }
    return chapters
}

export const parseChapterDetails = (data: string, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    const imageArray = data.match(/var ytaw=\[(.*?)\]/)

    let images: string[] = []
    if (imageArray && imageArray[1]) images = imageArray[1]?.replace(/'/g, '')?.split(',')

    for (const image of images) {
        if (image == '') continue
        pages.push(image)
    }

    const chapterDetails = createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: false
    })

    return chapterDetails
}

export const parseTags = ($: CheerioStatic): TagSection[] => {

    const arrayTags: Tag[] = []
    for (const tag of $('.wrap_item').toArray()) {
        const label = $('a', tag).first().text().trim()
        const id = $('a', tag).attr('href')?.split('genre/')[1] ?? ''
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export interface UpdatedManga {
    ids: string[];
    loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
    const updatedManga: string[] = []
    let loadMore = true

    for (const manga of $('div.item', 'div#book_list').toArray()) {
        const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const mangaDate = new Date($('.update_time', manga).first().text())
        if (!mangaDate || !id) continue
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
        loadMore,
    }
}

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const hotUpdateSection = createHomeSection({ id: 'hot_update', title: 'Hot Updates' })
    const hotSection = createHomeSection({ id: 'hot_manga', title: 'Hot Manga', view_more: true })
    const latestSection = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true })

    //Hot Mango Update
    const hotMangaUpdate: MangaTile[] = []
    for (const manga of $('div.item', 'div#hot_update').toArray()) {
        const title: string = $('.title', manga).text().trim()
        const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const image = $('img', manga).first().attr('src') ?? ''
        const subtitle: string = $('.chapter', manga).first().text().trim()
        if (!id || !title) continue
        hotMangaUpdate.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    hotUpdateSection.items = hotMangaUpdate
    sectionCallback(hotUpdateSection)

    //Hot Mango
    const hotManga: MangaTile[] = []
    for (const manga of $('div.item', 'div#hot_book').toArray()) {
        const title: string = $('.title', manga).text().trim()
        const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const image = $('img', manga).attr('data-src') ?? ''
        const subtitle: string = $('.chapter', manga).first().text().trim()
        if (!id || !title) continue
        hotManga.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    hotSection.items = hotManga
    sectionCallback(hotSection)

    //Latest Mango
    const latestManga: MangaTile[] = []
    for (const manga of $('div.item', 'div#book_list').toArray()) {
        const title: string = $('.title', manga).text().trim()
        const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const image = $('img', manga).first().attr('src') ?? ''
        const subtitle: string = $('.chapter', manga).first().text().trim()
        if (!id || !title) continue
        latestManga.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    latestSection.items = latestManga
    sectionCallback(latestSection)
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
    const mangas: MangaTile[] = []
    const collectedIds: string[] = []

    if ($('meta[property="og:url"]').attr('content')?.includes('/manga/')) {
        const title = $('h1.heading').first().text().trim() ?? ''
        const id = $('meta[property$=url]').attr('content')?.split('/')?.pop() ?? ''
        const image = $('div.media div.cover img').attr('src') ?? ''
        if (!id || !title || collectedIds.includes(id)) return []
        mangas.push(createMangaTile({
            id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }))
        collectedIds.push(id)

    } else {

        for (const manga of $('div.item', '#book_list').toArray()) {
            const title: string = $('.title a', manga).text().trim()
            const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
            const image = $('img', manga).attr('src') ?? ''
            const subtitle: string = $('.chapter', manga).first().text().trim()
            if (!id || !title || collectedIds.includes(id)) continue
            mangas.push(createMangaTile({
                id,
                image: image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }))
            collectedIds.push(id)
        }
    }
    return mangas
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
    const manga: MangaTile[] = []
    for (const p of $('div.item', 'div#book_list').toArray()) {
        const title: string = $('.title a', p).text().trim()
        const id = $('a', p).attr('href')?.split('/').pop() ?? ''
        const image = $('img', p).attr('src') ?? ''
        const subtitle: string = $('.chapter', p).first().text().trim()
        if (!id || !title) continue
        manga.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    return manga
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = true

    const hasNext = Boolean($('a.next.page-numbers', 'ul.uk-pagination').text())
    if (hasNext) isLast = false
    return isLast
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}
