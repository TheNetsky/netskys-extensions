import {
    Chapter,
    ChapterDetails,
    HomeSection,
    SourceManga,
    PartialSourceManga,
    HomeSectionType
} from '@paperback/types'

import { decode as decodeHTMLEntity } from 'html-entities'

import { CheerioAPI } from 'cheerio'


export const parseMangaDetails = ($: CheerioAPI, mangaId: string): SourceManga => {
    const title: string = decodeHTMLEntity($('h1').text()?.trim() ?? '')

    const image = $('img', '.description-archive').first().attr('src') ?? ''
    const description = $('div.b > strong', '.description-archive').text().trim()
    const publisher = $('strong', 'p:contains(Publisher:)').last().text().trim() ?? ''

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            image: image,
            status: 'Ongoing',
            artist: publisher,
            author: publisher,
            desc: decodeHTMLEntity(description)
        })
    })
}

export const parseChapters = ($: CheerioAPI, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    const chapterListElement = $('li', 'ul.list-story').toArray()
    let i = chapterListElement.length

    for (const chapter of chapterListElement) {
        const id = $('a', chapter).attr('href')?.replace(/\/$/, '').split('/').pop() ?? ''

        if (!id) continue

        const title = $('a', chapter).text().trim() ?? ''

        chapters.push(App.createChapter({
            id: id,
            name: title,
            langCode: '🇬🇧',
            chapNum: i,
            sortingIndex,
            time: new Date()
        }))
        sortingIndex--
        i--
    }

    if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
    }

    return chapters
}

export const parseChapterDetails = ($: CheerioAPI, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const img of $('img', 'center > div:nth-child(2)').toArray()) {
        const image = $(img).attr('src') ?? ''
        if (!image) continue
        pages.push(image.trim())
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseHomeSections = ($: CheerioAPI, sectionCallback: (section: HomeSection) => void): void => {
    // New Updated Comics
    const newCompletedSection = App.createHomeSection({
        id: 'new_updated',
        title: 'Newly Updated Comics',
        containsMoreItems: true,
        type: HomeSectionType.singleRowLarge
    })

    const newCompletedSection_Array: PartialSourceManga[] = []
    for (const item of $('div', 'div#post-area').toArray()) {
        const classAttribute = $(item).attr('class') ?? ''

        const idRegex = classAttribute?.match(/category-([^ ]+)/)
        let id = ''
        if (idRegex && idRegex[1]) id = idRegex[1]

        const title: string = $('h2', item).text().trim() ?? ''
        const subtitle: string = $('span', item).first().text().trim()
        const image = $('img', item).attr('src') ?? ''

        if (!id || !title) continue
        newCompletedSection_Array.push(App.createPartialSourceManga({
            image: encodeURI(image),
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
    }
    newCompletedSection.items = newCompletedSection_Array
    sectionCallback(newCompletedSection)
}

export const parseViewMore = ($: CheerioAPI): PartialSourceManga[] => {
    const comics: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const item of $('div', 'div#post-area').toArray()) {
        const classAttribute = $(item).attr('class') ?? ''

        const idRegex = classAttribute?.match(/category-([^ ]+)/)
        let id = ''
        if (idRegex && idRegex[1]) id = idRegex[1]

        const title: string = $('h2', item).text().trim() ?? ''
        const subtitle: string = $('span', item).first().text().trim()
        const image = $('img', item).attr('src') ?? ''

        if (!id || !title || collectedIds.includes(id)) continue
        comics.push(App.createPartialSourceManga({
            image: encodeURI(image),
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
    }
    return comics
}

export const parseSearchResults = ($: CheerioAPI): PartialSourceManga[] => {
    const comics: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const item of $('li', 'ul.list-story').toArray()) {
        const id = $('a', item).attr('href')?.replace(/\/$/, '').split('/').pop() ?? ''
        const title: string = $(item).text().trim() ?? ''

        if (!id || !title || collectedIds.includes(id)) continue
        comics.push(App.createPartialSourceManga({
            image: '', // There is no image in search results
            title: decodeHTMLEntity(title),
            mangaId: id
        }))
    }
    return comics
}

export const isLastPage = ($: CheerioAPI): boolean => {
    let isLast = false

    const lastPage = $('a:contains(Next)') ?? ''
    if (!lastPage) isLast = true

    return isLast
}