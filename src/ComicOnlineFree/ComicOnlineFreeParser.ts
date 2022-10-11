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
    titles.push(decodeHTMLEntity($('td:contains(Name:)').first().next().text().trim()))
    titles.push(decodeHTMLEntity($('td:contains(Alternate Name:)').next().text().trim()))

    let image = $('img', 'div.manga-image').attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
    image = image.startsWith('/') ? 'https:' + image : image

    const author = $('td:contains(Author:)').next().text().trim()

    const arrayTags: Tag[] = []
    for (const tag of $('a', $('td:contains(Genre)').next()).toArray()) {
        const label = $(tag).text().trim()
        const id = label.replace(/\s/g, '+')

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const description = decodeHTMLEntity($('p.pdesc').text().trim())

    const rawStatus = $('td:contains(Status:)').next().text().trim()
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
        artist: author,
        tags: tagSections,
        desc: description,
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const chapter of $('li', 'ul.basic-list').toArray()) {
        const title = decodeHTMLEntity($('a.ch-name', chapter).text().trim())
        const chapterId: string = $('a', chapter).attr('href')?.split('/').pop() ?? ''

        if (!chapterId) continue
        const date = new Date($('span', chapter).text())

        const chapNumRegex = chapterId.match(/(\d+\.?\d?)+/)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        chapters.push({
            id: chapterId,
            mangaId,
            name: title,
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

    for (const img of $('img', 'div.chapter-container').toArray()) {
        const image = img.attribs['data-original']
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

    for (const manga of $('div.hl-box', 'div.home-list').first().toArray()) {
        const id = $('a', manga).attr('href')?.split('/').pop()
        if (!id) continue

        const rawDate = $('div.date', manga).text().trim()
        let mangaDate = new Date()
        switch (rawDate.toLowerCase()) {
            case 'today':
                mangaDate = new Date()
                break
            case 'yesterday':
                mangaDate = new Date(Date.now() - 86400000)
                break
            default:
                mangaDate = new Date(rawDate)
                break
        }

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
    const popularSection = createHomeSection({ id: 'popular', title: 'Popular Comics', view_more: true, type: HomeSectionType.singleRowLarge })
    const hotSection = createHomeSection({ id: 'hot', title: 'Hot Comics', view_more: true })
    const updateSection = createHomeSection({ id: 'update', title: 'Latest Updates Comics', view_more: false })

    //Popular
    const popularSection_Array: MangaTile[] = []
    for (const manga of $('li.list-top-movie-item', 'div.right-box-content').toArray()) {
        const image: string = $('img', manga).attr('src') ?? ''


        const title: string = $('span.list-top-movie-item-vn', manga).text().trim() ?? ''
        const id = $('a', manga).attr('href')?.split('/').pop()?.trim()
        let subtitle: string = $('a.chapter', manga).text() ?? ''
        subtitle = subtitle.substring(subtitle.indexOf('#'))?.trim()

        if (!id || !title) continue
        popularSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
        }))
    }

    popularSection.items = popularSection_Array
    sectionCallback(popularSection)

    //Update
    const updateSection_Array: MangaTile[] = []
    for (const manga of $('li.manga-box', 'ul.home-list').toArray()) {
        const image: string = $('img', manga).attr('data-original') ?? ''

        const title: string = $('img', manga).attr('alt')?.trim() ?? ''
        const id = $('a', manga).attr('href')?.split('/').pop()?.trim()
        let subtitle: string = $('div.detail > a', manga).text().trim()
        subtitle = subtitle.substring(subtitle.indexOf('#'))?.trim()

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

    //Hot
    const hotSection_Array: MangaTile[] = []
    for (const manga of $('li.manga-box.hotbox', 'ul.home-list').toArray()) {
        const image: string = $('img', manga).attr('data-original') ?? ''

        const title: string = $('img', manga).attr('alt')?.trim() ?? ''
        const id = $('a', manga).attr('href')?.split('/').pop()?.trim()
        let subtitle: string = $('div.detail > a', manga).text().trim()
        subtitle = subtitle.substring(subtitle.indexOf('#'))?.trim()

        if (!id || !title) continue
        hotSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) })
        }))
    }

    hotSection.items = hotSection_Array
    sectionCallback(hotSection)
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
    const manga: MangaTile[] = []
    const collectedIds: string[] = []

    for (const obj of $('div.manga-box', 'div.home-list').toArray()) {
        const image: string = $('img', obj).attr('data-original') ?? ''

        const title: string = $('img', obj).attr('alt')?.trim() ?? ''
        const id = $('a', obj).attr('href')?.split('/').pop()?.trim()
        let subtitle: string = $('div.detail > a', obj).first().text().trim()
        subtitle = subtitle.substring(subtitle.indexOf('#'))?.trim()

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

    for (const tag of $('li', 'ul.search-checks').toArray()) {
        const label = $(tag).text().trim() ?? ''
        const id = $(tag).text().trim().replace(/\s/g, '+') ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
    const mangas: MangaTile[] = []

    for (const obj of $('div.manga-box', 'div.result-left').toArray()) {
        const id = $('a', obj).attr('href')?.split('/').pop()?.trim()
        const image: string = $('img', obj).attr('data-original') ?? ''
        const title: string = $('img', obj).attr('alt')?.trim() ?? ''
        const subtitle: string = $('div.detail', obj).first().text().trim()

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

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = false

    const items = []
    for (const page of $('a', 'div.general-nav').toArray()) {
        items.push($(page).text().trim().toLowerCase())
    }

    if (!items.includes('next')) isLast = true
    return isLast
}