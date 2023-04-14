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

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const section = $('.detail-info')

    const title = $('span.detail-info-right-title-font', section).text().trim()
    const author = $('p.detail-info-right-say a', section).text().trim()
    const image = $('.detail-info-cover-img', $('.detail-info-cover')).attr('src') ?? ''
    const description = $('p.fullcontent').text().trim()

    const arrayTags: Tag[] = []
    for (const tag of $('a', '.detail-info-right-tag-list').toArray()) {
        const id = $(tag).attr('href')?.split('/directory/')[1]?.replace(/\//g, '')
        const label = $(tag).text().trim()

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    const rawStatus = $('.detail-info-right-title-tip', section).text().trim()
    let status = 'ONGOING'
    switch (rawStatus.toUpperCase()) {
        case 'ONGOING':
            status = 'Ongoing'
            break
        case 'COMPLETED':
            status = 'Completed'
            break
        default:
            status = 'Ongoing'
            break
    }

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            image: image,
            status: status,
            author: author,
            artist: author,
            tags: tagSections,
            desc: description,
        })
    })
}

export const parseChapters = ($: CheerioStatic): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('div#chapterlist ul li').children('a').toArray()) {
        const title = $('p.title3', chapter).html() ?? ''
        const date = parseDate($('p.title2', chapter).html() ?? '')

        const chapterIdRaw = $(chapter).attr('href')?.trim()
        const chapterIdRegex = chapterIdRaw?.match(/\/manga\/[a-zA-Z0-9_]*\/(.*)\//)

        let chapterId: string | null = null
        if (chapterIdRegex && chapterIdRegex[1]) chapterId = chapterIdRegex[1]

        if (!chapterId) continue

        const chapRegex = chapterId?.match(/c([0-9.]+)/)
        let chapNum = 0
        if (chapRegex && chapRegex[1]) chapNum = Number(chapRegex[1])

        const volRegex = chapterId?.match(/v([0-9.]+)/)
        let volNum = 0
        if (volRegex && volRegex[1]) volNum = Number(volRegex[1])

        chapters.push(App.createChapter({
            id: chapterId,
            name: title,
            langCode: '🇬🇧',
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            volume: isNaN(volNum) ? 0 : volNum,
            time: date
        }))
    }
    return chapters
}

