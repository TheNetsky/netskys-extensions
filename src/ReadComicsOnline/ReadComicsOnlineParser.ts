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

    const titles: string[] = []
    titles.push(decodeHTMLEntity($('h2.listmanga-header').first().text().trim()))

    let image: string = $('img', 'div.boxed').attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
    if (image.startsWith('/')) image = 'https:' + image

    const author: string = $('dd', $('dt:contains(Type)').parent()).text().trim() ?? ''
    const description: string = decodeHTMLEntity($('p', 'div.manga.well').text().trim() ?? '')

    let hentai = false
    const arrayTags: Tag[] = []
    for (const tag of $('a', 'dd.tag-links').toArray()) {
        const label: string = $(tag).text().trim()
        const id: string = $(tag).attr('href')?.split('/').pop() ?? ''

        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus: string = $('span.label').text().trim() ?? ''
    let status = MangaStatus.ONGOING
    if (rawStatus.toUpperCase().includes('COMPLETED')) status = MangaStatus.COMPLETED

    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        hentai: hentai,
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

    for (const chapter of $('li', 'ul.chapters').toArray()) {
        const title: string = $('h5.chapter-title-rtl', chapter).text().trim() ?? ''
        const chapterId: string = $('a', chapter).attr('href')?.split('/').pop()?.split('?').shift() ?? ''

        if (!chapterId) continue

        const chapNum = Number(chapterId) //We're manually setting the chapters regarless, however usually the ID equals the chapter number.


        const date: Date = new Date($('div.date-chapter-title-rtl', chapter).last().text().trim())

        if (!chapterId || !title) continue

        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: decodeHTMLEntity(title),
            langCode: LanguageCode.ENGLISH,
            chapNum: isNaN(chapNum) ? 0 : chapNum,
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

    for (const images of $('img', 'div#all').toArray()) {
        let image: any = $(images).attr('data-src')?.trim()
        if (image.startsWith('/')) image = 'https:' + image
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
    ids: string[],
    loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
    const updatedManga: string[] = []
    let loadMore = true

    for (const manga of $('div.manga-item', 'div.mangalist').toArray()) {
        const id = $('h3.manga-heading > a', manga).attr('href')?.split('/').pop() ?? ''
        const date = $('small.pull-right', manga).text().trim()
        let mangaDate = new Date()
        if (date.toUpperCase() !== 'TODAY') {
            const datePieces = date.split('/')
            mangaDate = new Date(`${datePieces[1]}-${datePieces[0]}-${datePieces[2]}`)
        }

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
    const hotSection = createHomeSection({ id: 'hot_comic', title: 'Hot Comics', view_more: false })
    const latestSection = createHomeSection({ id: 'latest_comic', title: 'Latest Comics', view_more: true })
    const popularSection = createHomeSection({ id: 'popular_comic', title: 'Most Popular Comics', view_more: true })

    //Hot Comics
    const hotSection_Array: MangaTile[] = []
    for (const comic of $('li.schedule-item', 'div.carousel').toArray()) {
        let image: string = $('div.schedule-avatar > a > img', comic).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('div.schedule-name', comic).first().text().trim() ?? ''
        const id: string = $('div.schedule-name > a', comic).attr('href')?.split('/').pop() ?? ''
        const subtitle: string = $('div.schedule-date', comic).first().text().trim() ?? ''

        if (!id || !title) continue
        hotSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    hotSection.items = hotSection_Array
    sectionCallback(hotSection)

    //Latest Comics
    const latestSection_Array: MangaTile[] = []
    for (const comic of $('div.media', 'div.list-container > div.row').toArray()) {
        let image: string = $('div.media-left > a > img', comic).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('h5.media-heading > a > strong', comic).first().text().trim() ?? ''
        const id: string = $('h5.media-heading > a', comic).attr('href')?.split('/').pop() ?? ''
        const subtitle: string = $('div.media-body > div > a', comic).first().text().trim() ?? ''

        if (!id || !title) continue
        latestSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    latestSection.items = latestSection_Array
    sectionCallback(latestSection)

    //Popular Comics
    const popularSection_Array: MangaTile[] = []
    for (const comic of $('div.media', 'div.widget-container > div.panel').toArray()) {
        let image: string = $('div.media-left > a > img', comic).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('h5.media-heading > a > strong', comic).first().text().trim() ?? ''
        const id: string = $('h5.media-heading > a', comic).attr('href')?.split('/').pop() ?? ''

        if (!id || !title) continue
        popularSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }))
    }

    popularSection.items = popularSection_Array
    sectionCallback(popularSection)

}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
    const comics: MangaTile[] = []
    const collectedIds: string[] = []

    for (const item of $('div.media').toArray()) {
        let image: string = $('div.media-left > a > img', item).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('h5.media-heading > a > strong', item).first().text().trim() ?? ''
        const id: string = $('h5.media-heading > a', item).attr('href')?.split('/').pop() ?? ''
        const subtitle: string = $('div.media-body > div > a', item).first().text().trim() ?? ''

        if (!id || !title) continue

        if (collectedIds.includes(id)) continue
        comics.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
        collectedIds.push(id)

    }
    return comics
}

export const parseSearch = (data: any): MangaTile[] => {
    const comics: MangaTile[] = []
    const collectedIds: string[] = []

    const parsedData = JSON.parse(data)
    for (const item of parsedData.suggestions) {
        const id: string = item.data
        const image = `https://readcomicsonline.ru/uploads/manga/${id}/cover/cover_250x350.jpg`
        const title: string = item.value

        if (!id || !title) continue

        if (collectedIds.includes(id)) continue
        comics.push(createMangaTile({
            id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }))
        collectedIds.push(id)
    }

    return comics
}
const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
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
    const currentPage = Number($('li.active').text().trim())
    if (currentPage >= lastPage) isLast = true
    return isLast
}
