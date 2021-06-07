import { Chapter, ChapterDetails, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, PagedResults } from "paperback-extensions-common";
import { PagedSearchResults } from "./WebtoonHelperStructures";
const WEBTOON_DOMAIN = 'https://www.webtoons.com'

export const parseMangaDetailsChallenge = async ($: CheerioStatic, mangaId: string): Promise<Manga> => {
const title = $('h3._challengeTitle').text().replace('DASHBOARD', '').trim()

const image = $('img', $('span.thmb')).attr('src')

if(!image) {
    throw new Error(`Failed to parse MangaDetails challenge image for ${mangaId}`)
}

let rating = $('em#_starScoreAverage').text()
const completed = $('span.txt_ico_completed2') === undefined ? MangaStatus.ONGOING : MangaStatus.COMPLETED
const author = $('span.author').text().replace(/author info/, '').trim()
const description = $('p.summary').text().trim()

if(isNaN(Number(rating))) {
    rating = '0'
}

return createManga({
    id: mangaId,
    titles: [title],
    image: image,
    rating: Number(rating),
    status: completed,
    author: author,
    desc: description
})
}

export const parseMangaDetailsOrig = async ($: CheerioStatic, mangaId: string): Promise<Manga> => {
    const title = $("h1.subj").text();

    // The image is awkwardly embedded into a style, parse that out
    const imageContext = $("div.detail_body").attr("style");
    const image = imageContext?.match(/url\((.+)\)/);

    if (!imageContext || !image || !image[1]) {
      throw new Error(`Failed to parse MangaDetails for ${mangaId}`);
    }

    let rating = $("em#_starScoreAverage").text();
    const completed = $("span.txt_ico_completed2") === undefined ? MangaStatus.ONGOING : MangaStatus.COMPLETED;
    const author = $("a.author")
      .text()
      .replace(/author info/, "")
      .trim();
    const description = $("p.summary").text().trim();

    // If we can't parse the rating for some reason, set it to zero
    if (isNaN(Number(rating))) {
      rating = "0";
    }

    return createManga({
      id: mangaId,
      titles: [title],
      image: image[1],
      rating: Number(rating), // BAD
      status: completed,
      author: author,
      desc: description,
    });
}

/**
 * We're supposed to return a Chapter[] here, but since we might need more pages to get all of the
 * chapters, return a paged structure here
 */
export const parseGetChaptersChallenge = ($: CheerioStatic, mangaId: string): PagedSearchResults => {
    const chapters: Chapter[] = []

    for(let context of $('li', $('ul#_listUl')).toArray()) {
        const id = $(context).attr('data-episode-no')
        const name = $('span', $('span.subj', $(context))).text().trim()
        const dateContext = $('span.date', $(context)).text().trim()

        if(!id || !name || !dateContext) {
            throw new Error(`Failed to get chapters for ${mangaId} - There's some kind of parsing problem. Please report this to the extension developers`)
        }

        const numericId = isNaN(Number(id)) ? 0 : Number(id)

        chapters.push(createChapter({
            mangaId: mangaId,
            chapNum: numericId,
            langCode: LanguageCode.ENGLISH, // Is it always english?
            id: id,
            name: name,
            time: new Date(dateContext)
        }))
    }

    // Do we have another page that we need to navigate to?
    if($('a', $('div.paginate')).last().attr('href') != '#') {
        // Yup, queue up a navigation to the next page value
        const valContext = $('span.on', $('div.paginate')).text()
        const nextPageVal = Number(valContext) + 1
        const paginationId = $('link').last().attr('href')?.match(/\/challenge\/(.+)\/list/)
        if(isNaN(nextPageVal) || !paginationId || !paginationId[1]) {
            console.log("Error retrieving the next page to scan for, results may be incomplete")
            return {
                chapters: chapters
            }
        }

        return {
            chapters: chapters,
            pagnationId: paginationId[1],
            hasNextPage: nextPageVal
        }
    }
    else {
        return {
            chapters: chapters
        }
    }
}

