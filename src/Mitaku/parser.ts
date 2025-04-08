import { Chapter, ChapterDetails, ContentRating, DiscoverSection, DiscoverSectionItem, DiscoverSectionType, PagedResults, SearchResultItem, SourceManga, Tag, TagSection } from '@paperback/types'

import {
    CheerioAPI,
    Cheerio
} from 'cheerio'
import { Element } from 'domhandler'  // Import Element from domhandler

import { MitakuExtension } from './main'

export class Parser {
    async parseMangaDetails($: CheerioAPI, mangaId: string, source: MitakuExtension): Promise<SourceManga> {
        const images = this.parseImages($)

        const title = Application.decodeHTMLEntities($('.entry-title').first().text().trim())
        const artist = Application.decodeHTMLEntities($('p:contains(Cosplayer:)').text().trim().replace('Cosplayer:', '').trim())
        const synopsis = `Cosplayer: ${artist}\n\nGallery: ${title}\n\nImages: ${images.length}`

        const shareUrl = `${source.domain}/?p=${mangaId}`

        let contentRating = source.defaultContentRating

        const genres: Tag[] = []
        for (const obj of $('div.genres-content a').toArray()) {
            const id = this.idCleaner($(obj).attr('href') ?? '')
            const title = $(obj).text().trim()

            if (!title || !id) continue

            genres.push({ title: title, id: id })
        }
        const tagGroups: TagSection[] = [{ title: 'genres', id: 'genres', tags: genres }]

        return {
            mangaId,
            mangaInfo: {
                shareUrl: shareUrl,
                primaryTitle: title,
                secondaryTitles: [title],
                thumbnailUrl: images[0] ?? '',
                author: artist,
                artist: artist,
                tagGroups: tagGroups,
                synopsis: synopsis,
                contentRating: contentRating,
            }
        }
    }

    parseChapterList(sourceManga: SourceManga, source: MitakuExtension): Chapter[] {
        return [{
            sourceManga: sourceManga,
            chapterId: sourceManga.mangaId,
            langCode: source.language,
            chapNum: 1,
            title: 'Gallery'
        }]
    }

    async parseChapterDetails($: CheerioAPI, chapter: Chapter, source: MitakuExtension): Promise<ChapterDetails> {
        const pages = this.parseImages($)

        return {
            id: chapter.chapterId,
            mangaId: chapter.sourceManga.mangaId,
            pages: pages
        }
    }

    async parseDiscoverSections($: CheerioAPI, section: DiscoverSection, source: MitakuExtension): Promise<DiscoverSectionItem[]> {
        const items: DiscoverSectionItem[] = []

        for (const item of $('article').toArray()) {
            const postId = $(item).attr('id')
            const id = postId?.split('post-').pop()

            const image: string = await this.getImageSrc($('img', item).first(), source) ?? ''
            const title: string = $('a', item).first().attr('title')?.trim() ?? ''

            const subtitle = $('a[rel="tag"]', item).map((i, el) => $(el).text().trim()).get().join(', ')

            if (!id || isNaN(Number(id)) || !title || !subtitle) continue

            items.push({
                mangaId: id,
                imageUrl: image,
                title: Application.decodeHTMLEntities(title),
                subtitle: Application.decodeHTMLEntities(subtitle),
                type: 'simpleCarouselItem'
            })
        }

        return items
    }

    async parseSearchTags($: CheerioAPI): Promise<TagSection[]> {
        const genres: Tag[] = []

        for (const obj of $('.checkbox-group div label').toArray()) {
            const title = $(obj).text().trim()
            const id = $(obj).attr('for') ?? ''

            if (!id || !title) {
                continue
            }

            genres.push({ title: title, id: id })
        }

        const TagSections: TagSection[] = [
            { title: 'Genres', id: 'genres', tags: genres }
        ]

        return TagSections
    }

