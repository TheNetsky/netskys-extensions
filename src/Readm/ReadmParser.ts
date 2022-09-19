import {
    Chapter,
    ChapterDetails,
    Tag,
    HomeSection,
    SourceManga,
    PartialSourceManga,
    TagSection
} from '@paperback/types'

import entities = require('entities');

const RM_DOMAIN = 'https://readm.org'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const titles: string[] = []

    titles.push(decodeHTMLEntity($('h1.page-title').text().trim()))
    const altTitles: string[] = $('div.sub-title.pt-sm').text().split(/, |; |\| /)

    for (const t of altTitles) {
        titles.push(decodeHTMLEntity(t.trim()))
    }

    // Check if the image extension could be parsed, if it can, complete it with the domain, else display failback image.
    const parseImage = getImageSrc($('img.series-profile-thumb'))
    const image: string = parseImage ? (RM_DOMAIN + parseImage) : ''
    const author: string = $('small', 'span#first_episode').text().trim() ?? ''
    const artist: string = $('small', 'span#last_episode').text().trim() ?? ''
    const description: string = decodeHTMLEntity($('p', 'div.series-summary-wrapper').text().trim() ?? 'No description available')

    const arrayTags: Tag[] = []
    for (const tag of $('a', $('div.ui.list', 'div.item')).toArray()) {
        const label: string = $(tag).text().trim()
        const id: string = $(tag).attr('href')?.replace('/category/', '') ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    const rawStatus: string = $('div.series-genres').text().trim()
    let status = 'ONGOING'
    switch (rawStatus.toLocaleUpperCase()) {
        case 'ONGOING':
            status = 'ONGOING'
            break
        case 'COMPLETED':
            status = 'COMPLETED'
            break
        default:
            status = 'ONGOING'
            break
    }
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: image,
            status: status,
            author: author,
            artist: artist,
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapters = ($: CheerioStatic): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('div.season_start').toArray()) {
        const title: string = $('h6.truncate', chapter).first().text().trim() ?? ''
        const rawChapterId: string = $('a', chapter).attr('href') ?? ''
        const chapRegex = rawChapterId.match(/\/manga\/(?:.*)\/(.+)\//)

        let chapterId = null
        if (chapRegex && chapRegex[1]) chapterId = chapRegex[1]

        const chapNumRegex = title.match(/(\d+\.?\d?)+/)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        const date: Date = parseDate($('td.episode-date', chapter)?.text() ?? '')

        if (!chapterId || !title) continue

        chapters.push(App.createChapter({
            id: chapterId,
            name: decodeHTMLEntity(title),
            langCode: 'ENG',
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: date
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const page of $('div.ch-images img').toArray()) {
        let rawPage = getImageSrc($(page))
        if (!rawPage) continue

        rawPage = RM_DOMAIN + rawPage
        pages.push(rawPage)
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
    const arrayTags: Tag[] = []

    for (const tag of $('li', 'ul.trending-thisweek.categories').toArray()) {
        const label = $('a', tag).text().trim()
        const id = $('a', tag).attr('href')?.replace('/category/', '') ?? ''
        if (!id || !label) continue

        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections
}

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const hotUpdateSection = App.createHomeSection({
        id: 'hot_update',
        title: 'Hot Manga Updates',
        containsMoreItems: false,
        type: 'singleRowNormal'
    })

    const popularMangaSection = App.createHomeSection({
        id: 'popular_manga',
        title: 'Popular Manga',
        containsMoreItems: true,
        type: 'singleRowNormal'
    })

    const latestUpdateSection = App.createHomeSection({
        id: 'latest_updates',
        title: 'Latest Updates',
        containsMoreItems: true,
        type: 'singleRowNormal'
    })

    const newMangaSection = App.createHomeSection({
        id: 'new_manga',
        title: 'New Manga',
        containsMoreItems: false,
        type: 'singleRowNormal'
    })

    // Hot Update
    const hotMangaUpdate: PartialSourceManga[] = []
    for (const manga of $('div.item', 'div#manga-hot-updates').toArray()) {
        const title: string = $('strong', manga).text().trim()
        const rawId: string = $('a', manga).attr('href') ?? ''

        const idRegex = rawId.match(/\/manga\/(.*?)\//)

        let id = null
        if (idRegex && idRegex[1]) id = idRegex[1]

        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : ''

        let subtitle: string = $('a.caption > span', manga).text().trim()
        subtitle = subtitle ? ('Chapter ' + subtitle) : ''

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

    // Popular
    const popularManga: PartialSourceManga[] = []
    for (const manga of $('ul#latest_trailers li').toArray()) {
        const title: string = $('h6', manga).text().trim()
        const id: string = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : ''
        const subtitle: string = $('small', manga).first().text().trim() ?? ''

        if (!id || !title) continue
        popularManga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    popularMangaSection.items = popularManga
    sectionCallback(popularMangaSection)

    // Latest
    const latestManga: PartialSourceManga[] = []
    for (const manga of $('div.poster.poster-xs', $('ul.clearfix.latest-updates').first()).toArray()) {
        const title: string = $('h2', manga).first().text().trim()
        const id: string = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : ''

        let subtitle: string = $('div.poster-subject > ul.chapters > li', manga).first().text().trim()
        subtitle = subtitle ? ('Chapter ' + subtitle) : ''

        if (!id || !title) continue
        latestManga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    latestUpdateSection.items = latestManga
    sectionCallback(latestUpdateSection)

    // New
    const newManga: PartialSourceManga[] = []
    for (const manga of $('li', 'ul.clearfix.mb-0').toArray()) {
        const title: string = $('h2', manga).first().text().trim()
        const id: string = $('a', manga).attr('href')?.split('/').pop() ?? ''
        const parseImage = getImageSrc($('img', manga))
        const image: string = parseImage ? (RM_DOMAIN + parseImage) : ''

        if (!id || !title) continue
        newManga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: undefined
        }))
    }
    newMangaSection.items = newManga
    sectionCallback(newMangaSection)
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): PartialSourceManga[] => {
    const manga: PartialSourceManga[] = []

    if (homepageSectionId === 'popular_manga') {
        for (const m of $('li.mb-lg', 'ul.filter-results').toArray()) {
            const title: string = $('h2', m).first().text().trim()
            const id: string = $('a', m).attr('href')?.split('/').pop() ?? ''
            const parseImage = getImageSrc($('img', m))
            const image: string = parseImage ? (RM_DOMAIN + parseImage) : ''

            if (!id || !title) continue
            manga.push(App.createPartialSourceManga({
                image,
                title: decodeHTMLEntity(title),
                mangaId: id,
                subtitle: undefined
            }))
        }

    } else {
        for (const m of $('div.poster.poster-xs', $('ul.clearfix.latest-updates').first()).toArray()) {
            const title: string = $('h2', m).first().text().trim()
            const id: string = $('a', m).attr('href')?.split('/').pop() ?? ''
            const parseImage = getImageSrc($('img', m))
            const image: string = parseImage ? (RM_DOMAIN + parseImage) : ''

            if (!id || !title) continue
            manga.push(App.createPartialSourceManga({
                image,
                title: decodeHTMLEntity(title),
                mangaId: id,
                subtitle: undefined
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
    const hasNext = Boolean($('a:contains(\u00BB)', 'div.ui.pagination.menu')[0])

    if (hasNext) isLast = false
    return isLast
}
