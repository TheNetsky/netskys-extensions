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

    titles.push(decodeHTMLEntity($('img', 'div.fixed-img').attr('alt')?.trim() ?? ''))
    const altTitles = $('h2.alternative-title.text1row', 'div.main-head').text().trim().split(',')
    for (const title of altTitles) {
        titles.push(decodeHTMLEntity(title))
    }

    const image = $('img', 'div.fixed-img').attr('data-src') ?? ''
    const author = $('span', 'div.author').next().text().trim()
    console.log('test: ' + JSON.stringify($('p.description').text()))
    const description = decodeHTMLEntity($('p.description').text().split('The Summary is\n\n')[1]?.trim() ?? '')

    const arrayTags: Tag[] = []
    for (const tag of $('li', 'div.categories').toArray()) {
        const label = $(tag).text().trim()
        const id = encodeURI($(tag).text().trim())

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    const rawStatus = $('small:contains(Status)', 'div.header-stats').prev().text().trim()
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
    let sortingIndex = 0

    for (const chapter of $('li', 'ul.chapter-list').toArray()) {
        const title = decodeHTMLEntity($('strong.chapter-title', chapter).text().trim())
        const chapterId: string = $('a', chapter).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        if (!chapterId) continue

        const datePieces = $('time.chapter-update', chapter).attr('datetime')?.split(',') ?? []
        const date = new Date(String(`${datePieces[0]}, ${datePieces[1]}`))
        const chapNumRegex = title.match(/(\d+)(?:[-.]\d+)?/)

        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) {
            let chapRegex = chapNumRegex[1]
            if (chapRegex.includes('-')) chapRegex = chapRegex.replace('-', '.')
            chapNum = Number(chapRegex)
        }

        chapters.push({
            id: chapterId,
            name: `Chapter ${chapNum}`,
            langCode: '🇬🇧',
            chapNum: chapNum,
            time: date,
            sortingIndex,
            volume: 0,
            group: ''
        })
        sortingIndex--
    }

    if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
    }

    return chapters.map(chapter => {
        chapter.sortingIndex += chapters.length
        return App.createChapter(chapter)
    })
}

export const parseChapterDetails = ($: CheerioAPI, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    for (const img of $('img', 'div#chapter-reader').toArray()) {
        let image = $(img).attr('src') ?? ''
        if (!image) image = $(img).attr('data-src') ?? ''
        if (!image) continue
        pages.push(image)
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseHomeSections = ($: CheerioAPI, sectionCallback: (section: HomeSection) => void): void => {
    const mostViewedSection = App.createHomeSection({
        id: 'most_viewed',
        title: 'Most Viewed',
        containsMoreItems: true,
        type: HomeSectionType.singleRowLarge
    })

    const newSection = App.createHomeSection({
        id: 'new',
        title: 'New',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    const updateSection = App.createHomeSection({
        id: 'updated',
        title: 'Latest Updated',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    // Most Viewed
    const mostViewedSection_Array: PartialSourceManga[] = []
    for (const manga of $('li', 'div#recommend-novel-slider').toArray()) {
        const image: string = $('img', manga).first().attr('data-src') ?? ''
        const title: string = $('img', manga).first().attr('alt') ?? ''
        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('span.status', manga).text().trim() ?? ''

        if (!id || !title) continue
        mostViewedSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle) + ' Stars'
        }))
    }
    mostViewedSection.items = mostViewedSection_Array
    sectionCallback(mostViewedSection)

    // New
    const newSection_Array: PartialSourceManga[] = []
    for (const manga of $('li', 'div#updated-novel-slider').toArray()) {
        const image: string = $('img', manga).first().attr('data-src') ?? ''
        const title: string = $('h4.novel-title', manga).text().trim() ?? ''
        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''

        if (!id || !title) continue
        newSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: undefined
        }))
    }
    newSection.items = newSection_Array
    sectionCallback(newSection)

    // Updated
    const updateSection_Array: PartialSourceManga[] = []
    for (const manga of $('li.novel-item', 'ul.novel-list').toArray()) {
        const image: string = $('img', manga).first().attr('data-src') ?? ''
        const title: string = $('img', manga).first().attr('alt') ?? ''
        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('span', $('div.novel-stats', manga)).first().text().replace('update', '').trim() ?? ''

        if (!id || !title) continue
        updateSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle + ' ago')
        }))
    }
    updateSection.items = updateSection_Array
    sectionCallback(updateSection)
}

export const parseViewMore = ($: CheerioAPI): PartialSourceManga[] => {
    const manga: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const obj of $('li.novel-item', 'ul.novel-list').toArray()) {
        const image: string = $('img', obj).first().attr('data-src') ?? ''
        const title: string = $('img', obj).first().attr('alt') ?? ''
        const id = $('a', obj).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const getChapter = $('div.novel-stats > strong', obj).text().trim()

        const chapNumRegex = getChapter.match(/(\d+\.?\d?)+/)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        const subtitle = chapNum ? 'Chapter ' + chapNum : 'Chapter N/A'

        if (!id || !title || collectedIds.includes(id)) continue
        manga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
        collectedIds.push(id)
    }

    return manga
}

export const parseTags = ($: CheerioAPI): TagSection[] => {
    const arrayTags: Tag[] = []
    for (const tag of $('.genre-select-i > label').toArray()) {
        const title = $(tag).attr('for') ?? ''

        if (!title) continue
        arrayTags.push({ id: title, label: title })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections
}

export const parseSearch = ($: CheerioAPI): PartialSourceManga[] => {
    const mangas: PartialSourceManga[] = []
    for (const obj of $('li.novel-item', 'ul.novel-list').toArray()) {

        let image: string = $('img', obj).first().attr('data-src') ?? ''
        if (image.startsWith('/')) image = 'https://www.mcreader.net' + image

        const title: string = $('img', obj).first().attr('alt') ?? ''
        const id = $('a', obj).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const getChapter = $('div.novel-stats > strong', obj).text().trim()
        const chapNumRegex = getChapter.match(/(\d+\.?\d?)+/)

        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        const subtitle = chapNum ? 'Chapter ' + chapNum : 'Chapter N/A'
        if (!id || !title) continue

        mangas.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
    }
    return mangas
}

export const isLastPage = ($: CheerioAPI): boolean => {
    let isLast = false

    const pages = $('.mg-pagination-table').first().remove().text().trim().split(' / ')

    const currentPage = Number(pages[0])
    const lastPage = Number(pages[1])

    if (currentPage >= lastPage) isLast = true
    return isLast
}
