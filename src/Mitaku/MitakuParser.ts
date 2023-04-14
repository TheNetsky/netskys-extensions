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
    const images = $('img', 'div.msacwl-slider-wrap')

    const title = decodeHTMLEntity($('h1.entry-title').first().text().trim())
    const artist = decodeHTMLEntity($('p:contains(Cosplayer:)').text().trim().replace('Cosplayer:', '').trim())
    const description = `Cosplayer: ${artist}\n\nGallery: ${title}\n\nImages: ${images.length}`
    const image = images.first().attr('data-src') ?? ''


    const arrayTags: Tag[] = []
    for (const tag of $('a', 'span.tag-links').toArray()) {
        const id = $(tag).attr('href')?.split('/tag/')[1]?.replace(/\//g, '')
        const label = $(tag).text().trim()
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            artist: artist,
            author: artist,
            status: 'Completed',
            image: encodeURI(image),
            desc: description,
            tags: tagSections
        })
    })
}

export const parseChapters = (mangaId: string): Chapter[] => {
    return [App.createChapter({
        id: mangaId,
        name: 'Gallery',
        langCode: '🇬🇧',
        chapNum: 1
    })]
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    // Remove last image since it's the telegram icon
    for (const img of $('img', 'div.msacwl-slider-wrap').toArray()) {
        let image = $(img).attr('data-src') ?? ''
        if (!image) image = $(img).attr('data-mfp-src') ?? ''
        if (!image) continue
        pages.push(encodeURI(image))
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseHomeSections = ($: CheerioStatic): PartialSourceManga[] => {
    const collectedIds: string[] = []
    const itemArray: PartialSourceManga[] = []

    for (const item of $('article', 'div#content').toArray()) {
        const postId = $(item).attr('id')
        const id = postId?.split('post-').pop()
        const image: string = $('img', item).first().attr('data-src') ?? ''
        const title: string = $('h2.entry-title', item).text().trim()
        const subtitle: string = $('span.tag-links > a', item).toArray().map(x => $(x).text().trim()).join(', ')

        if (!id || isNaN(Number(id)) || !title || collectedIds.includes(id)) continue
        itemArray.push(App.createPartialSourceManga({
            image: encodeURI(image),
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
        collectedIds.push(id)
    }

    return itemArray
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = true
    const hasNext = Boolean($('a.last', 'div.wp-pagenavi').first())

    if (hasNext) isLast = false
    return isLast
}