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
import { parseUpdatedManga, isLastPage, parseTags, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, parseSearch, parseViewMore, UpdatedManga } from "./MangaHereParser"

const MH_DOMAIN = 'https://www.mangahere.cc'
const MH_DOMAIN_MOBILE = 'http://m.mangahere.cc'
const method = 'GET'
const headers = {
  "content-type": "application/x-www-form-urlencoded"
}

export const MangaHereInfo: SourceInfo = {
  version: '1.0.12',
  name: 'MangaHere',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from MangaHere.',
  hentaiSource: false,
  websiteBaseURL: MH_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    }
  ]
}

export class MangaHere extends Source {
  readonly cookies = [createCookie({ name: 'isAdult', value: '1', domain: "www.mangahere.cc" })];
  getMangaShareUrl(mangaId: string): string | null { return `${MH_DOMAIN}/manga/${mangaId}` }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MH_DOMAIN}/manga/`,
      method,
      param: mangaId,
      cookies: this.cookies
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
      cookies: this.cookies
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${MH_DOMAIN_MOBILE}/roll_manga/${mangaId}/${chapterId}`,
      method: method,
      cookies: this.cookies
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapterDetails($, mangaId, chapterId);
  }

  async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
    let page = 1;
    let updatedManga: UpdatedManga = {
      ids: [],
      loadMore: true
    };

    while (updatedManga.loadMore) {
      const request = createRequestObject({
        url: `${MH_DOMAIN}/latest/${page++}`,
        method,
        cookies: this.cookies
      });

      const response = await this.requestManager.schedule(request, 1);
      const $ = this.cheerio.load(response.data);

      updatedManga = parseUpdatedManga($, time, ids)
      if (updatedManga.ids.length > 0) {
        mangaUpdatesFoundCallback(createMangaUpdates({
          ids: updatedManga.ids
        }));
      }
    }

  }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'hot_update', title: 'Hot Manga Releases', view_more: true });
    const section2 = createHomeSection({ id: 'being_read', title: 'Being Read Right Now' });
    const section3 = createHomeSection({ id: 'new_manga', title: 'New Manga Releases', view_more: true });
    const section4 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
    const sections = [section1, section2, section3, section4];

    const request = createRequestObject({
      url: MH_DOMAIN,
      method,
      cookies: this.cookies
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    parseHomeSections($, sections, sectionCallback);
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults | null> {
    let page: number = metadata?.page ?? 1;
    let param = '';
    switch (homepageSectionId) {
      case "hot_update":
        param = `/hot/`;
        break;
      case "new_manga":
        param = `/directory/${page}.htm?news`;
        break;
      case "latest_updates":
        param = `/latest/${page}`;
        break;
      default:
        return Promise.resolve(null);;
    }
    const request = createRequestObject({
      url: `${MH_DOMAIN}`,
      method,
      param,
      cookies: this.cookies
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
      url: `${MH_DOMAIN}/search?`,
      method,
      headers,
      cookies: this.cookies,
      param: `title=${search}&page=${page}`
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

  async getTags(): Promise<TagSection[] | null> {
    const request = createRequestObject({
      url: `${MH_DOMAIN}/search?`,
      method,
      cookies: this.cookies,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }
}