/**
 * We're supposed to return a Chapter[] here, but since we might need more pages to get all of the
 * chapters, return a paged structure here
 */
 export const parseGetChaptersOrig = ($: CheerioStatic, mangaId: string): PagedSearchResults => {
    const chapters: Chapter[] = []

    for(let context of $('li', $('ul#_listUl')).toArray()) {
        const id = $(context).attr('data-episode-no')
        const name = $('span', $('span.subj', $(context))).text().trim()
        const dateContext = $('span.date', $(context)).text().trim()

        if(!id || !name || !dateContext) {
            throw new Error(`Failed to get chapters for ${mangaId} - There's some kind of parsing problem. Please report this to the extension developers`)
        }

        const numericId = isNaN(Number(id)) ? 0 : Number(id)

        chapters.push(createChapter({
            mangaId: mangaId,
            chapNum: numericId,
            langCode: LanguageCode.ENGLISH, // Is it always english?
            id: id,
            name: name,
            time: new Date(dateContext)
        }))
    }

    // Do we have another page that we need to navigate to?
    if($('a', $('div.paginate')).last().attr('href') != '#') {
        // Yup, queue up a navigation to the next page value
        const valContext = $('span.on', $('div.paginate')).text()
        const nextPageVal = Number(valContext) + 1
        const paginationIds = $('link').last().attr('href')?.match(/\/en\/(.+)\/(.+)\/list/)
        if(isNaN(nextPageVal) || !paginationIds || !paginationIds[1] || !paginationIds[2]) {
            console.log("Error retrieving the next page to scan for, results may be incomplete")
            return {
                chapters: chapters
            }
        }

        return {
            chapters: chapters,
            titleId: paginationIds[1],
            pagnationId: paginationIds[2],
            hasNextPage: nextPageVal
        }
    }
    else {
        return {
            chapters: chapters
        }
    }
}

export const parseChapterDetailsChallenge = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    for(let pageContext of $('img', $('div.viewer_img')).toArray()) {
        const url = $(pageContext).attr('data-url')
        if(!url) {
            throw new Error(`Failed to parse image URL for ${mangaId}`)
        }

        pages.push(url)
    }

    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    })
}

export const parseChapterDetailsOrig = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    for(let pageContext of $('img', $('div.viewer_img')).toArray()) {
        const url = $(pageContext).attr('data-url')
        if(!url) {
            throw new Error(`Failed to parse image URL for ${mangaId}`)
        }

        pages.push(url)
    }

    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    })
}

export const parseSearchResults = async ($: CheerioStatic): Promise<PagedResults> => {
    const searchResults: MangaTile[] = [];
    // Webtoons splits results into two pieces: A Origionals category, and a canvas category. Both need supported
    // Get the 'Origional' pane details

    for (let tile of $("li", $("ul.card_lst")).toArray()) {
      let id = $("a.card_item", $(tile)).attr("href")?.match(/\?titleNo=(\d+)/);
      let image = $("img", $(tile)).attr("src");
      let title = createIconText({ text: $(".subj", $(tile)).text() });
      let primaryText = createIconText({ text: $("em.grade_num", $(tile)).text(), icon: "heart" }); //TODO: What is this image icon name?

      // If the ID, Image or Title is missing, do not add this as an entry
      if (!id || !id[1] || !image || !title.text) {
        console.log(`Failed to parse Orig search result tile`);
        continue;
      }

      searchResults.push(
        createMangaTile({
          id: id[1],
          image: image,
          title: title,
          primaryText: primaryText,
        })
      );
    }

    // Capture all of the canvas results
    for (let tile of $("li", $("div.challenge_lst")).toArray()) {
      let id = $("a.challenge_item", $(tile)).attr("href")?.match(/\?titleNo=(\d+)/);
      let image = $("img", $(tile)).attr("src");
      let title = createIconText({ text: $(".subj", $(tile)).text() });

      if (!id || !id[1] || !image || !title.text) {
        console.log(`Failed to parse canvas search result tile`);
        continue;
      }

      searchResults.push(
        createMangaTile({
          id: `c${id[1]}`,
          image: image,
          title: title,
        })
      );
    }

    //TODO: Support ViewMore
    return createPagedResults({
      results: searchResults,
    });
}

