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
  TagSection,
} from "paperback-extensions-common"
import { parseUpdatedManga, parseTags, parseSearch, isLastPage, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, parseViewMore, UpdatedManga } from "./MangaBuddyParser"

const MB_DOMAIN = 'https://mangabuddy.com'
const method = 'GET'

export const MangaBuddyInfo: SourceInfo = {
  version: '1.0.1',
  name: 'MangaBuddy',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from MangaBuddy.',
  hentaiSource: false,
  websiteBaseURL: MB_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    }
  ]
}

export class MangaBuddy extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${MB_DOMAIN}/${mangaId}` };

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MB_DOMAIN}/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }
  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${MB_DOMAIN}/api/manga/${mangaId}/chapters`,
      method,
    });

    let response = await this.requestManager.schedule(request, 1);
    response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    const data = Object(response);
    return parseChapters(data, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${MB_DOMAIN}/${mangaId}/${chapterId}`,
      method: method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapterDetails($, mangaId, chapterId);
  }

  async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
    let updatedManga: UpdatedManga = {
      ids: [],
    };

    const request = createRequestObject({
      url: `${MB_DOMAIN}`,
      method,
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

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'latest_update', title: 'Latest Update', view_more: true });
    const section2 = createHomeSection({ id: 'hot_manga', title: 'Popular Manga', view_more: true });
    const section3 = createHomeSection({ id: 'top_manga_monthly', title: 'Most Popular Monthly', view_more: false });
    const section4 = createHomeSection({ id: 'top_manga_weekly', title: 'Most Popular Weekly', view_more: false });
    const sections = [section1, section2, section3, section4];

    const request = createRequestObject({
      url: MB_DOMAIN,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    parseHomeSections($, sections, sectionCallback);
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults | null> {
    let page: number = metadata?.page ?? 1;
    let param = '';
    switch (homepageSectionId) {
      case "latest_update":
        param = `/latest?page=${page}`;
        break;
      case "hot_manga":
        param = `/popular?page=${page}`;
        break;
      default:
        return Promise.resolve(null);;
    }
    const request = createRequestObject({
      url: MB_DOMAIN,
      method,
      param,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const manga = parseViewMore($);
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
      url: `${MB_DOMAIN}/search?q=`,
      method,
      param: search + `&page=${page}`
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
      url: `${MB_DOMAIN}`,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }

}