    async parseSearchResults($: CheerioAPI, source: MitakuExtension): Promise<SearchResultItem[]> {
        const results: SearchResultItem[] = []

        for (const item of $('article').toArray()) {
            const postId = $(item).attr('id')
            const id = postId?.split('post-').pop()

            const image: string = await this.getImageSrc($('img', item).first(), source) ?? ''
            const title: string = $('a', item).first().attr('title')?.trim() ?? ''

            const subtitle = $('a[rel="tag"]', item).map((i, el) => $(el).text().trim()).get().join(', ')

            if (!id || isNaN(Number(id)) || !title || !subtitle) continue

            results.push({
                mangaId: id,
                imageUrl: image,
                title: Application.decodeHTMLEntities(title),
                subtitle: Application.decodeHTMLEntities(subtitle),
            })
        }

        return results
    }

    // Utils
    async getImageSrc(imageObj: Cheerio<Element> | undefined, source: MitakuExtension): Promise<string> {
        let image: string | undefined
        if ((typeof imageObj?.attr('data-src')) != 'undefined' && imageObj?.attr('data-src') != '') {
            image = imageObj?.attr('data-src')
        }
        else if ((typeof imageObj?.attr('data-lazy-src')) != 'undefined' && imageObj?.attr('data-lazy-src') != '') {
            image = imageObj?.attr('data-lazy-src')
        }
        else if ((typeof imageObj?.attr('srcset')) != 'undefined' && imageObj?.attr('srcset') != '') {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
        }
        else if ((typeof imageObj?.attr('src')) != 'undefined' && imageObj?.attr('src') != '') {
            image = imageObj?.attr('src')
        }
        else if ((typeof imageObj?.attr('data-cfsrc')) != 'undefined' && imageObj?.attr('data-cfsrc') != '') {
            image = imageObj?.attr('data-cfsrc')
        } else {
            image = ''
        }

        image = image?.replace(/-\d+x\d+/g, '')

        if (image?.startsWith('/')) {
            image = source.domain + image
        }

        image = image
            ?.trim()
            .replace(/(\s{2,})/gi, '')

        image = image?.replace(/http:\/\/\//g, 'http://') // only changes urls with http protocol
        image = image?.replace(/http:\/\//g, 'https://')
        // Malforumed url fix (Turns https:///example.com into https://example.com (or the http:// equivalent))
        image = image?.replace(/https:\/\/\//g, 'https://') // only changes urls with https protocol

        return decodeURI(Application.decodeHTMLEntities(image ?? ''))
    }

    parseDate = (date: string): Date => {
        date = date.toUpperCase();

        if (date.includes("LESS THAN AN HOUR") || date.includes("JUST NOW")) {
            return new Date();
        }

        if (date.includes("YESTERDAY")) {
            return new Date(Date.now() - 86400000);
        }

        const timeUnits: Record<string, number> = {
            YEAR: 31556952000,
            MONTH: 2592000000,
            WEEK: 604800000,
            DAY: 86400000,
            HOUR: 3600000,
            MINUTE: 60000,
            SECOND: 1000,
        };

        const match = date.match(
            /(\d+)\s*(YEAR|MONTH|WEEK|DAY|HOUR|MINUTE|SECOND)/,
        );
        if (match) {
            const [, numStr, unit] = match;
            const number = Number(numStr);
            return new Date(Date.now() - number * timeUnits[unit]);
        }

        return new Date(date);
    }

    parseImages = ($: CheerioAPI): string[] => {
        const pages: string[] = []

        for (const img of $('a', 'div.msacwl-slider-wrap').toArray()) {
            let image = $(img).attr('src')

            if (!image) image = $(img).attr('data-mfp-src')
            if (!image) image = $(img).attr('data-lazy')

            if (!image) continue
            pages.push(image)
        }

        return pages
    }

    idCleaner(str: string): string {
        let cleanId: string | null = str
        cleanId = cleanId.replace(/\/$/, '')
        cleanId = cleanId.split('/').pop() ?? null

        if (!cleanId) throw new Error(`Unable to parse id for ${str}`)
        return cleanId
    }

    isLastPage = ($: CheerioAPI): boolean => {
        let isLast = true
        const hasNext = Boolean($('a.last', 'div.wp-pagenavi').first())

        if (hasNext) isLast = false
        return isLast
    }

}