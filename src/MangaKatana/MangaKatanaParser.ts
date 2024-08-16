import {
    Chapter,
    ChapterDetails,
    Tag,
    HomeSection,
    SourceManga,
    PartialSourceManga,
    TagSection,
    HomeSectionType
} from '@paperback/types'

import { decode as decodeHTMLEntity } from 'html-entities'
import { CheerioAPI } from 'cheerio'

export const parseMangaDetails = ($: CheerioAPI, mangaId: string): SourceManga => {
    const titles: string[] = []

    titles.push(decodeHTMLEntity($('h1.heading').first().text().trim()))
    const altTitles = $('div.alt_name').text().split(';')
    for (const title of altTitles) {
        titles.push(decodeHTMLEntity(title.trim()))
    }

    const image = $('div.media div.cover img').attr('src') ?? ''
    const author = $('.author').text().trim()
    const description = decodeHTMLEntity($('.summary > p').text().trim())

    const arrayTags: Tag[] = []
    for (const tag of $('.genres > a').toArray()) {
        const label = $(tag).text().trim()
        const id = $(tag).attr('href')?.split('genre/')[1] ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    const rawStatus = $('.value.status').text().trim()
    let status = 'ONGOING'
    switch (rawStatus.toUpperCase()) {
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
            image: image,
            status: status,
            author: author,
            artist: author,
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapters = ($: CheerioAPI, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    for (const elem of $('tr:has(.chapter)').toArray()) {
        const title = $('a', elem).text()
        const date = new Date($('.update_time', elem).text() ?? '')
        const chapterId = $('a', elem).attr('href')?.split('/').pop()

        if (!chapterId) continue
        const chapRegex = chapterId?.match(/c([0-9.]+)/)

        let chapNum = 0
        if (chapRegex && chapRegex[1]) chapNum = Number(chapRegex[1])

        chapters.push(App.createChapter({
            id: chapterId,
            name: title,
            langCode: '🇬🇧',
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: date
        }))
    }

    if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
    }

    return chapters
}

export const parseChapterDetails = (data: string, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    let images: string[] = []

    // Ytaw
    const imageArrayYtaw = data.match(/var ytaw=\[(.*?)\]/)
    let imagesYtaw: string[] = []
    if (imageArrayYtaw && imageArrayYtaw[1]) imagesYtaw = imageArrayYtaw[1]?.replace(/'/g, '')?.split(',')

    // Thzq
    const imageArrayThzq = data.match(/var thzq=\[(.*?)\]/)
    let imagesThzq: string[] = []
    if (imageArrayThzq && imageArrayThzq[1]) imagesThzq = imageArrayThzq[1]?.replace(/'/g, '')?.split(',')

    images = imagesYtaw.length > imagesThzq.length ? imagesYtaw : imagesThzq

    for (const image of images) {
        if (image == '') continue
        pages.push(image)
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseTags = ($: CheerioAPI): TagSection[] => {
    const arrayTags: Tag[] = []

    for (const tag of $('.wrap_item').toArray()) {
        const label = $('a', tag).first().text().trim()
        const id = $('a', tag).attr('href')?.split('genre/')[1] ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections
}

export const parseHomeSections = ($: CheerioAPI, sectionCallback: (section: HomeSection) => void): void => {
    const hotUpdateSection = App.createHomeSection({
        id: 'hot_update',
        title: 'Hot Updates',
        containsMoreItems: false,
        type: HomeSectionType.singleRowNormal
    })

    const hotSection = App.createHomeSection({
        id: 'hot_manga',
        title: 'Hot Manga',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    const latestSection = App.createHomeSection({
        id: 'latest_updates',
        title: 'Latest Updates',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    // Hot Update
    const hotMangaUpdate: PartialSourceManga[] = []
    for (const manga of $('div.item', 'div#hot_update').toArray()) {
        const title: string = $('.title', manga).text().trim()
        const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const image = $('img', manga).first().attr('src') ?? ''
        const subtitle: string = $('.chapter', manga).first().text().trim()

        if (!id || !title) continue
        hotMangaUpdate.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    hotUpdateSection.items = hotMangaUpdate
    sectionCallback(hotUpdateSection)

    // Hot
    const hotManga: PartialSourceManga[] = []
    for (const manga of $('div.item', 'div#hot_book').toArray()) {
        const title: string = $('.title', manga).text().trim()
        const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const image = $('img', manga).attr('data-src') ?? ''
        const subtitle: string = $('.chapter', manga).first().text().trim()

        if (!id || !title) continue
        hotManga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    hotSection.items = hotManga
    sectionCallback(hotSection)

    // Latest
    const latestManga: PartialSourceManga[] = []
    for (const manga of $('div.item', 'div#book_list').toArray()) {
        const title: string = $('.title', manga).text().trim()
        const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const image = $('img', manga).first().attr('src') ?? ''
        const subtitle: string = $('.chapter', manga).first().text().trim()

        if (!id || !title) continue
        latestManga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    latestSection.items = latestManga
    sectionCallback(latestSection)
}

export const parseSearch = ($: CheerioAPI): PartialSourceManga[] => {
    const mangas: PartialSourceManga[] = []
    const collectedIds: string[] = []

    if ($('meta[property="og:url"]').attr('content')?.includes('/manga/')) {
        const title = $('h1.heading').first().text().trim() ?? ''
        const id = $('meta[property$=url]').attr('content')?.split('/')?.pop() ?? ''
        const image = $('div.media div.cover img').attr('src') ?? ''

        if (!id || !title || collectedIds.includes(id)) return []
        mangas.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: undefined
        }))
        collectedIds.push(id)

    } else {
        for (const manga of $('div.item', '#book_list').toArray()) {
            const title: string = $('.title a', manga).text().trim()
            const id = $('a', manga).attr('href')?.split('/').pop() ?? ''
            const image = $('img', manga).attr('src') ?? ''
            const subtitle: string = $('.chapter', manga).first().text().trim()

            if (!id || !title || collectedIds.includes(id)) continue
            mangas.push(App.createPartialSourceManga({
                image: image,
                title: decodeHTMLEntity(title),
                mangaId: id,
                subtitle: subtitle
            }))
            collectedIds.push(id)
        }
    }
    return mangas
}

export const parseViewMore = ($: CheerioAPI): PartialSourceManga[] => {
    const manga: PartialSourceManga[] = []

    for (const p of $('div.item', 'div#book_list').toArray()) {
        const title: string = $('.title a', p).text().trim()
        const id = $('a', p).attr('href')?.split('/').pop() ?? ''
        const image = $('img', p).attr('src') ?? ''
        const subtitle: string = $('.chapter', p).first().text().trim()

        if (!id || !title) continue
        manga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    return manga
}

export const isLastPage = ($: CheerioAPI): boolean => {
    let isLast = true
    const hasNext = Boolean($('a.next.page-numbers', 'ul.uk-pagination').text())

    if (hasNext) isLast = false
    return isLast
}