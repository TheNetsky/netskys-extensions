import {
    Chapter,
    Tag,
    HomeSection,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection
} from 'paperback-extensions-common'

import entities = require('entities')

export interface UpdatedManga {
    ids: string[];
}

const MH_CDN_THUMBS_DOMAIN = 'https://thumb.mghubcdn.com'

export const parseMangaDetails = (data: any, mangaId: string): Manga => {

    const titles = []
    titles.push(decodeHTMLEntity(data.manga.title)) //Main Title

    if (data.manga.alternativeTitle) {
        for (const title of data.manga.alternativeTitle.split(/\\|; /)) {
            if (title == '') continue
            titles.push(decodeHTMLEntity(title.trim()))
        }
    }

    const author = decodeHTMLEntity(data.manga.author ?? '')
    const artist = decodeHTMLEntity(data.manga.artist ?? '')
    const description = decodeHTMLEntity(data.manga.description ?? 'No description available')

    let hentai = false

    const arrayTags: Tag[] = []
    for (const tag of data.manga.genres.split(',')) {
        const label = tag
        const id = tag.toLowerCase().replace(' ', '-')
        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    let status = MangaStatus.ONGOING
    switch (data.manga.status.toUpperCase()) {
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
        image: data.manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${data.manga.image}` : 'https://i.imgur.com/GYUxEX8.png',
        status: status,
        author: author == '' ? 'Unknown' : author,
        artist: artist == '' ? 'Unknown' : artist,
        tags: tagSections,
        desc: description,
        hentai: hentai
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    for (const chapter of $('ul.MWqeC,list-group').children('li').toArray()) {
        const id = $('a', chapter).attr('href')?.split(`/${mangaId}/`).pop() ?? ''
        const title = $('span.text-secondary._3D1SJ', chapter).text().replace('#', 'Chapter ').trim()
        const chapterSection = $('span.text-secondary._3D1SJ', chapter).text().trim()
        const chapRegex = chapterSection.match(/(\d+\.?\d?)/)
        let chapterNumber = 0
        if (chapRegex && chapRegex[1]) chapterNumber = Number(chapRegex[1])
        const date = parseDate($('small.UovLc', chapter)?.text() ?? '')
        if (!id) continue
        chapters.push(createChapter({
            id,
            mangaId,
            name: title,
            langCode: LanguageCode.ENGLISH,
            chapNum: chapterNumber,
            time: date,
        }))
    }
    return chapters
}
/*
export const parseTags = ($: CheerioStatic): TagSection[] => {
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: [] })]
    return tagSections
}
*/
export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
    const updatedManga: string[] = []

    for (const manga of $('div.media', 'div._21UU2').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? ''
        const mangaDate = parseDate($('._3L1my', manga).first().text())
        if (!id) continue
        if (mangaDate > time) {
            if (ids.includes(id)) {
                updatedManga.push(id)
            }
        }
    }
    return {
        ids: updatedManga,
    }
}

export const parseHomeSections = (data: any, sectionCallback: (section: HomeSection) => void): void => {
    const hotMangaUpdateSection = createHomeSection({ id: 'hot_update', title: 'Hot Updates', view_more: false })
    const hotMangaSection = createHomeSection({ id: 'hot_manga', title: 'Hot Manga', view_more: true })
    const latestUpdateSection = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true })

    //Popular Manga Updates
    const hotMangaUpdate: MangaTile[] = []
    for (const manga of data.data.latestPopular) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : 'https://i.imgur.com/GYUxEX8.png'
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''
        if (!id || !title) continue
        hotMangaUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))

    }
    hotMangaUpdateSection.items = hotMangaUpdate
    sectionCallback(hotMangaUpdateSection)

    //Hot Manga
    const hotManga: MangaTile[] = []
    for (const manga of data.data.search.rows) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : 'https://i.imgur.com/GYUxEX8.png'
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''
        if (!id || !title) continue
        hotManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))

    }
    hotMangaSection.items = hotManga
    sectionCallback(hotMangaSection)

    //Latest Manga
    const latestUpdate: MangaTile[] = []
    for (const manga of data.data.latest) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : 'https://i.imgur.com/GYUxEX8.png'
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''
        if (!id || !title) continue
        latestUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))

    }
    latestUpdateSection.items = latestUpdate
    sectionCallback(latestUpdateSection)
}

export const parseViewMore = (data: any): MangaTile[] => {
    const moreManga: MangaTile[] = []
    for (const manga of data.data.search.rows) {
        const title = manga.title ?? ''
        const id = manga.slug ?? ''
        const image = manga?.image ? `${MH_CDN_THUMBS_DOMAIN}/${manga.image}` : 'https://i.imgur.com/GYUxEX8.png'
        const subtitle = manga?.latestChapter ? 'Chapter ' + manga.latestChapter : ''
        if (!id || !title) continue
        moreManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))

    }
    return moreManga
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
    const mangas: MangaTile[] = []

    const collectedIds: string[] = []
    for (const manga of $('div.media-manga.media', 'div#mangalist').toArray()) {
        const title = $('img', manga).first().attr('alt') ?? ''
        const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? ''
        const image = getImageSrc($('img', manga))
        const subtitle = $('p > a', manga).first().text().replace('#', 'Chapter ').trim()
        if (collectedIds.includes(id) || !id || !title) continue
        mangas.push(createMangaTile({
            id,
            image: !image ? 'https://i.imgur.com/GYUxEX8.png' : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
        collectedIds.push(id)
    }
    return mangas
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = true

    const hasNext = Boolean($('a.btn.btn-primary').text())
    if (hasNext) isLast = false
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
        const split = date.split('-')
        time = new Date(Number(split[2]), Number(split[0]) - 1, Number(split[1]))
    }
    return time
}

const getImageSrc = (imageObj: Cheerio | undefined): string => {
    let image: any
    const src = imageObj?.attr('src')
    const dataLazy = imageObj?.attr('data-lazy-src')
    const srcset = imageObj?.attr('srcset')
    const dataSRC = imageObj?.attr('data-src')

    if ((typeof src != 'undefined') && !src?.startsWith('data')) {
        image = imageObj?.attr('src')
    } else if ((typeof dataLazy != 'undefined') && !dataLazy?.startsWith('data')) {
        image = imageObj?.attr('data-lazy-src')
    } else if ((typeof srcset != 'undefined') && !srcset?.startsWith('data')) {
        image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
    } else if ((typeof dataSRC != 'undefined') && !dataSRC?.startsWith('data')) {
        image = imageObj?.attr('data-src')
    } else {
        image = 'https://i.imgur.com/GYUxEX8.png'
    }

    return encodeURI(decodeURI(decodeHTMLEntity(image?.trim() ?? '')))
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}