export const parseRollingViewMoreTitles = ($: CheerioStatic): PagedResults => {

    const tiles: MangaTile[] = []

    for(let context of $('li', $('div#dailyList')).toArray()) { // This is quite the broad selector, it's probably fine?
        // None of these rolling updates will ever be a challenge title, no need to encode the IDs
        const idContext = $('a', $(context)).attr('href')?.match(/list\?title_no=(\d.+)/)
        const title = $('p.subj', $(context)).text().trim()
        const image = $('img', $(context)).attr('src')
        const likes = $('em.grade_num', $(context)).text()

        if(!idContext || !idContext[1] || !image || !title) {
            console.log(`Failed to parse viewMoreContent for rollingUpdates`)
            continue
        }

        tiles.push(createMangaTile({
            id: idContext[1],
            title: createIconText({text: title}),
            image: image,
            primaryText: createIconText({text: likes, icon: 'heart'})
        }))
    }

    return createPagedResults({results: tiles})
}

export const parseCompletedViewMoreTitles = ($: CheerioStatic): PagedResults => {
    const tiles: MangaTile[] = []
    for(let context of $('li', $('ul.daily_card', $('div.daily_section', $('div.comp')))).toArray()) {

            // None of these rolling updates will ever be a challenge title, no need to encode the IDs
            const idContext = $('a', $(context)).attr('href')?.match(/list\?title_no=(\d.+)/)
            const title = $('p.subj', $(context)).text().trim()
            const image = $('img', $(context)).attr('src')
            const likes = $('em.grade_num', $(context)).text()

            if(!idContext || !idContext[1] || !image || !title) {
                console.log(`Failed to parse content for a viewMoreContent for completed titles`)
                continue
            }

            tiles.push(createMangaTile({
                id: idContext[1],
                title: createIconText({text: title}),
                image: image,
                primaryText: createIconText({text: likes, icon: 'heart'})
            }))
    }

    return createPagedResults({results: tiles})
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
    const rollingUpdates: MangaTile[] = []
    const completedSeries: MangaTile[] = []

    // We're only going to grab the first title for each day by default. View more will provide the full list
    for(let scheduleContext of $('div.daily_section', $('#dailyList')).toArray()) {
        const cardContext = $('li', $('ul.daily_card', $(scheduleContext)).first()).first()

        // None of these rolling updates will ever be a challenge title, no need to encode the IDs
        const idContext = $('a', $(cardContext)).attr('href')?.match(/list\?title_no=(\d.+)/)
        const title = $('p.subj', $(cardContext)).text().trim()
        const image = $('img', $(cardContext)).attr('src')
        const likes = $('em.grade_num', $(cardContext)).text()

        if(!idContext || !idContext[1] || !image || !title) {
            console.log(`Failed to parse content for a rollingUpdates title`)
            continue
        }

        rollingUpdates.push(createMangaTile({
            id: idContext[1],
            title: createIconText({text: title}),
            image: image,
            primaryText: createIconText({text: likes, icon: 'heart'})
        }))
    }
    sections[0].items = rollingUpdates
    sections[0].view_more = true
    sectionCallback(sections[0])

    // Only get the first 15 titles for the completed series list
    let counter = 0
    for(let context of $('li', $('ul.daily_card', $('div.daily_section', $('div.comp')))).toArray()) {
        if(counter == 10) {break}

            // None of these rolling updates will ever be a challenge title, no need to encode the IDs
            const idContext = $('a', $(context)).attr('href')?.match(/list\?title_no=(\d.+)/)
            const title = $('p.subj', $(context)).text().trim()
            const image = $('img', $(context)).attr('src')
            const likes = $('em.grade_num', $(context)).text()

            if(!idContext || !idContext[1] || !image || !title) {
                console.log(`Failed to parse content for a rollingUpdates title`)
                continue
            }

            completedSeries.push(createMangaTile({
                id: idContext[1],
                title: createIconText({text: title}),
                image: image,
                primaryText: createIconText({text: likes, icon: 'heart'})
            }))

        counter++
    }
    sections[1].items = completedSeries
    sections[1].view_more = true
    sectionCallback(sections[1])
}