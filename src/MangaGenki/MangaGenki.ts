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
import { parseUpdatedManga, parseTags, parseSearch, isLastPage, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, parseViewMore, UpdatedManga } from "./MangaGenkiParser"

const MG_DOMAIN = 'https://mangagenki.com'
const method = 'GET'

export const MangaGenkiInfo: SourceInfo = {
  version: '1.0.1',
  name: 'MangaGenki',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from MangaGenki.',
  hentaiSource: false, //Should be true when MangaDex returns
  websiteBaseURL: MG_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    },
    {
      text: "18+",
      type: TagType.YELLOW
    }

  ]
}

export class MangaGenki extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${MG_DOMAIN}/manga/${mangaId}` }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MG_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${MG_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    let metadata = { 'mangaId': mangaId, 'chapterId': chapterId, 'nextPage': false, 'page': 1 }
    const request = createRequestObject({
      url: `${MG_DOMAIN}/${chapterId}`,
      method: method,
      metadata: metadata,
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
        url: `${MG_DOMAIN}/page/${page++}/`,
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

  }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'new_manga', title: 'New Manga', view_more: true });
    const section2 = createHomeSection({ id: 'latest_update', title: 'Latest Update', view_more: true });
    const section3 = createHomeSection({ id: 'top_manga', title: 'Most Popular All Time', view_more: true });
    const section4 = createHomeSection({ id: 'top_manga_monthly', title: 'Most Popular Monthly', view_more: false });
    const section5 = createHomeSection({ id: 'top_manga_weekly', title: 'Most Popular Weekly', view_more: false });

    const sections = [section1, section2, section3, section4, section5];

    const request = createRequestObject({
      url: MG_DOMAIN,
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
      case "new_manga":
        param = `/manga/?page=${page}&order=latest`;
        break;
      case "latest_update":
        param = `/manga/?page=${page}&order=update`;
        break;
      case "top_manga":
        param = `/manga/?page=${page}&order=popular`;
        break;
      default:
        return Promise.resolve(null);;
    }
    const request = createRequestObject({
      url: `${MG_DOMAIN}`,
      method,
      param,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const manga = parseViewMore($, homepageSectionId);
    metadata = !isLastPage($, "view_more") ? { page: page + 1 } : undefined;
    return createPagedResults({
      results: manga,
      metadata
    });
  }

  async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
    let page: number = metadata?.page ?? 1;
    const search = generateSearch(query);
    const request = createRequestObject({
      url: `${MG_DOMAIN}/page/${page}/?s=`,
      method,
      param: `${search}`
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    const manga = parseSearch($);
    metadata = !isLastPage($, "search_request") ? { page: page + 1 } : undefined;

    return createPagedResults({
      results: manga,
      metadata
    });
  }

  async getTags(): Promise<TagSection[] | null> {
    const request = createRequestObject({
      url: `${MG_DOMAIN}`,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }
}