import {
    Chapter,
    ChapterDetails,
    SourceManga,
    PartialSourceManga,
    TagSection,
    Tag,
    HomeSection
} from '@paperback/types'

import { decode as decodeHTMLEntity } from 'html-entities'
import { CheerioAPI } from 'cheerio'

import {
    daysAgo,
    fetchCreatorData,
    parseURL
} from './CoomerUtils'

import { Post } from './interface/Post'

export const parseMangaDetails = async (source: any, data: Post[], mangaId: string): Promise<SourceManga> => {

    const post = data[0] as Post
    const creatorData = await fetchCreatorData(source, post.user, post.service)

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [creatorData.name],
            image: creatorData.image,
            status: 'Completed',
            author: post.service,
            artist: creatorData.name,
            //tags: tagSections,
            desc: 'Note: All posts with ONLY videos have been filtered from the chapter list!'
        })
    })
}

export const parseChapters = async (source: any, data: Post[], mangaId: string): Promise<Chapter[]> => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const post of data) {
        const title = `Posted ${daysAgo(post.published)} days ago`
        const chapterId = post.id
        const date: Date = post.published

        const filteredAttachments = post.attachments.filter(x => !x.name.includes('.mp4'))
        if (filteredAttachments.length === 0) {
            continue
        }

        if (!chapterId) continue

        chapters.push({
            id: chapterId,
            name: decodeHTMLEntity(post.title ?? title),
            langCode: '🇬🇧',
            chapNum: 0,
            time: date,
            sortingIndex,
            volume: 0,
            group: title
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

export const parseChapterDetails = (source: any, data: Post, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const attachment of data.attachments) {
        if (!attachment.path) continue
        if (attachment.name.endsWith('.mp4')) continue

        pages.push(source.baseURL + attachment.path)
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseGallery = async (source: any, $: CheerioAPI, id?: string): Promise<PartialSourceManga[]> => {
    const itemArray: PartialSourceManga[] = []
    const collectedIds: string[] = []

    if (id?.includes('creator')) {
        for (const item of $('a.user-card', 'div.card-list__items').toArray()) {
            const id = $(item).attr('href') ?? ''
            let creator = parseURL(id).creator ?? ''

            if (!creator) {
                continue
            }

            let image: string = $('img.fancy-image__image', item).attr('src') ?? ''
            if (image.startsWith('//')) image = 'https:' + image

            // If the creator is a number
            if (!isNaN(Number(creator))) {
                const creatorData = await fetchCreatorData(source, creator, parseURL(id).service ?? '')

                creator = creatorData.name
                if (!image) {
                    image = creatorData.image
                }
            }

            itemArray.push(App.createPartialSourceManga({
                image: encodeURI(image),
                title: decodeHTMLEntity(creator),
                mangaId: id,
                subtitle: parseURL(id).service ?? ''
            }))

            collectedIds.push(id)
        }
    }


    for (const item of $('article', 'div.card-list__items').toArray()) {
        let creator = $(item).attr('data-user') ?? ''
        const service = $(item).attr('data-service') ?? ''

        let id = $('a', item).attr('href') ?? ''
        const idRegex = id?.match(/\/(.+)\/post/)
        if (idRegex && idRegex[1]) {
            id = idRegex[1]
        }

        if (!id) continue

        if (collectedIds.includes(id)) {
            continue // We only show unique creators by this
        }

        let image: string = $('img.post-card__image', item).attr('src') ?? ''
        if (image.startsWith('//')) image = 'https:' + image

        // If the creator is a number
        if (!isNaN(Number(creator))) {
            const numId = id.split('user/').pop() ?? ''
            if (!numId) continue

            const creatorData = await fetchCreatorData(source, numId, service)

            creator = creatorData.name
            if (!image) {
                image = creatorData.image
            }
        }

        itemArray.push(App.createPartialSourceManga({
            image: encodeURI(image),
            title: decodeHTMLEntity(creator),
            mangaId: id,
            subtitle: service
        }))

        collectedIds.push(id)
    }

    return itemArray
}

export const parseTags = ($: CheerioAPI): TagSection[] => {
    const arrayTags: Tag[] = []

    for (const tag of $('article', 'section#tag-container').toArray()) {
        const label = $('span', tag).first().text().trim() ?? ''
        const id = label

        if (!id) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections.slice(0, 50) // First 50
}

export const isLastPage = ($: CheerioAPI): boolean => {
    let isLast = true

    const hasNext = Boolean($('a.next'))
    if (hasNext) isLast = false

    return isLast
}