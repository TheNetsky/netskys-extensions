import {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  SearchRequest,
  PagedResults,
  SourceInfo,
  MangaUpdates,
  TagType,
  TagSection
} from "paperback-extensions-common"
import { parseUpdatedManga, isLastPage, parseTags, generateSearch, parseChapters, parseHomeSections, parseMangaDetails, parseSearch, parseViewMore, UpdatedManga } from "./MangahubParser"

const MH_DOMAIN = 'https://mangahub.io'
const method = 'GET'
const headers = {
  "content-type": "application/x-www-form-urlencoded"
}

export const MangahubInfo: SourceInfo = {
  version: '1.0.8',
  name: 'Mangahub',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from Mangahub.',
  hentaiSource: false,
  websiteBaseURL: MH_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    }
  ]
}

export class Mangahub extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${MH_DOMAIN}/manga/${mangaId}` }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MH_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${MH_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const chapterNumber = chapterId.split("chapter-")[1];

    const request = createRequestObject({
      url: `https://api.mghubcdn.com/graphql`,
      method: "POST",
      headers: {
        'content-type': 'application/json',
      },
      data: `{\"query\":\"{chapter(x:m01,slug:\\\"${mangaId}\\\",number:${chapterNumber}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`
    });

    let response = await this.requestManager.schedule(request, 1);
    response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    const data = Object(response.data);
    if (!data?.chapter?.pages) throw new Error('Missing "chaper" or "pages" property!');
    const rawPages = JSON.parse(data.chapter.pages);

    const pages: string[] = [];
    for (const i in rawPages) {
      pages.push("https://img.mghubcdn.com/file/imghub/" + rawPages[i]);
    }
    return createChapterDetails({
      id: chapterId,
      mangaId: mangaId,
      pages: pages,
      longStrip: false
    });
  }

  async getTags(): Promise<TagSection[] | null> {
    const request = createRequestObject({
      url: `${MH_DOMAIN}/search`,
      method,
    })

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }

  async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
    let updatedManga: UpdatedManga = {
      ids: [],
    };

    const request = createRequestObject({
      url: MH_DOMAIN,
      method,
    });

    const response = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(response.data)

    updatedManga = parseUpdatedManga($, time, ids)
    if (updatedManga.ids.length > 0) {
      mangaUpdatesFoundCallback(createMangaUpdates({
        ids: updatedManga.ids
      }));
    }
  }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'hot_update', title: 'Hot Updates', view_more: true });
    const section2 = createHomeSection({ id: 'hot_manga', title: 'Hot Manga', view_more: true });
    const section3 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
    const sections = [section1, section2, section3];
    const request = createRequestObject({
      url: MH_DOMAIN,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    parseHomeSections($, sections, sectionCallback);
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults | null> {
    let page: number = metadata?.page ?? 1;
    let param = "";
    switch (homepageSectionId) {
      case "hot_manga":
        param = `/popular/page/${page}`;
        break;
      case "hot_update":
        param = `/new/page/${page}`;
        break;
      case "latest_updates":
        param = `/updates/page/${page}`;
        break;
      default:
        throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`)
    }

    const request = createRequestObject({
      url: MH_DOMAIN,
      method,
      param,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const manga = parseViewMore($, homepageSectionId);
    metadata = !isLastPage($) ? { page: page + 1 } : undefined;
    return createPagedResults({
      results: manga,
      metadata
    });
  }

  async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
    let page: number = metadata?.page ?? 1;
    const search = generateSearch(query);
    const request = createRequestObject({
      url: MH_DOMAIN,
      method,
      headers,
      param: `/search/page/${page}?q=${search}&order=POPULAR&genre=all`
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    const manga = parseSearch($);
    metadata = !isLastPage($) ? { page: page + 1 } : undefined;
    return createPagedResults({
      results: manga,
      metadata
    });
  }
}
