import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    PartialSourceManga,
    SourceManga,
    Tag,
    TagSection
} from '@paperback/types'

import {
    BTGenres,
    BTLanguages
} from './BatoToHelper'

const CryptoJS = require('./external/crypto-js.min.js') // 4.1.1

import entities = require('entities')

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const titles: string[] = []

    titles.push(decodeHTMLEntity($('a', $('.item-title')).text().trim() ?? ''))
    const altTitles = $('.alias-set').text().trim().split('/')
    for (const title of altTitles) {
        titles.push(decodeHTMLEntity(title))
    }

    const description = decodeHTMLEntity($('.limit-html').text().trim() ?? '')

    const authorElement = $('div.attr-item b:contains("Authors")').next('span')
    const author = authorElement.length ? authorElement.children().map((_: number, e: CheerioElement) => {
        return $(e).text().trim()
    }).toArray().join(', ') : ''

    const artistElement = $('div.attr-item b:contains("Artists")').next('span')
    const artist = artistElement.length ? artistElement.children().map((_: number, e: CheerioElement) => {
        return $(e).text().trim()
    }).toArray().join(', ') : ''

    const arrayTags: Tag[] = []
    for (const tag of $('div.attr-item b:contains("Genres")').next('span').children().toArray()) {
        const label = $(tag).text().trim()
        const id = encodeURI(BTGenres.getParam(label) ?? label)

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]

    const rawStatus = $('div.attr-item b:contains("Upload status")').next('span').text().trim()
    let status = 'ONGOING'
    switch (rawStatus.toUpperCase()) {
        case 'ONGOING':
            status = 'Ongoing'
            break
        case 'COMPLETED':
            status = 'Completed'
            break
        case 'HIATUS':
            status = 'Hiatus'
            break
        default:
            status = 'Ongoing'
            break
    }

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: `mangaId=${mangaId}`,
            status: status,
            author: author,
            artist: artist,
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapterList = ($: CheerioStatic): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const chapter of $('div.episode-list div.main .item').toArray()) {
        const title = $('b', chapter).text().trim()
        const chapterId: string = $('a', chapter).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''
        if (!chapterId) continue

        let language = BTLanguages.getLangCode($('em').attr('data-lang') ?? '')
        if (language === 'Unknown') language = '🇬🇧'

        const timeAgo = $('i.ps-3', chapter).text().trim().split(' ')
        const chapNumRegex = title.match(/(\d+)(?:[-.]\d+)?/)
        let date = new Date(Date.now())

        if (timeAgo[1] == 'secs') date = new Date(Date.now() - 1000 * Number(timeAgo[0]))
        if (timeAgo[1] == 'mins') date = new Date(Date.now() - 1000 * 60 * Number(timeAgo[0]))
        if (timeAgo[1] == 'hours') date = new Date(Date.now() - 1000 * 3600 * Number(timeAgo[0]))
        if (timeAgo[1] == 'days') date = new Date(Date.now() - 1000 * 3600 * 24 * Number(timeAgo[0]))

        let chapNum = (chapNumRegex && chapNumRegex[1]) ? Number(chapNumRegex[1].replace('-', '.')) : 0
        if (isNaN(chapNum)) chapNum = 0

        chapters.push({
            id: chapterId,
            name: title,
            langCode: language,
            chapNum: chapNum,
            time: date,
            sortingIndex,
            volume: 0,
            group: ''
        })
        sortingIndex--
    }

    return chapters.map(chapter => {
        chapter.sortingIndex += chapters.length
        return App.createChapter(chapter)
    })
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    // Get all of the pages
    const scriptObj = $('script').toArray().find((obj: CheerioElement) => {
        const data = obj.children[0]?.data ?? ''
        return data.includes('batoPass') && data.includes('batoWord')
    })
    const script = scriptObj?.children[0]?.data ?? ''

    const batoPass = eval(script.match(/const\s+batoPass\s*=\s*(.*?);/)?.[1] ?? '').toString()
    const batoWord = (script.match(/const\s+batoWord\s*=\s*"(.*)";/)?.[1] ?? '')
    const imgList = JSON.parse(script.match(/const\s+imgHttpLis\s*=\s*(.*?);/)?.[1] ?? '')
    const tknList = JSON.parse(CryptoJS.AES.decrypt(batoWord, batoPass).toString(CryptoJS.enc.Utf8))

    for (let i = 0; i < Math.min(imgList.length, tknList.length); i++) {
        pages.push(`${imgList[i]}?${tknList[i]}`)
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void => {
    const popularSection = App.createHomeSection({
        id: 'popular_updates',
        title: 'Popular Updates',
        containsMoreItems: true,
        type: HomeSectionType.singleRowLarge
    })

    const latestSection = App.createHomeSection({
        id: 'latest_releases',
        title: 'Latest Releases',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    // Popular Updates
    const popularSection_Array: PartialSourceManga[] = []
    for (const manga of $('.home-popular .col.item').toArray()) {
        const image: string = $('img', manga).first().attr('src') ?? ''
        const title: string = $('.item-title', manga).text().trim() ?? ''
        const id = $('a', manga).attr('href')?.replace('/series/', '')?.trim().split('/')[0] ?? ''
        const btcode = $('em', manga).attr('data-lang')
        const lang: string = btcode ? BTLanguages.getLangCode(btcode) : '🇬🇧'
        const subtitle: string = lang + ' ' + $('.item-volch', manga).text().trim() ?? lang

        if (!id || !title) continue
        popularSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
    }
    popularSection.items = popularSection_Array
    sectionCallback(popularSection)

    // Latest Releases
    const latestSection_Array: PartialSourceManga[] = []
    for (const manga of $('.series-list .col.item').toArray()) {
        const image: string = $('img', manga).attr('src') ?? ''
        const title: string = $('.item-title', manga).text().trim() ?? ''
        const id = $('a', manga).attr('href')?.replace('/series/', '')?.trim().split('/')[0] ?? ''
        const btcode = $('em', manga).attr('data-lang')
        const lang: string = btcode ? BTLanguages.getLangCode(btcode) : '🇬🇧'
        const subtitle: string = lang + ' ' + $('.item-volch i', manga).text().trim() + lang ?? lang

        if (!id || !title) continue
        latestSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle)
        }))
    }
    latestSection.items = latestSection_Array
    sectionCallback(latestSection)
}

