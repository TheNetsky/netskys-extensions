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
    titles.push(decodeHTMLEntity($('div.info-title > h1').text()?.trim() ?? ''))
    const altTitles = $('div.info-title > h3').text().trim().split(';')
    for (const title of altTitles) {
        titles.push(decodeHTMLEntity(title.trim()))
    }

    const image = $('img', 'div.col-md-4.col-sm-4.info-img').attr('src') ?? ''

    const infoSections = $('.info-c').first()

    const author = $($('.info', infoSections).get(0)).text().trim()
    const artist = $($('.info', infoSections).get(1)).text().trim()

    const arrayTags: Tag[] = []
    for (const tag of $('a', $('.info', infoSections).get(3)).toArray()) {
        const label = $(tag).text().trim()
        const id = encodeURI(idCleaner($(tag).attr('href')?.split('/').pop()?.trim() ?? ''))

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const description = decodeHTMLEntity($('div.content-info > div').first().text().trim() ?? '')

    const rawStatus = $($('.info', infoSections).get(4)).text().trim()
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
        image: image,
        status: status,
        author: author,
        artist: artist,
        tags: tagSections,
        desc: description
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const chapter of $('tr', 'div.list-chapter').toArray()) {
        const title = decodeHTMLEntity($('td.name > a', chapter).children().remove().end().text().trim())
        const chapterId = $('a', chapter).attr('href')?.replace('https://mangahasu.se/', '') ?? ''

        if (!chapterId || !title) continue

        const date = new Date($('td.date-updated', chapter).text().trim())

        const chapNumRegex = title.match(/chapter\s(\d+\.?\d*|\.\d+)/i)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        const volNumRegex = title.match(/(?:vol|volume)\s(\d+\.?\d*|\.\d+)/i)
        let volNum = 0
        if (volNumRegex && volNumRegex[1]) volNum = Number(volNumRegex[1])

        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: `Chapter ${chapNum}`,
            langCode: LanguageCode.ENGLISH,
            chapNum: chapNum,
            volume: volNum,
            time: date,
            // @ts-ignore
            sortingIndex
        }))
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

    for (const img of $('img', 'div.img').toArray()) {
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

    for (const obj of $('div.div_item', 'div.st_content > ul.list_manga').toArray()) {
        const id = $('a', obj).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        if (!id) continue

        const rawDate = $('p.date_created', obj).children().remove().end().text().trim() ?? ''
        const mangaDate = new Date(Date.parse(rawDate))

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
    const recommendSection = createHomeSection({ id: 'recommend', title: 'Recommended', view_more: false, type: HomeSectionType.featured })
    const updateSection = createHomeSection({ id: 'update', title: 'Latest Updated', view_more: true })
    const viewedTodaySection = createHomeSection({ id: 'today', title: 'Most viewed today', view_more: false })

    // Recommend
    const recommendSection_Array: MangaTile[] = []
    for (const manga of $('div.div_item', 'div.pinked-content').toArray()) {

        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('img', manga).first().attr('alt') ?? ''

        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('a.name-chapter', manga).text().trim() ?? ''

        if (!id || !title) continue
        recommendSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
        }))
    }

    recommendSection.items = recommendSection_Array
    sectionCallback(recommendSection)

    // Update
    const updateSection_Array: MangaTile[] = []
    for (const manga of $('div.div_item', 'div.col-xs-12.wrapper_content').toArray()) {

        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('img', manga).first().attr('alt') ?? ''

        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('a.name-chapter', manga).text().trim() ?? ''

        if (!id || !title) continue
        updateSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
        }))
    }

    updateSection.items = updateSection_Array
    sectionCallback(updateSection)

    // Viewed Today
    const viewedTodaySection_Array: MangaTile[] = []
    for (const manga of $('li', 'div.col-xs-12.mgtop10.mvtd').toArray()) {

        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('img', manga).first().attr('alt') ?? ''

        const id = $('a', manga).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('a.name-chapter', manga).text()?.replace('Read online', '').trim() ?? ''

        if (!id || !title) continue
        viewedTodaySection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
        }))
    }

    viewedTodaySection.items = viewedTodaySection_Array
    sectionCallback(viewedTodaySection)

}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
    const manga: MangaTile[] = []
    const collectedIds: string[] = []

    for (const obj of $('div.div_item', 'div.st_content > ul.list_manga').toArray()) {
        const image: string = $('img', obj).first().attr('src') ?? ''
        const title: string = $('img', obj).first().attr('alt') ?? ''

        const id = $('a', obj).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        const subtitle: string = $('a.name-chapter', obj).text()?.replace('Read online', '').trim() ?? ''

        if (!id || !title) continue

        if (!collectedIds.includes(id)) {
            manga.push(createMangaTile({
                id,
                image: image,
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

    for (const tag of $('li', 'li.dropdown.genres').toArray()) {
        const label = $(tag).text().trim() ?? ''
        const id = encodeURI(idCleaner($('a', tag).attr('href')?.split('/').pop()?.trim() ?? ''))

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = true
    const hasNext = Boolean($('a:contains(Last)', 'div.pagination-ct').first())
    if (hasNext) isLast = false
    return isLast
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

const idCleaner = (str: string): string => {
    return str.split('?').shift() ?? ''
}
