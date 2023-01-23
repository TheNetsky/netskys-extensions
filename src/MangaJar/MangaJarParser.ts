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

import entities = require('entities')

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const titles: string[] = []

    titles.push(decodeHTMLEntity($('span.post-name', 'div.card-body').text().trim())) // Main English Title
    titles.push(decodeHTMLEntity($('h2.post-name-jp.h5', 'div.row').text().trim())) // Japanese Title
    titles.push(decodeHTMLEntity($('h2.h6', 'div.row').text().trim())) // Kanji Title

    const image = getImageSrc($('img', 'div.col-md-5.col-lg-4.text-center'))
    const description = decodeHTMLEntity($('div.manga-description.entry').text().trim())

    const arrayTags: Tag[] = []
    for (const tag of $('div.post-info > span > a[href*=genre]').toArray()) {
        const label = $(tag).text().trim()
        const id = encodeURI($(tag).attr('href')?.replace('/genre/', '') ?? '')

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    const rawStatus = $('span:contains(Status:)', 'div.post-info').text()?.split(':')[1]?.trim() ?? ''
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
            tags: tagSections,
            desc: description
        })
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
        chapters.push(App.createChapter({
            id,
            name: chapterName ? decodeHTMLEntity(chapterName) : 'Chapter ' + chapNum,
            langCode: 'ENG',
            chapNum: chapNum,
            time: date
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const img of $('img', 'div.mt-1').toArray()) {
        const image = getImageSrc($(img))
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

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const sections = [
        {
            sectionID: App.createHomeSection({
                id: 'hot_update',
                title: 'Top Manga Updates',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.row.splider').get(0)
        },
        {
            sectionID: App.createHomeSection({
                id: 'new_trending',
                title: 'New Trending',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.row.splider').get(1)
        },
        {
            sectionID: App.createHomeSection({
                id: 'popular_manga',
                title: 'Popular Manga',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.row.splider').get(2)
        },
        {
            sectionID: App.createHomeSection({
                id: 'new_manga',
                title: 'Recently Added',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.row.splider').get(3)
        }
    ]

    const collectedIds: string[] = []

    for (const section of sections) {
        const mangaArray: PartialSourceManga[] = []

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

            mangaArray.push(App.createPartialSourceManga({
                image: image,
                title: decodeHTMLEntity(title),
                mangaId: id,
                subtitle: subtitle
            }))
        }
        section.sectionID.items = mangaArray
        sectionCallback(section.sectionID)
    }
}

export const parseSearch = ($: CheerioStatic, isGenre: boolean): PartialSourceManga[] => {
    const mangas: PartialSourceManga[] = []

    if (isGenre) {
        for (const manga of $('article[class*=flex-item-mini]', $('div.row')).toArray()) {
            const id = $('a', manga).attr('href')?.replace('/manga/', '') ?? ''
            const title = $('a', manga).attr('title')?.trim()
            const image = getImageSrc($('img', manga))

            let subtitle = $('a', $('li.list-group-item', manga)).text().trim() ?? ''
            subtitle ? subtitle = 'Chapter ' + subtitle : ''

            if (!id || !title) continue
            mangas.push(App.createPartialSourceManga({
                image: image,
                title: decodeHTMLEntity(title),
                mangaId: id,
                subtitle: subtitle
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
            mangas.push(App.createPartialSourceManga({
                image: image,
                title: decodeHTMLEntity(title),
                mangaId: id,
                subtitle: subtitle
            }))
        }
    }
    return mangas
}

export const parseViewMore = ($: CheerioStatic): PartialSourceManga[] => {
    const mangas: PartialSourceManga[] = []

    for (const manga of $('article[class*=flex-item]', $('div.flex-container.row')).toArray()) {
        const id = $('a', manga).attr('href')?.replace('/manga/', '') ?? ''
        const title = $('a', manga).attr('title')?.trim()
        const image = getImageSrc($('img', manga))

        let subtitle = $('a', $('li.list-group-item', manga)).text().trim() ?? ''
        subtitle ? subtitle = 'Chapter ' + subtitle : ''

        if (!id || !title) continue
        mangas.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
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

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
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
        image = ''
    }
    return encodeURI(image ?? '')
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = false
    const pages: number[] = []

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

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}