export const parseChapterDetails = async ($: CheerioStatic, mangaId: string, chapterId: string, url: string, source: any): Promise<ChapterDetails> => {
    const pages: string[] = []

    const bar = $('script[src*=chapter_bar]').length

    if (bar) { // If webtoon
        const script: any = $('script:contains(function(p,a,c,k,e,d))').html()?.replace('eval', '')
        const deobfuscatedScript = eval(script).toString()
        const urls = deobfuscatedScript.substring(deobfuscatedScript.indexOf('newImgs=[\'') + 9, deobfuscatedScript.indexOf('\'];')).split('\',\'')

        for (const url of urls) {
            pages.push('https:' + url.replace('\'', ''))
        }
    } else {
        const script: any = $('script:contains(function(p,a,c,k,e,d))').html()?.replace('eval', '')
        const deobfuscatedScript = eval(script).toString()

        const secretKeyStart = deobfuscatedScript.indexOf('\'')
        const secretKeyEnd = deobfuscatedScript.indexOf(';')

        const secretKeyResultScript = deobfuscatedScript.substring(secretKeyStart, secretKeyEnd).trim()
        let secretKey = eval(secretKeyResultScript).toString()

        const chapterIdStartLoc = $.html().indexOf('chapterid')
        const numericChapterId = $.html().substring(chapterIdStartLoc + 11, $.html().indexOf(';', chapterIdStartLoc)).trim()

        const pagesLinksElements = $('a', $('.pager-list-left > span').first())
        const pagesNumber = Number($(pagesLinksElements[pagesLinksElements.length - 2])?.attr('data-page'))

        const pageBase = url.substring(0, url.lastIndexOf('/'))

        for (let i = 1; i <= pagesNumber; i++) {
            let responseString = ''

            for (let tr = 1; tr <= 3; tr++) {
                const request = App.createRequest({
                    url: `${pageBase}/chapterfun.ashx?cid=${numericChapterId}&page=${i}&key=${secretKey}`,
                    method: 'GET',
                    headers: {
                        'Referer': url,
                        'Accept': '*/*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Connection': 'keep-alive',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })

                const response = await source.requestManager.schedule(request, 1)
                responseString = response.data
                if (!responseString) {
                    continue
                } else {
                    secretKey = ''
                }

            }
            const deobfuscatedScript = eval(responseString.replace('eval', '')).toString()
            const baseLinkStartPos = deobfuscatedScript.indexOf('pix=') + 5
            const baseLink = deobfuscatedScript.substring(deobfuscatedScript.indexOf('pix=') + 5, deobfuscatedScript.indexOf(';', baseLinkStartPos) - 1)

            const imageLinkStartPos = deobfuscatedScript.indexOf('pvalue=') + 9
            const imageLinkEndPos = deobfuscatedScript.indexOf('"', imageLinkStartPos)
            const imageLink = deobfuscatedScript.substring(imageLinkStartPos, imageLinkEndPos)
            pages.push(`https:${baseLink}${imageLink}`)
        }
    }
    // Big Thanks to Tachi!

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const sections = [
        {
            sectionID: App.createHomeSection({
                id: 'hot_release',
                title: 'Hot Manga Releases',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.manga-list-1').get(0)
        },
        {
            sectionID: App.createHomeSection({
                id: 'being_read',
                title: 'Being Read Right Now',
                containsMoreItems: false,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.manga-list-1').get(1)
        },
        {
            sectionID: App.createHomeSection({
                id: 'recommended',
                title: 'Recommended',
                containsMoreItems: false,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.manga-list-3')
        },
        {
            sectionID: App.createHomeSection({
                id: 'new_manga',
                title: 'New Manga Releases',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            selector: $('div.manga-list-1').get(2)
        }
    ]

    const collectedIds: string[] = []

    // Hot Release Manga
    // New Manga
    // Being Read Manga
    for (const section of sections) {

        const mangaArray: PartialSourceManga[] = []
        for (const manga of $('li', section.selector).toArray()) {
            const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
            const image: string = $('img', manga).first().attr('src') ?? ''
            const title: string = $('img', manga).first().attr('alt')?.trim() ?? ''
            const subtitle: string = $('.manga-list-1-item-subtitle', manga).text().trim()

            if (!id || !title || collectedIds.includes(id)) continue
            mangaArray.push(App.createPartialSourceManga({
                image: image,
                title: title,
                mangaId: id,
                subtitle: subtitle
            }))
            collectedIds.push(id)
        }
        section.sectionID.items = mangaArray
        sectionCallback(section.sectionID)
    }

    // Latest Manga
    const latestSection = App.createHomeSection({
        id: 'latest_updates',
        title: 'Latest Updates',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    const latestManga: PartialSourceManga[] = []
    for (const manga of $('li', 'div.manga-list-4 ').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('a', manga).attr('title')?.trim() ?? ''
        const subtitle: string = $('ul.manga-list-4-item-part > li', manga).first().text().trim()

        if (!id || !title || collectedIds.includes(id)) continue
        latestManga.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
            subtitle: subtitle
        }))
        collectedIds.push(id)
    }
    latestSection.items = latestManga
    sectionCallback(latestSection)
}

export const parseSearch = ($: CheerioStatic): PartialSourceManga[] => {
    const mangaItems: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const manga of $('ul.manga-list-4-list > li').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('a', manga).attr('title')?.trim() ?? ''
        const subtitle: string = $('a', $('p.manga-list-4-item-tip', manga).get(1)).text()

        if (!id || !title || collectedIds.includes(id)) continue
        mangaItems.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
            subtitle: subtitle
        }))
        collectedIds.push(id)
    }
    return mangaItems
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): PartialSourceManga[] => {
    const mangaItems: PartialSourceManga[] = []
    const collectedIds: string[] = []

    if (homepageSectionId === 'latest_updates') {
        for (const manga of $('ul.manga-list-4-list > li').toArray()) {
            const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
            const image: string = $('img', manga).first().attr('src') ?? ''
            const title: string = $('a', manga).attr('title')?.trim() ?? ''
            const subtitle: string = $('ul.manga-list-4-item-part > li', manga).first().text().trim()

            if (!id || !title || collectedIds.includes(id)) continue
            mangaItems.push(App.createPartialSourceManga({
                image: image,
                title: title,
                mangaId: id,
                subtitle: subtitle
            }))
            collectedIds.push(id)
        }
        return mangaItems
    }

    for (const manga of $('li', $.html()).toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '')
        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('img', manga).first().attr('alt')?.trim() ?? ''
        const subtitle: string = $('p.manga-list-1-item-subtitle', manga).text().trim()

        if (!id || !title || collectedIds.includes(id)) continue
        mangaItems.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
            subtitle: subtitle
        }))
        collectedIds.push(id)
    }
    return mangaItems
}

export const parseTags = ($: CheerioStatic): TagSection[] => {
    const arrayTags: Tag[] = []

    for (const tag of $('div.tag-box > a').toArray()) {
        const label = $(tag).text().trim()
        const id = $(tag).attr('data-val') ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections
}

const parseDate = (date: string): Date => {
    date = date.toUpperCase()
    let time: Date
    const number = Number((/\d*/.exec(date) ?? [])[0])
    if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
        time = new Date(Date.now())
    } else if (date.includes('YEAR') || date.includes('YEARS')) {
        time = new Date(Date.now() - (number * 31556952000))
    } else if (date.includes('MONTH') || date.includes('MONTHS')) {
        time = new Date(Date.now() - (number * 2592000000))
    } else if (date.includes('WEEK') || date.includes('WEEKS')) {
        time = new Date(Date.now() - (number * 604800000))
    } else if (date.includes('YESTERDAY')) {
        time = new Date(Date.now() - 86400000)
    } else if (date.includes('DAY') || date.includes('DAYS')) {
        time = new Date(Date.now() - (number * 86400000))
    } else if (date.includes('HOUR') || date.includes('HOURS')) {
        time = new Date(Date.now() - (number * 3600000))
    } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
        time = new Date(Date.now() - (number * 60000))
    } else if (date.includes('SECOND') || date.includes('SECONDS')) {
        time = new Date(Date.now() - (number * 1000))
    } else {
        time = new Date(date)
    }
    return time
}

export const isLastPage = ($: CheerioStatic): boolean => {
    let isLast = true
    const pages: number[] = []

    for (const page of $('a', '.pager-list-left').toArray()) {
        const p = Number($(page).text().trim())
        if (isNaN(p)) continue
        pages.push(p)
    }

    const lastPage = Math.max(...pages)
    const currentPage = Number($('a.active', '.pager-list-left').text().trim())
    if (currentPage <= lastPage) isLast = false
    return isLast
}
