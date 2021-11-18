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
import { parseUpdatedManga, parseTags, parseSearch, isLastPage, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, parseViewMore, UpdatedManga } from "./MangaJarParser"

const MJ_DOMAIN = 'https://mangajar.com'
const method = 'GET'

export const MangaJarInfo: SourceInfo = {
  version: '1.0.7',
  name: 'MangaJar',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from MangaJar.',
  hentaiSource: false,
  websiteBaseURL: MJ_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    }
  ]
}

export class MangaJar extends Source {
  readonly cookies = [
    createCookie({ name: 'adultConfirmed', value: '1', domain: "mangajar.com" }),
    createCookie({ name: 'readingMode', value: 'v', domain: "mangajar.com" })
  ];

  getMangaShareUrl(mangaId: string): string | null { return `${MJ_DOMAIN}/manga/${mangaId}` };

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MJ_DOMAIN}/manga/`,
      method,
      param: mangaId,
      cookies: this.cookies,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    let chapters: any = [];
    let page: number = 1;
    let isLast: boolean = false;

    while (!isLast) {
      const request = createRequestObject({
        url: `${MJ_DOMAIN}/manga/${mangaId}/chaptersList`,
        method,
        param: `?infinite=1&page=${page++}`,
        cookies: this.cookies,
      });

      const response = await this.requestManager.schedule(request, 1);
      const $ = this.cheerio.load(response.data);
      isLast = !isLastPage($) ? false : true;
      chapters = chapters.concat(parseChapters($, mangaId))
    }
    return chapters
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${MJ_DOMAIN}/manga/${mangaId}/chapter/${chapterId}`,
      method: method,
      cookies: this.cookies,
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
        url: `${MJ_DOMAIN}/manga?sortBy=-last_chapter_at&page=${page++}`,
        method,
        cookies: this.cookies,
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
    const section1 = createHomeSection({ id: 'hot_update', title: 'Top Manga Updates', view_more: true });
    const section2 = createHomeSection({ id: 'new_trending', title: 'New Trending', view_more: true });
    const section3 = createHomeSection({ id: 'popular_manga', title: 'Popular Manga', view_more: true });
    const section4 = createHomeSection({ id: 'new_manga', title: 'Recently Added', view_more: true });
    const sections = [section1, section2, section3, section4];

    const request = createRequestObject({
      url: MJ_DOMAIN,
      method,
      cookies: this.cookies,
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
        param = `/manga?sortBy=-last_chapter_at&page=${page}`;
        break;
      case "new_trending":
        param = `/manga?sortBy=-year&page=${page}`;
        break;
      case "popular_manga":
        param = `/manga?sortBy=popular&page=${page}`;
        break;
      case "new_manga":
        param = `/manga?sortBy=-published_at&page=${page}`;
        break;
      default:
        throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`)
    }
    const request = createRequestObject({
      url: MJ_DOMAIN,
      method,
      param,
      cookies: this.cookies,
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
      url: `${MJ_DOMAIN}/search?q=`,
      method,
      headers: {
        "Accept": "text/html",
      },
      cookies: this.cookies,
      param: `${search}&page=${page}`
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
      url: `${MJ_DOMAIN}/genre`,
      method,
      cookies: this.cookies,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }

}