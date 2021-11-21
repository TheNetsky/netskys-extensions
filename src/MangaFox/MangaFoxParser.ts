/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    //SearchRequest,
    TagSection
} from 'paperback-extensions-common'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
    const section = $('.detail-info')
    const title = $('span.detail-info-right-title-font', section).text().trim()
    const rating = $('span.item-score', section).text().trim().replace(',', '.')
    const author = $('p.detail-info-right-say a', section).text().trim()

    const image = $('.detail-info-cover-img', $('.detail-info-cover')).attr('src') ?? ''
    const description = $('p.fullcontent').text().trim()

    let hentai = false

    const arrayTags: Tag[] = []
    for (const tag of $('a', '.detail-info-right-tag-list').toArray()) {
        const id = $(tag).attr('href')?.split('/directory/')[1]?.replace(/\//g, '')
        const label = $(tag).text().trim()
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus = $('.detail-info-right-title-tip', section).text().trim()
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
        titles: [title],
        image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
        rating: Number(rating),
        status: status,
        author: author,
        tags: tagSections,
        desc: description,
        hentai: hentai
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('div#chapterlist ul li').children('a').toArray()) {
        const title = $('p.title3', chapter).html() ?? ''
        const date = parseDate($('p.title2', chapter).html() ?? '')

        const chapterIdRaw = $(chapter).attr('href')?.trim()
        const chapterIdRegex = chapterIdRaw?.match(/\/manga\/[a-zA-Z0-9_]*\/(.*)\//)
        let chapterId = null
        if (chapterIdRegex && chapterIdRegex[1]) chapterId = chapterIdRegex[1]

        if (!chapterId) continue

        const chapRegex = chapterId?.match(/c([0-9.]+)/)
        let chapNum = 0
        if (chapRegex && chapRegex[1]) chapNum = Number(chapRegex[1])

        const volRegex = chapterId?.match(/v([0-9.]+)/)
        let volNum = 0
        if (volRegex && volRegex[1]) volNum = Number(volRegex[1])

        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: title,
            langCode: LanguageCode.ENGLISH,
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            volume: isNaN(volNum) ? 0 : volNum,
            time: date,
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    if ($('div#viewer').length == 0) pages.push('https://i.imgur.com/8WoVeWv.png') //Fallback in case the manga is licensed

    for (const page of $('div#viewer').children('img').toArray()) {
        let url = page.attribs['data-original']
        if (!url) continue
        if (url?.startsWith('//')) url = 'https:' + url

        pages.push(url)
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

    for (const manga of $('li', 'div.manga-list-4 ').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
        if (!id) continue

        const date = $('.manga-list-4-item-subtitle > span', $(manga)).text().trim()
        const mangaDate = parseDate(date)
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
    const sections = [
        {
            sectionID: createHomeSection({ id: 'hot_release', title: 'Hot Manga Releases', view_more: true }),
            selector: $('div.manga-list-1').get(0)
        },
        {
            sectionID: createHomeSection({ id: 'being_read', title: 'Being Read Right Now' }),
            selector: $('div.manga-list-1').get(1)
        },
        {
            sectionID: createHomeSection({ id: 'recommended', title: 'Recommended' }),
            selector: $('div.manga-list-3')
        },
        {
            sectionID: createHomeSection({ id: 'new_manga', title: 'New Manga Releases', view_more: true }),
            selector: $('div.manga-list-1').get(2)
        }
    ]

    //Hot Release Manga
    //New Manga
    //Being Read Manga
    const collectedIds: string[] = []

    for (const section of sections) {
        const mangaArray: MangaTile[] = []

        for (const manga of $('li', section.selector).toArray()) {
            const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
            const image: string = $('img', manga).first().attr('src') ?? ''
            const title: string = $('a', manga).first().attr('title')?.trim() ?? ''
            const subtitle: string = $('p.manga-list-1-item-subtitle', manga).text().trim()
            if (!id || !title || !image) continue

            if (collectedIds.includes(id)) continue
            mangaArray.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }))
        }
        section.sectionID.items = mangaArray
        sectionCallback(section.sectionID)

    }
    //Latest Manga
    const latestSection = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true })
    const latestManga: MangaTile[] = []

    for (const manga of $('li', 'div.manga-list-4 ').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('a', manga).attr('title')?.trim() ?? ''
        const subtitle: string = $('ul.manga-list-4-item-part > li', manga).first().text().trim()
        if (!id || !title || !image) continue

        if (collectedIds.includes(id)) continue
        latestManga.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    latestSection.items = latestManga
    sectionCallback(latestSection)
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
    const mangaItems: MangaTile[] = []
    const collectedIds: string[] = []

    for (const manga of $('ul.manga-list-4-list > li').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('a', manga).attr('title')?.trim() ?? ''
        const subtitle: string = $('a', $('p.manga-list-4-item-tip', manga).get(1)).text()
        if (!id || !title || !image) continue

        if (collectedIds.includes(id)) continue
        mangaItems.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }))
        collectedIds.push(id)

    }
    return mangaItems
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
    const mangaItems: MangaTile[] = []
    const collectedIds: string[] = []

    if (homepageSectionId === 'latest_updates') {
        for (const manga of $('ul.manga-list-4-list > li').toArray()) {
            const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
            const image: string = $('img', manga).first().attr('src') ?? ''
            const title: string = $('a', manga).attr('title')?.trim() ?? ''
            const subtitle: string = $('ul.manga-list-4-item-part > li', manga).first().text().trim()
            if (!id || !title || !image) continue

            if (collectedIds.includes(id)) continue
            mangaItems.push(createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }))
            collectedIds.push(id)
        }

        return mangaItems
    }

    for (const manga of $('li', $.html()).toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('img', manga).first().attr('alt')?.trim() ?? ''
        const subtitle: string = $('p.manga-list-1-item-subtitle', manga).text().trim()
        if (!id || !title || !image) continue

        if (collectedIds.includes(id)) continue
        mangaItems.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }))
        collectedIds.push(id)

    }

    return mangaItems

}

export const parseTags = ($: CheerioStatic): TagSection[] => {

    const arrayTags: Tag[] = []
    for (const tag of $('div.tag-box > a').toArray()) {
        const label = $(tag).text().trim()
        const id = $(tag).attr('data-val') ?? ''
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
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

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = true
    const pages = []
    for (const page of $('a', '.pager-list-left').toArray()) {
        const p = Number($(page).text().trim())
        if (isNaN(p)) continue
        pages.push(p)
    }
    const lastPage = Math.max(...pages)
    const currentPage = Number($('a.active', '.pager-list-left').text().trim())
    if (currentPage <= lastPage) isLast = false
    return isLast
}