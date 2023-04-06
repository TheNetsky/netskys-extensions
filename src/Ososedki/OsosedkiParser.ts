import {
    Chapter,
    ChapterDetails,
    Tag,
    SourceManga,
    PartialSourceManga,
    TagSection
} from '@paperback/types'

import entities = require('entities')

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const images = $('div.thumbs', 'div.container-fluid')

    const titleString = $('img', images.first()).attr('alt')?.trim() ?? ''
    const split = titleString.split(' - ')
    const title = split.slice(0, -1).join(' - ') || titleString

    const description = `Gallery: ${title}\n\nImages: ${images.length - 1}` // Remove last image since it's the telegram icon
    const image = $('img', images.first()).attr('src') ?? ''

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            status: 'Completed',
            image: image,
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

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    // Remove last image since it's the telegram icon
    for (const img of $('div.thumbs', 'div.container-fluid').toArray().slice(0, -1)) {
        let image = $('img', img).attr('src') ?? ''
        if (!image) image = $(img).attr('data-src') ?? ''
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

export const parseHomeSections = ($: CheerioStatic, OS_DOMAIN: string, sectionID: string): PartialSourceManga[] => {
    const collectedIds: string[] = []
    const itemArray: PartialSourceManga[] = []

    switch (sectionID) {
        case 'random':
            for (const item of $('div.thumbs-more', 'div.grid-more').toArray()) {

                const id = $('a', item).attr('href')?.split('/').pop()
                const image: string = OS_DOMAIN + $('img', item).first().attr('src') ?? ''
                const title: string = $('a,text-white.text-decoration-none', item).text().trim()
                const subtitle: string = $('i.bi.bi-images', item).parent().text().trim() + ' images'

                if (!id || !title || collectedIds.includes(id)) continue
                itemArray.push(App.createPartialSourceManga({
                    image: image,
                    title: decodeHTMLEntity(title),
                    mangaId: id,
                    subtitle: decodeHTMLEntity(subtitle)
                }))
                collectedIds.push(id)
            }
            break

        case 'cosplay':
            for (const item of $('div.thumbs', 'div.container-fluid').toArray()) {

                const id = $('a', item).attr('href')?.split('/').pop()
                const image: string = OS_DOMAIN + $('img', item).first().attr('src') ?? ''
                const title: string = $('a,text-white.text-decoration-none', item).text().trim()
                const subtitle: string = $('span.badge.bg-dark', item).first().text().trim()

                if (!id || !title || collectedIds.includes(id)) continue
                itemArray.push(App.createPartialSourceManga({
                    image: image,
                    title: decodeHTMLEntity(title),
                    mangaId: id,
                    subtitle: decodeHTMLEntity(subtitle)
                }))
                collectedIds.push(id)
            }
            break

        default:
            for (const item of $('div.thumbs', 'div.container-fluid').toArray()) {

                const id = $('a', item).attr('href')?.split('/').pop()
                const image: string = OS_DOMAIN + $('img', item).first().attr('src') ?? ''
                const title: string = $('a,text-white.text-decoration-none', item).text().trim()
                const subtitle: string = $('i.bi.bi-images', item).parent().text().trim() + ' images'

                if (!id || !title || collectedIds.includes(id)) continue
                itemArray.push(App.createPartialSourceManga({
                    image: image,
                    title: decodeHTMLEntity(title),
                    mangaId: id,
                    subtitle: decodeHTMLEntity(subtitle)
                }))
                collectedIds.push(id)
            }
            break
    }

    return itemArray
}

export const parseTags = ($: CheerioStatic): TagSection[] => {
    const arrayTags: Tag[] = []

    for (const tag of $('li', $('li.nav-item.dropdown').first()).toArray()) {
        const label = $(tag).text().trim() ?? ''
        const id = encodeURI($('a', tag).attr('href')?.split('/').pop()?.trim() ?? '')

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections
}


const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}