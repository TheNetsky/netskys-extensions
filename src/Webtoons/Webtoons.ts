import {
  Chapter,
  ChapterDetails,
  Manga,
  PagedResults,
  SearchRequest,
  Source,
  SourceInfo,
  RequestHeaders,
  HomeSection,
  TagType,
} from "paperback-extensions-common";
import {
  parseChapterDetailsChallenge,
  parseChapterDetailsOrig,
  parseCompletedViewMoreTitles,
  parseGetChaptersChallenge,
  parseGetChaptersOrig,
  parseHomeSections,
  parseMangaDetailsChallenge,
  parseMangaDetailsOrig,
  parseRollingViewMoreTitles,
  parseSearchResults,
} from "./WebtoonsParser";

const WEBTOON_DOMAIN = "https://www.webtoons.com";

export const WebtoonsInfo: SourceInfo = {
  version: "1.0.0",
  name: "WebToons",
  icon: "logo.png",
  author: "VibrantClouds",
  authorWebsite: "https://github.com/conradweiser",
  description: "Webtoons",
  hentaiSource: false,
  websiteBaseURL: WEBTOON_DOMAIN,
  sourceTags: [
    {
      text: "Slow",
      type: TagType.YELLOW
    }
  ]
};

/**
 * Note that MangaIDs here are encoded as to avoid holding special characters.
 * A Origional title will merely be a string of numbers. However a challenge title (a canvas in search results)
 * will be encoded as c<value> - Such as c12345
 * Make sure that this challenge value is parsed before using any IDs, as the URL formatting differs depending on the manga class
 */
export class Webtoons extends Source {
  /**
   * This sources requires itself as a referer for images to resolve correctly
   */
  globalRequestHeaders(): RequestHeaders {
    return {
      referer: WEBTOON_DOMAIN,
    };
  }

  requestManager = createRequestManager({
    requestsPerSecond: 5
  })

  async getMangaDetails(mangaId: string): Promise<Manga> {
    if (mangaId.startsWith("c")) {
      // This is a challenge title
      const request = createRequestObject({
        url: `${WEBTOON_DOMAIN}/challenge/episodeList?titleNo=${mangaId.substr(1, mangaId.length)}`,
        method: "GET",
        headers: {
          referer: WEBTOON_DOMAIN,
        },
      });

      const data = await this.requestManager.schedule(request, 1); //TODO: What if this isn't a 200 code
      const $ = this.cheerio.load(data.data);
      return await parseMangaDetailsChallenge($, mangaId);
    } else {
      // This is an origional title
      const request = createRequestObject({
        url: `${WEBTOON_DOMAIN}/episodeList?titleNo=${mangaId}`,
        method: "GET",
      });

      const data = await this.requestManager.schedule(request, 1);

      if(data.status != 200) {
        throw new Error(`Returned a nonstandard HTTP code: ${data.status}`)
      }
      
      const $ = this.cheerio.load(data.data);
      return await parseMangaDetailsOrig($, mangaId);
    }
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    if (mangaId.startsWith("c")) {
      const request = createRequestObject({
        url: `${WEBTOON_DOMAIN}/en/challenge/reeeee/list?title_no=${mangaId.substr(1, mangaId.length)}`,
        method: "GET",
        headers: {
          referer: WEBTOON_DOMAIN,
        },
      });

      let data = await this.requestManager.schedule(request, 1);

      if(data.status != 200 && data.status >= 400) {
        throw new Error(`Failed to get chapters for Webtoons using mangaId ${mangaId}`)
      }

      let $ = this.cheerio.load(data.data);

      const parseResults = parseGetChaptersChallenge($, mangaId);

      // If there are more pages that need to be scanned, concat them together
      let hasNextPage = parseResults.hasNextPage;
      while (hasNextPage) {
        const newRequest = createRequestObject({
          url: `${WEBTOON_DOMAIN}/en/challenge/${parseResults.pagnationId}/list?title_no=${mangaId.substr(1, mangaId.length)}&page=${hasNextPage}`,
          method: "GET",
          headers: {
            referer: WEBTOON_DOMAIN,
          },
        });

        data = await this.requestManager.schedule(newRequest, 1);
        $ = this.cheerio.load(data.data);

        const appendResults = parseGetChaptersChallenge($, mangaId);
        hasNextPage = appendResults.hasNextPage;
        parseResults.chapters = parseResults.chapters.concat(appendResults.chapters);
      }

      // We've collected all of the pages, reverse the chapter list so that we're going from 1 to current properly, and return!
      return parseResults.chapters.reverse();
    } else {
      const request = createRequestObject({
        url: `${WEBTOON_DOMAIN}/en/aaahh/reeeee/list?title_no=${mangaId}`,
        method: "GET",
        headers: {
          referer: WEBTOON_DOMAIN,
        },
      });

      let data = await this.requestManager.schedule(request, 1);
      let $ = this.cheerio.load(data.data);

      const parseResults = parseGetChaptersOrig($, mangaId);

      // If there are more pages that need to be scanned, concat them together
      let hasNextPage = parseResults.hasNextPage;
      while (hasNextPage) {
        const newRequest = createRequestObject({
          url: `${WEBTOON_DOMAIN}/en/${parseResults.titleId}/${parseResults.pagnationId}/list?title_no=${mangaId}&page=${hasNextPage}`,
          method: "GET",
          headers: {
            referer: WEBTOON_DOMAIN,
          },
        });

        data = await this.requestManager.schedule(newRequest, 1);
        $ = this.cheerio.load(data.data);

        const appendResults = parseGetChaptersOrig($, mangaId);
        hasNextPage = appendResults.hasNextPage;
        parseResults.chapters = parseResults.chapters.concat(appendResults.chapters);
      }

      // We've collected all of the pages, reverse the chapter list so that we're going from 1 to current properly, and return!
      return parseResults.chapters.reverse();
    }
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    
    if(mangaId.startsWith('c')) {
      // Challenge parsing
      const request = createRequestObject({
        url: `${WEBTOON_DOMAIN}/en/challenge/ree/someChapter/viewer?title_no=${mangaId.substr(1, mangaId.length)}&episode_no=${chapterId}&webtoonType=CHALLENGE`,
        method: 'GET',
        headers: {
          referer: WEBTOON_DOMAIN
        }
      })

      const data = await this.requestManager.schedule(request, 1)
      if(data.status != 200 && data.status >= 400) {
        throw new Error(`Failed to get challenge chapter details for title: ${mangaId} for chapter ${chapterId}`)
      }

      const $ = this.cheerio.load(data.data)
      return parseChapterDetailsChallenge($, mangaId, chapterId)
    } else {
      // Orig parsing
      const request = createRequestObject({
        url: `${WEBTOON_DOMAIN}/en/fantasy/ree/someChapter/viewer?title_no=${mangaId}&episode_no=${chapterId}`,
        method: 'GET',
        headers: {
          referer: WEBTOON_DOMAIN
        }
      })

      const data = await this.requestManager.schedule(request, 1)
      if(data.status != 200 && data.status >= 400) {
        throw new Error(`Failed to get orig chapter details for title: ${mangaId} for chapter ${chapterId}`)
      }

      const $ = this.cheerio.load(data.data)
      return parseChapterDetailsOrig($, mangaId, chapterId)
    }

  }

