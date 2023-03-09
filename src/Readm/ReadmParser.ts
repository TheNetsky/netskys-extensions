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

const RM_DOMAIN = 'https://readm.org'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

    const titles: string[] = []
    titles.push(decodeHTMLEntity($('h1.page-title').text().trim()))

    const altTitles: string[] = $('div.sub-title.pt-sm').text().split(/, |; |\| /)
    for (const t of altTitles) {
        titles.push(decodeHTMLEntity(t.trim()))
    }

    //Check if the image extension could be parsed, if it can, complete it with the domain, else display failback image.
    const parseImage = getImageSrc($('img.series-profile-thumb'))
    const image: string = parseImage ? (RM_DOMAIN + parseImage) : 'https://i.imgur.com/GYUxEX8.png'

    const author: string = $('small', 'span#first_episode').text().trim() ?? ''
    const artist: string = $('small', 'span#last_episode').text().trim() ?? ''
    const description: string = decodeHTMLEntity($('p', 'div.series-summary-wrapper').text().trim() ?? 'No description available')

    let hentai = false
    const arrayTags: Tag[] = []
    for (const tag of $('a', $('div.ui.list', 'div.item')).toArray()) {

        const label: string = $(tag).text().trim()
        const id: string = $(tag).attr('href')?.replace('/category/', '') ?? ''
        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true //These tags don't exist on Readm, but they may be added in the future!
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus: string = $('div.series-genres').text().trim()
    let status = MangaStatus.ONGOING
    switch (rawStatus.toLocaleUpperCase()) {
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
        image: image,
        hentai: hentai,
        status: status,
        author: author,
        artist: artist,
        tags: tagSections,
        desc: description,
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('div.season_start').toArray()) {

        const title: string = $('h6.truncate', chapter).first().text().trim() ?? ''
        const rawChapterId: string = $('a', chapter).attr('href') ?? ''

        const chapRegex = rawChapterId.match(/\/manga\/(?:.*)\/(.+)\//)
        let chapterId = null
        if (chapRegex && chapRegex[1]) chapterId = chapRegex[1]
        if (!chapterId) continue

        const chapNumRegex = title.match(/(\d+\.?\d?)+/)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        const date: Date = parseDate($('td.episode-date', chapter)?.text() ?? '')

        if (!chapterId || !title) continue

        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: decodeHTMLEntity(title),
            langCode: LanguageCode.ENGLISH,
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: date,
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    try {
        const html = $.html()
        const imgRegex = html.match(/chapter\['pages'\]\W=\W(.*?);/)
        let imgJson = ''

        if (imgRegex && imgRegex[1]) imgJson = imgRegex[1]
        const json = JSON.parse(imgJson)

        for (const prop of json) {
            pages.push(`https://www.readm.org${prop.src}`)
        }

        const chapterDetails = createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })

        return chapterDetails
    } catch (error) {
        throw new Error('Something went wrong trying to parse images!')
    }
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
    const arrayTags: Tag[] = []
    for (const tag of $('li', 'ul.trending-thisweek.categories').toArray()) {
        const label = $('a', tag).text().trim()
        const id = $('a', tag).attr('href')?.replace('/category/', '') ?? ''
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export interface UpdatedManga {
    ids: string[],
    loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
    const updatedManga: string[] = []
    let loadMore = true

    for (const manga of $('div.poster.poster-xs', $('ul.clearfix.latest-updates').first()).toArray()) {
        const id: string = $('a', manga).attr('href')?.replace('/manga/', '') ?? ''
        const mangaDate: Date = parseDate($('span.date', manga).text().trim() ?? '')
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
    const hotUpdateSection = createHomeSection({ id: 'hot_update', title: 'Hot Manga Updates' })
    const popularMangaSection = createHomeSection({ id: 'popular_manga', title: 'Popular Manga', view_more: true })
    const latestUpdateSection = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true })
    const newMangaSection = createHomeSection({ id: 'new_manga', title: 'New Manga' })

    //Hot Mango Update
    const hotMangaUpdate: MangaTile[] = []
    for (const manga of $('div.item', 'div#manga-hot-updates').toArray()) {

        const title: string = $('strong', manga).text().trim()

        const rawId: string = $('a', manga).attr('href') ?? ''
        const idRegex = rawId.match(/\/manga\/(.*?)\//)
        let id = null
        if (idRegex && idRegex[1]) id = idRegex[1]

        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : 'https://i.imgur.com/GYUxEX8.png'
        let subtitle: string = $('a.caption > span', manga).text().trim()
        subtitle = subtitle ? ('Chapter ' + subtitle) : ''

        if (!id || !title) continue
        hotMangaUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    hotUpdateSection.items = hotMangaUpdate
    sectionCallback(hotUpdateSection)

    //Popular Mango
    const popularManga: MangaTile[] = []
    for (const manga of $('ul#latest_trailers li').toArray()) {

        const title: string = $('h6', manga).text().trim()
        const id: string = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : 'https://i.imgur.com/GYUxEX8.png'
        const subtitle: string = $('small', manga).first().text().trim() ?? ''

        if (!id || !title) continue
        popularManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    popularMangaSection.items = popularManga
    sectionCallback(popularMangaSection)

    //Latest Mango
    const latestManga: MangaTile[] = []
    for (const manga of $('div.poster.poster-xs', $('ul.clearfix.latest-updates').first()).toArray()) {

        const title: string = $('h2', manga).first().text().trim()
        const id: string = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : 'https://i.imgur.com/GYUxEX8.png'
        let subtitle: string = $('div.poster-subject > ul.chapters > li', manga).first().text().trim()
        subtitle = subtitle ? ('Chapter ' + subtitle) : ''

        if (!id || !title) continue
        latestManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    latestUpdateSection.items = latestManga
    sectionCallback(latestUpdateSection)

    //New Mango
    const newManga: MangaTile[] = []
    for (const manga of $('li', 'ul.clearfix.mb-0').toArray()) {

        const title: string = $('h2', manga).first().text().trim()
        const id: string = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : 'https://i.imgur.com/GYUxEX8.png'

        if (!id || !title) continue
        newManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }))
    }
    newMangaSection.items = newManga
    sectionCallback(newMangaSection)
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
    const manga: MangaTile[] = []

    if (homepageSectionId === 'popular_manga') {
        for (const m of $('li.mb-lg', 'ul.filter-results').toArray()) {

            const title: string = $('h2', m).first().text().trim()
            const id: string = $('a', m).attr('href')?.split('/').pop() ?? ''
            const parseImage = getImageSrc($('img', m))
            const image: string = parseImage ? (RM_DOMAIN + parseImage) : 'https://i.imgur.com/GYUxEX8.png'

            if (!id || !title) continue
            manga.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
            }))
        }

    } else {
        for (const m of $('div.poster.poster-xs', $('ul.clearfix.latest-updates').first()).toArray()) {
            const title: string = $('h2', m).first().text().trim()
            const id: string = $('a', m).attr('href')?.split('/').pop() ?? ''
            const parseImage = getImageSrc($('img', m))
            const image: string = parseImage ? (RM_DOMAIN + parseImage) : 'https://i.imgur.com/GYUxEX8.png'

            if (!id || !title) continue
            manga.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
            }))
        }
    }
    return manga
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
        image = null
    }

    return encodeURI(decodeURI(decodeHTMLEntity(image?.trim() ?? '')))
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = true
    const hasNext = Boolean($('a:contains(»)', 'div.ui.pagination.menu')[0])
    if (hasNext) isLast = false
    return isLast
}
