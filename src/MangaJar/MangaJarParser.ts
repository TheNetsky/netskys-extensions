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
    titles.push(decodeHTMLEntity($('span.post-name', 'div.card-body').text().trim())) //Main English Title
    titles.push(decodeHTMLEntity($('h2.post-name-jp.h5', 'div.row').text().trim())) //Japanese Title
    titles.push(decodeHTMLEntity($('h2.h6', 'div.row').text().trim())) //Kanji Title

    const image = getImageSrc($('img', 'div.col-md-5.col-lg-4.text-center'))
    const description = decodeHTMLEntity($('div.manga-description.entry').text().trim())

    let hentai = false

    const arrayTags: Tag[] = []
    for (const tag of $('div.post-info > span > a[href*=genre]').toArray()) {
        const label = $(tag).text().trim()
        const id = encodeURI($(tag).attr('href')?.replace('/genre/', '') ?? '')
        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus = $('span:contains(Status:)', 'div.post-info').text()?.split(':')[1]?.trim() ?? ''
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
        rating: 0,
        status: status,
        author: 'Unknown', //MangaJar doesn't display the author(s) on their website
        tags: tagSections,
        desc: description,
        hentai: hentai
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('li.list-group-item.chapter-item').toArray()) {
        const id = $('a', chapter).attr('href')?.replace(`/manga/${mangaId}/chapter/`, '') ?? ''
        const date = parseDate($('span.chapter-date', chapter).text().trim())
        if (!id) continue

        const chapNum = isNaN(Number(id)) ? 0 : Number(id)

        const chapterName = $('span.chapter-title', chapter).parent().contents().remove().last().text().trim()

        chapters.push(createChapter({
            id,
            mangaId,
            name: chapterName ? decodeHTMLEntity(chapterName) : 'Chapter ' + chapNum,
            langCode: LanguageCode.ENGLISH,
            chapNum: chapNum,
            time: date,
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const img of $('img', 'div.mt-1').toArray()) {
        let image = getImageSrc($(img))
        if (!image) image = 'https://i.imgur.com/GYUxEX8.png'
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
    const updatedManga: string[] = []
    let loadMore = true

    for (const manga of $('article[class*=flex-item]', $('div.flex-container.row')).toArray()) {
        const id = $('a', manga).attr('href')?.replace('/manga/', '') ?? ''
        const date = $('.list-group-item > span', manga).text().trim()
        const mangaDate = parseDate(date)
        if (!id || !mangaDate) continue
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

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const sections = [
        {
            sectionID: createHomeSection({ id: 'hot_update', title: 'Top Manga Updates', view_more: true }),
            selector: $('div.row.splider').get(0)
        },
        {
            sectionID: createHomeSection({ id: 'new_trending', title: 'New Trending', view_more: true }),
            selector: $('div.row.splider').get(1)
        },
        {
            sectionID: createHomeSection({ id: 'popular_manga', title: 'Popular Manga', view_more: true }),
            selector: $('div.row.splider').get(2)
        },
        {
            sectionID: createHomeSection({ id: 'new_manga', title: 'Recently Added', view_more: true }),
            selector: $('div.row.splider').get(3)
        }
    ]

    const collectedIds: string[] = []

    for (const section of sections) {
        const mangaArray: MangaTile[] = []

        for (const manga of $('article[class*=flex-item]', section.selector).toArray()) {
            const id = $('a', $('div.poster-container', manga)).attr('href')?.replace('/manga/', '')
            const title = $('a', $('div.poster-container', manga)).attr('title')?.trim()
            const image = getImageSrc($('img', $('div.poster-container', manga)))
            const subtitleRaw = $('a', $('div.manga-mini-last-chapter', manga)).text().trim()
            const chapRegex = subtitleRaw.match(/(\d+\.?\d?)/)
            let subtitle = ''
            if (chapRegex && chapRegex[1]) subtitle = chapRegex[1]
            subtitle ? subtitle = 'Chapter ' + subtitle : ''
            if (!id || !title) continue

            if (collectedIds.includes(id)) continue

            mangaArray.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }))
        }
        section.sectionID.items = mangaArray
        sectionCallback(section.sectionID)

    }

}

export const parseSearch = ($: CheerioStatic, isGenre: boolean): MangaTile[] => {
    const mangas: MangaTile[] = []

    if (isGenre) {
        for (const manga of $('article[class*=flex-item-mini]', $('div.row')).toArray()) {
            const id = $('a', manga).attr('href')?.replace('/manga/', '') ?? ''
            const title = $('a', manga).attr('title')?.trim()
            const image = getImageSrc($('img', manga))
            let subtitle = $('a', $('li.list-group-item', manga)).text().trim() ?? ''
            subtitle ? subtitle = 'Chapter ' + subtitle : ''
            if (!id || !title) continue
            mangas.push(createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }))
        }

    } else {
        for (const manga of $('article[class*=flex-item]', $('div.flex-container.row')).toArray()) {
            const id = $('a', manga).attr('href')?.replace('/manga/', '') ?? ''
            const title = $('a', manga).attr('title')?.trim()
            const image = getImageSrc($('img', manga))
            let subtitle = $('a', $('li.list-group-item', manga)).text().trim() ?? ''
            subtitle ? subtitle = 'Chapter ' + subtitle : ''
            if (!id || !title) continue
            mangas.push(createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }))
        }
    }
    return mangas
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
    const mangas: MangaTile[] = []

    for (const manga of $('article[class*=flex-item]', $('div.flex-container.row')).toArray()) {
        const id = $('a', manga).attr('href')?.replace('/manga/', '') ?? ''
        const title = $('a', manga).attr('title')?.trim()
        const image = getImageSrc($('img', manga))
        let subtitle = $('a', $('li.list-group-item', manga)).text().trim() ?? ''
        subtitle ? subtitle = 'Chapter ' + subtitle : ''
        if (!id || !title) continue
        mangas.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    return mangas
}

