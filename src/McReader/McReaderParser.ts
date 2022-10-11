import {
    Chapter,
    ChapterDetails,
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


export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

    const titles: string[] = []
    titles.push(decodeHTMLEntity($('img', 'div.fixed-img').attr('alt')?.trim() ?? ''))
    const altTitles = $('h2.alternative-title.text1row', 'div.main-head').text().trim().split(',')
    for (const title of altTitles) {
        titles.push(decodeHTMLEntity(title))
    }

    const image = $('img', 'div.fixed-img').attr('data-src') ?? ''
    const author = $('span', 'div.author').next().text().trim()

    const arrayTags: Tag[] = []
    for (const tag of $('li', 'div.categories').toArray()) {
        const label = $(tag).text().trim()
        const id = encodeURI($(tag).text().trim())

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const description = decodeHTMLEntity($('p.description > br')[1]?.nextSibling.nodeValue.trim() ?? '')

    const rawStatus = $('small:contains(Status)', 'div.header-stats').prev().text().trim()
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
        artist: author,
        tags: tagSections,
        desc: description,
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const chapter of $('li', 'ul.chapter-list').toArray()) {
        const title = decodeHTMLEntity($('strong.chapter-title', chapter).text().trim())
        const chapterId: string = $('a', chapter).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''

        if (!chapterId) continue

        const datePieces = $('time.chapter-update', chapter).attr('datetime')?.split(',') ?? []

        const date = new Date(String(`${datePieces[0]}, ${datePieces[1]}`))

        const chapNumRegex = title.match(/(\d+\.?\d?)+/)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        chapters.push({
            id: chapterId,
            mangaId,
            name: `Chapter ${chapNum}`,
            langCode: LanguageCode.ENGLISH,
            chapNum: chapNum,
            time: date,
            // @ts-ignore
            sortingIndex
        })
        sortingIndex--
    }

    return chapters.map(chapter => {
        // @ts-ignore
        chapter.sortingIndex += chapters.length
        return createChapter(chapter)
    })
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const img of $('img', 'div#chapter-reader').toArray()) {
        let image = $(img).attr('src') ?? ''
        if (!image) image = $(img).attr('data-src') ?? ''
        if (!image) continue
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

export interface UpdatedManga {
    ids: string[];
    loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
    let loadMore = true

    const updatedManga: string[] = []

    for (const manga of $('li.novel-item', 'ul.novel-list.grid').toArray()) {
        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        if (!id) continue

        const rawDate = $('div.novel-stats > span', manga).text().trim()
        const mangaDate = parseDate(rawDate)

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
    const mostViewedSection = createHomeSection({ id: 'most_viewed', title: 'Most Viewed', view_more: true, type: HomeSectionType.singleRowLarge })
    const newSection = createHomeSection({ id: 'new', title: 'New', view_more: true })
    const updateSection = createHomeSection({ id: 'updated', title: 'Latest Updated', view_more: true })

    //Most Viewed
    const mostViewedSection_Array: MangaTile[] = []
    for (const manga of $('li', 'div#recommend-novel-slider').toArray()) {

        const image: string = $('img', manga).first().attr('data-src') ?? ''
        const title: string = $('img', manga).first().attr('alt') ?? ''

        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('span.status', manga).text().trim() ?? ''

        if (!id || !title) continue
        mostViewedSection_Array.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
        }))
    }

    mostViewedSection.items = mostViewedSection_Array
    sectionCallback(mostViewedSection)

    //New
    const newSection_Array: MangaTile[] = []
    for (const manga of $('li', 'div#updated-novel-slider').toArray()) {

        const image: string = $('img', manga).first().attr('data-src') ?? ''
        const title: string = $('h4.novel-title', manga).text().trim() ?? ''

        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''


        if (!id || !title) continue
        newSection_Array.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) })
        }))
    }

    newSection.items = newSection_Array
    sectionCallback(newSection)

    //Updated
    const updateSection_Array: MangaTile[] = []
    for (const manga of $('li.novel-item', 'ul.novel-list').toArray()) {

        const image: string = $('img', manga).first().attr('data-src') ?? ''
        const title: string = $('img', manga).first().attr('alt') ?? ''

        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('span', $('div.novel-stats', manga)).first().text().replace('update', '').trim() ?? ''

        if (!id || !title) continue
        updateSection_Array.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle + ' ago') })
        }))
    }

    updateSection.items = updateSection_Array
    sectionCallback(updateSection)
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
    const manga: MangaTile[] = []
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


        if (!id || !title) continue
        if (!collectedIds.includes(id)) {
            manga.push(createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
            }))
            collectedIds.push(id)
        }
    }

    return manga
}

export const parseTags = ($: CheerioStatic): TagSection[] => {
    const arrayTags: Tag[] = []

    for (const tag of $('label.checkbox-inline', 'div.container').toArray()) {
        const label = $(tag).text().trim() ?? ''
        const id = $('input', tag).attr('value') ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
    const mangas: MangaTile[] = []

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
        mangas.push(createMangaTile({
            id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
        }))
    }
    return mangas
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = false
    const pages = []

    for (const page of $('li', 'ul.pagination').toArray()) {
        const p = Number($(page).text().trim())
        if (isNaN(p)) continue
        pages.push(p)
    }

    const lastPage = Math.max(...pages)
    const currentPage = Number($('li.active').first().text())

    if (currentPage >= lastPage) isLast = true
    return isLast
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

const parseDate = (date: string): Date => {
    date = date.toUpperCase()
    let time: Date
    const number = Number((/\d*/.exec(date) ?? [])[0])
    if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
        time = new Date(Date.now())
    } else if (date.includes('YEAR') || date.includes('YEARS')) {
        time = new Date(Date.now() - (number * 31556952000))
    } else if (date.includes('MONTH') || date.includes('MONTHS')) {
        time = new Date(Date.now() - (number * 2592000000))
    } else if (date.includes('WEEK') || date.includes('WEEKS')) {
        time = new Date(Date.now() - (number * 604800000))
    } else if (date.includes('YESTERDAY')) {
        time = new Date(Date.now() - 86400000)
    } else if (date.includes('DAY') || date.includes('DAYS')) {
        time = new Date(Date.now() - (number * 86400000))
    } else if (date.includes('HOUR') || date.includes('HOURS')) {
        time = new Date(Date.now() - (number * 3600000))
    } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
        time = new Date(Date.now() - (number * 60000))
    } else if (date.includes('SECOND') || date.includes('SECONDS')) {
        time = new Date(Date.now() - (number * 1000))
    } else {
        const split = date.split('-')
        time = new Date(Number(split[2]), Number(split[0]) - 1, Number(split[1]))
    }
    return time
}