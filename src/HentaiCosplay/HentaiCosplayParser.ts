import {
    Chapter,
    ChapterDetails,
    HomeSection,
    SourceManga,
    PartialSourceManga,
    HomeSectionType
} from '@paperback/types'

import entities = require('entities')

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const title: string = decodeHTMLEntity($('span#title > h2').text().trim())

    const image = $('img', $('div.icon-overlay')).first().attr('src') ?? ''
    const description = `Gallery: ${title}`

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            image: image,
            status: 'Completed',
            desc: description
        })
    })
}

export const parseChapters = (mangaId: string): Chapter[] => {
    return [App.createChapter({
        id: mangaId,
        name: 'Gallery',
        langCode: 'ENG',
        chapNum: 1,
        volume: 0
    })]
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string): ChapterDetails => {
    const pages: string[] = []


    for (const img of $('amp-story-grid-layer > amp-img').toArray()) {
        const image = $(img).attr('src') ?? ''
        if (!image) continue
        pages.push(image)
    }

    const chapterDetails = App.createChapterDetails({
        id: mangaId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const sections = [
        {
            sectionID: App.createHomeSection({
                id: 'top_rated',
                title: 'Most Popular Galleries',
                containsMoreItems: true,
                type: HomeSectionType.singleRowLarge
            }),
            selector: $('ul#image-list').get(2)
        },
        {
            sectionID: App.createHomeSection({
                id: 'new',
                title: 'New Galleries',
                containsMoreItems: true,
                type: HomeSectionType.singleRowLarge
            }),
            selector: $('ul#image-list').get(1)

        }
    ]

    const collectedIds: string[] = []

    for (const section of sections) {

        const itemArray: PartialSourceManga[] = []
        for (const item of $('div.image-list-item', section.selector).toArray()) {
            const id = $('a', item).attr('href')?.replace('/image', '').replace('/', '')
            const image: string = $('img', item).first().attr('src') ?? ''
            const title: string = $('p.image-list-item-title > a', item).text().trim()
            const subtitle: string = $('p.image-list-item-regist-date > span', item).text().trim()

            if (!id || !title || collectedIds.includes(id)) continue
            itemArray.push(App.createPartialSourceManga({
                image: image,
                title: title,
                mangaId: id,
                subtitle: subtitle
            }))
            collectedIds.push(id)

        }
        section.sectionID.items = itemArray
        sectionCallback(section.sectionID)
    }
}

export const parseViewMore = ($: CheerioStatic): PartialSourceManga[] => {
    const manga: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const item of $('div.image-list-item', 'ul#image-list').toArray()) {
        const id = $('a', item).attr('href')?.replace('/image', '').replace('/', '')
        const image: string = $('img', item).first().attr('src') ?? ''
        const title: string = $('p.image-list-item-title > a', item).text().trim()
        const subtitle: string = $('p.image-list-item-regist-date > span', item).text().trim()

        if (!id || !title || collectedIds.includes(id)) continue
        manga.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
        collectedIds.push(id)

    }
    return manga
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = false

    const lastPage = $('div.wp-pagenavi > a.last').attr('href')
    if (!lastPage) isLast = true

    return isLast
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}