export const parseTags = ($: CheerioStatic): TagSection[] => {

    const arrayTags: Tag[] = []
    for (const tag of $('div.col-6.col-md-4.py-2').toArray()) {
        const label = $('a', tag).text().trim()
        const id = encodeURI($('a', tag).attr('href')?.replace('/genre/', '') ?? '')
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = false
    const pages = []
    for (const page of $('li.page-item').toArray()) {
        const p = Number($(page).text().trim())
        if (isNaN(p)) continue
        pages.push(p)
    }
    const lastPage = Math.max(...pages)
    const currentPage = Number($('li.page-item.active').text().trim())
    if (currentPage >= lastPage) isLast = true
    return isLast
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
        time = new Date(date)
    }
    return time
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

const getImageSrc = (imageObj: Cheerio | undefined): string => {
    let image: any
    const src = imageObj?.attr('src')
    const dataLazy = imageObj?.attr('data-lazy-src')
    const srcset = imageObj?.attr('srcset')
    const dataSRC = imageObj?.attr('data-src')
    const dataSRCLazy = imageObj?.attr('data-splide-lazy')

    if ((typeof src != 'undefined') && !src?.startsWith('data')) {
        image = imageObj?.attr('src')
    } else if ((typeof dataLazy != 'undefined') && !dataLazy?.startsWith('data')) {
        image = imageObj?.attr('data-lazy-src')
    } else if ((typeof srcset != 'undefined') && !srcset?.startsWith('data')) {
        image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
    } else if ((typeof dataSRC != 'undefined') && !dataSRC?.startsWith('data')) {
        image = imageObj?.attr('data-src')
    } else if ((typeof dataSRCLazy != 'undefined') && !dataSRCLazy?.startsWith('data')) {
        image = imageObj?.attr('data-splide-lazy')
    } else {
        image = 'https://i.imgur.com/GYUxEX8.png'
    }

    return encodeURI(image ?? '')
}