export const parseViewMore = ($: CheerioStatic): PartialSourceManga[] => {
    const manga: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const obj of $('.item', '#series-list').toArray()) {
        const id = $('a', obj).attr('href')?.replace('/series/', '').trim().split('/')[0] ?? ''
        const title = $('.item-title', obj).text()
        const btcode = $('em', obj).attr('data-lang')
        const lang: string = btcode ? BTLanguages.getLangCode(btcode) : '🇬🇧'
        const subtitle = lang + ' ' + $('.visited', obj).text().trim()
        const image = $('img', obj).attr('src') ?? ''

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

export const parseTags = (): TagSection[] => {
    const arrayTags: Tag[] = []
    for (const label of BTGenres.getGenresList()) {
        const id = encodeURI(BTGenres.getParam(label) ?? label)

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections
}

export const parseSearch = ($: CheerioStatic): PartialSourceManga[] => {
    const mangas: PartialSourceManga[] = []
    for (const obj of $('.item', '#series-list').toArray()) {
        const id = $('.item-cover', obj).attr('href')?.replace('/series/', '')?.trim().split('/')[0] ?? ''
        const title: string = $('.item-title', obj).text() ?? ''
        const btcode = $('em', obj).attr('data-lang')
        const lang: string = btcode ? BTLanguages.getLangCode(btcode) : '🇬🇧'
        const subtitle = lang + ' ' + $('.visited', obj).text().trim()
        const image = $('img', obj).attr('src') ?? ''

        if (!id || !title) continue

        mangas.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    return mangas
}

export const parseThumbnailUrl = ($: CheerioStatic): string => {
    return $('div.attr-cover img').attr('src') ?? ''
}

export const isLastPage = ($: CheerioStatic): boolean => {
    return $('.page-item').last().hasClass('disabled')
}

const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}
