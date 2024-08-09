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

import { decode as decodeHTMLEntity } from 'html-entities'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const titles: string[] = []

    titles.push(decodeHTMLEntity($('h2.listmanga-header').first().text().trim()))

    let image: string = $('img', 'div.boxed').attr('src') ?? ''
    if (image.startsWith('/')) image = 'https:' + image

    const author: string = $('dd', $('dt:contains(Type)').parent()).text().trim() ?? ''
    const description: string = decodeHTMLEntity($('p', 'div.manga.well').text().trim() ?? '')

    const arrayTags: Tag[] = []
    for (const tag of $('a', 'dd.tag-links').toArray()) {
        const label: string = $(tag).text().trim()
        const id: string = $(tag).attr('href')?.split('/').pop() ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    const rawStatus: string = $('span.label').text().trim() ?? ''
    let status = 'Ongoing'
    if (rawStatus.toUpperCase().includes('COMPLETED')) status = 'Completed'

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: image,
            status: status,
            author: author,
            artist: author,
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const chapter of $('li', 'ul.chapters').toArray()) {
        const title: string = $('h5.chapter-title-rtl', chapter).text().trim() ?? ''
        const chapterId: string = $('a', chapter).attr('href')?.split('/').pop()?.split('?').shift() ?? ''

        if (!chapterId) continue

        const chapNum = Number(chapterId) // We're manually setting the chapters regarless, however usually the ID equals the chapter number.

        const date: Date = new Date($('div.date-chapter-title-rtl', chapter).last().text().trim())

        if (!chapterId || !title) continue

        chapters.push({
            id: chapterId,
            name: decodeHTMLEntity(title),
            langCode: '🇬🇧',
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: date,
            sortingIndex,
            volume: 0,
            group: ''
        })
        sortingIndex--
    }

    if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
    }

    return chapters.map(chapter => {
        chapter.sortingIndex += chapters.length
        return App.createChapter(chapter)
    })
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const images of $('img', 'div#all').toArray()) {
        let image: any = $(images).attr('data-src')?.trim()
        if (image.startsWith('/')) image = 'https:' + image
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
    const hotSection = App.createHomeSection({
        id: 'hot_comic', title: 'Hot Comics', containsMoreItems: false,
        type: HomeSectionType.singleRowNormal
    })

    const latestSection = App.createHomeSection({
        id: 'latest_comic', title: 'Latest Comics', containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    const popularSection = App.createHomeSection({
        id: 'popular_comic', title: 'Most Popular Comics', containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    // Hot
    const hotSection_Array: PartialSourceManga[] = []
    for (const comic of $('li.schedule-item', 'div.carousel').toArray()) {
        let image: string = $('div.schedule-avatar > a > img', comic).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('div.schedule-name', comic).first().text().trim() ?? ''
        const id: string = $('div.schedule-name > a', comic).attr('href')?.split('/').pop() ?? ''
        const subtitle: string = $('div.schedule-date', comic).first().text().trim() ?? ''

        if (!id || !title) continue
        hotSection_Array.push(App.createPartialSourceManga({
            mangaId: id,
            image: image,
            title: decodeHTMLEntity(title),
            subtitle: subtitle
        }))
    }

    hotSection.items = hotSection_Array
    sectionCallback(hotSection)

    // Latest
    const latestSection_Array: PartialSourceManga[] = []
    for (const comic of $('div.media', 'div.list-container > div.row').toArray()) {
        let image: string = $('div.media-left > a > img', comic).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('h5.media-heading > a > strong', comic).first().text().trim() ?? ''
        const id: string = $('h5.media-heading > a', comic).attr('href')?.split('/').pop() ?? ''
        const subtitle: string = $('div.media-body > div > a', comic).first().text().trim() ?? ''

        if (!id || !title) continue
        latestSection_Array.push(App.createPartialSourceManga({
            mangaId: id,
            image: image,
            title: decodeHTMLEntity(title),
            subtitle: subtitle
        }))
    }

    latestSection.items = latestSection_Array
    sectionCallback(latestSection)

    // Popular
    const popularSection_Array: PartialSourceManga[] = []
    for (const comic of $('div.media', 'div.widget-container > div.panel').toArray()) {
        let image: string = $('div.media-left > a > img', comic).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('h5.media-heading > a > strong', comic).first().text().trim() ?? ''
        const id: string = $('h5.media-heading > a', comic).attr('href')?.split('/').pop() ?? ''

        if (!id || !title) continue
        popularSection_Array.push(App.createPartialSourceManga({
            mangaId: id,
            image: image,
            title: decodeHTMLEntity(title)
        }))
    }

    popularSection.items = popularSection_Array
    sectionCallback(popularSection)
}

export const parseViewMore = ($: CheerioStatic): PartialSourceManga[] => {
    const comics: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const item of $('div.media').toArray()) {
        let image: string = $('div.media-left > a > img', item).first().attr('src') ?? ''
        if (image.startsWith('/')) image = 'https:' + image

        const title: string = $('h5.media-heading > a > strong', item).first().text().trim() ?? ''
        const id: string = $('h5.media-heading > a', item).attr('href')?.split('/').pop() ?? ''
        const subtitle: string = $('div.media-body > div > a', item).first().text().trim() ?? ''

        if (!id || !title || collectedIds.includes(id)) continue
        comics.push(App.createPartialSourceManga({
            mangaId: id,
            image: image,
            title: decodeHTMLEntity(title),
            subtitle: subtitle
        }))
        collectedIds.push(id)

    }
    return comics
}

export const parseSearch = (data: string): PartialSourceManga[] => {
    const comics: PartialSourceManga[] = []
    const collectedIds: string[] = []

    const parsedData = JSON.parse(data)
    for (const item of parsedData.suggestions) {
        const id: string = item.data
        const image = `https://readcomicsonline.ru/uploads/manga/${id}/cover/cover_250x350.jpg`
        const title: string = item.value

        if (!id || !title || collectedIds.includes(id)) continue
        comics.push(App.createPartialSourceManga({
            mangaId: id,
            image: image,
            title: decodeHTMLEntity(title)
        }))

        collectedIds.push(id)
    }

    return comics
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = false
    const pages: number[] = []

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