  async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
    const request = createRequestObject({
      url: `${WEBTOON_DOMAIN}/en/search?keyword=${query.title}`,
      method: "GET",
      headers: {
        referer: WEBTOON_DOMAIN,
      },
    });

    const data = await this.requestManager.schedule(request, 1);

    if(data.status != 200 && data.status >= 400) {
      throw new Error(`Returned a nonstandard HTTP code: ${data.status}`)
    }

    const $ = this.cheerio.load(data.data);
    //TODO: Support paged results
    const results = await parseSearchResults($);
    return results;
  }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {

    const rollingUpdates = createHomeSection({ id: 'rolling_updates', title: 'Hot Webcomics' , view_more: true});
    const completedSeries = createHomeSection({ id: 'completed_series', title: `Completed Series`, view_more: true})
    sectionCallback(rollingUpdates)
    sectionCallback(completedSeries)

    const request = createRequestObject({
      url: `${WEBTOON_DOMAIN}/en/dailySchedule`,
      method: `GET`
    })

    const data = await this.requestManager.schedule(request, 1)
    if(data.status != 200) {
      throw new Error(`Failed to retrieve homepage information`)
    }

    const $ = this.cheerio.load(data.data)
    parseHomeSections($, [rollingUpdates, completedSeries], sectionCallback)
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults | null> {
    // We don't care about metadata for this source, fortunately
    //TODO: Add support for a view-more for canvas titles later

    switch(homepageSectionId) {
      case "rolling_updates": {
        const request = createRequestObject({
          url: `${WEBTOON_DOMAIN}/en/dailySchedule`,
          method: `GET`
        })
    
        const data = await this.requestManager.schedule(request, 1)
        if(data.status != 200 && data.status >= 400) {
          throw new Error(`Failed to getViewMoreItems for section ${homepageSectionId}`)
        }

        const $ = this.cheerio.load(data.data)
        return parseRollingViewMoreTitles($)
      }

      case "completed_series": {
        const request = createRequestObject({
          url: `${WEBTOON_DOMAIN}/en/dailySchedule`,
          method: `GET`
        })
    
        const data = await this.requestManager.schedule(request, 1)
        if(data.status != 200 && data.status >= 400) {
          throw new Error(`Failed to getViewMoreItems for section ${homepageSectionId}`)
        }

        const $ = this.cheerio.load(data.data)
        return parseCompletedViewMoreTitles($)
      }

      default: return null
    }    
  }
}
