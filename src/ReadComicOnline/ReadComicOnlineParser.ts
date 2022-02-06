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

const RCO_DOMAIN = 'https://readcomiconline.li'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
    const contentSection = $('div.barContent').first()

    const titles: string[] = []
    titles.push(decodeHTMLEntity($('a.bigChar').text().trim()))

    let image: string = $('img', $('.rightBox')).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
    image = image.startsWith('/') ? RCO_DOMAIN + image : image

    const author: string = $('a', $('span:contains(Writer)', contentSection).parent()).text().trim() ?? ''
    const artist: string = $('a', $('span:contains(Artist)', contentSection).parent()).text().trim() ?? ''
    const description: string = decodeHTMLEntity($('span:contains(Summary)', contentSection).parent().next().text().trim() ?? '')

    let hentai = false
    const arrayTags: Tag[] = []
    for (const tag of $('a', $('span:contains(Genres)', contentSection).parent()).toArray()) {
        const label: string = $(tag).text().trim()
        const id: string = $(tag).attr('href')?.replace(/\/genre\//i, '') ?? ''

        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus: string = $('span:contains(Status)', contentSection).parent().text().trim().toLowerCase()
    let status = MangaStatus.ONGOING
    if (rawStatus.includes('COMPLETED')) status = MangaStatus.COMPLETED

    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        hentai: hentai,
        status: status,
        author: author,
        artist: artist,
        tags: tagSections,
        desc: description,
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('tr', $('.listing').first()).toArray()) {
        const title: string = $('a', chapter).first().text().trim() ?? ''
        const chapterId: string = $('a', chapter).attr('href')?.split('/').pop()?.split('?').shift() ?? ''

        if (!chapterId) continue

        const chapNumRegex = chapterId.match(/(\d+\.?\d?)+/)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        const date: Date = new Date($('td', chapter).last().text().trim())

        if (!chapterId || !title) continue

        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: decodeHTMLEntity(title),
            langCode: LanguageCode.ENGLISH,
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: date,
        }))
    }
    return chapters
}

export const parseChapterDetails = (data: any, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    const imageMatches = data.matchAll(/lstImages\.push\("(http.*)"\)/g)
    for (const match of imageMatches) {
        pages.push(match[1])
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

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const latestSection = createHomeSection({ id: 'latest_comic', title: 'Latest Updated Comics', view_more: true })
    const newSection = createHomeSection({ id: 'new_comic', title: 'New Comics', view_more: true })
    const popularSection = createHomeSection({ id: 'popular_comic', title: 'Most Popular Comics', view_more: true })
    const TopDaySection = createHomeSection({ id: 'top_day_comic', title: 'Top Day Comics', view_more: false })
    const TopWeekSection = createHomeSection({ id: 'top_week_comic', title: 'Top Week Comics', view_more: false })
    const TopMonthSection = createHomeSection({ id: 'top_month_comic', title: 'Top Month Comics', view_more: false })

    //Latest Updated Comic
    const latestSection_Array: MangaTile[] = []
    for (const comic of $('a', $('div.items', 'div.bigBarContainer')).toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? ''
        if (image == '') image = $('img', comic).first().attr('srctemp') ?? ''
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $(comic).contents().not('span').text().trim() ?? ''
        const id: string = $(comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $(comic).attr('title') ?? ''

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

    //New Comic
    const newSection_Array: MangaTile[] = []
    for (const comic of $('div', 'div#tab-newest').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue
        newSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    newSection.items = newSection_Array
    sectionCallback(newSection)

    //Most Popular
    const popularSection_Array: MangaTile[] = []
    for (const comic of $('div', 'div#tab-mostview').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue
        popularSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    popularSection.items = popularSection_Array
    sectionCallback(popularSection)

    //Top Day
    const TopDaySection_Array: MangaTile[] = []
    for (const comic of $('div', 'div#tab-top-day').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue
        TopDaySection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    TopDaySection.items = TopDaySection_Array
    sectionCallback(TopDaySection)

    //Top Week
    const TopWeekSection_Array: MangaTile[] = []
    for (const comic of $('div', 'div#tab-top-week').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue
        TopWeekSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    TopWeekSection.items = TopWeekSection_Array
    sectionCallback(TopWeekSection)

    //Top Month
    const TopMonthSection_Array: MangaTile[] = []
    for (const comic of $('div', 'div#tab-top-month').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue
        TopMonthSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }

    TopMonthSection.items = TopMonthSection_Array
    sectionCallback(TopMonthSection)

}

export const parseViewMore = ($: CheerioStatic, cheerio: any): MangaTile[] => {
    const comics: MangaTile[] = []
    const collectedIds: string[] = []

    for (const item of $('tr', $('.listing').first()).toArray()) {
        const title: string = $('a', item).first().text().trim() ?? ''
        const id: string = $('a', item).attr('href')?.split('/').pop()?.split('?').shift() ?? ''


        const imageCheerio = cheerio.load($('td', $(item)).first().attr('title') ?? '')

        let image: string = imageCheerio('img').attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const subtitle: string = $('td', item).last().text().trim()
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

export const parseTags = ($: CheerioStatic): TagSection[] => {
    const arrayTags: Tag[] = []

    const rightBox = $('div.barContent').get(1)
    for (const tag of $('a', rightBox).toArray()) {

        const label = $(tag).text().trim()
        const id = $(tag).attr('href')?.replace(/\/genre\//i, '') ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export const parseSearch = ($: CheerioStatic, cheerio: any): MangaTile[] => {
    const comics: MangaTile[] = []
    const collectedIds: string[] = []

    //Thanks Aurora!
    const directMatch = $('.barTitle', $('.rightBox')).first().text().trim()

    //Parse direct comic result page
    if (directMatch.toLocaleLowerCase() == 'cover') {
        const title: string = $('a.bigChar').text().trim()
        const id: string = ($('a'), $('.bigChar').attr('href')?.replace(/comic\//i, '')) ?? ''

        let image: string = $('img', $('.rightBox')).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        if (!id || !title) throw new Error(`Unable to parse title: ${title} or id: ${id}!`)

        comics.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) })
        }))

    } else {

        //Parse search results page
        for (const item of $('tr', $('.listing').first()).toArray()) {
            const title: string = $('a', item).first().text().trim() ?? ''
            const id: string = $('a', item).attr('href')?.split('/').pop()?.split('?').shift() ?? ''

            const imageCheerio = cheerio.load($('td', $(item)).first().attr('title') ?? '')

            let image: string = imageCheerio('img').attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
            image = image.startsWith('/') ? RCO_DOMAIN + image : image

            const subtitle: string = $('td', item).last().text().trim()
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
    }

    return comics
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

export const isLastPage = ($: CheerioStatic): boolean => {
    const lastPage = $('.pager').text().includes('Next')
    return !lastPage
}
