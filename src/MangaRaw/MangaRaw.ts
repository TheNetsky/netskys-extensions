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
import { parseUpdatedManga, parseTags, parseSearch, isLastPage, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, parseViewMore, UpdatedManga } from "./MangaRawParser"

const MR_DOMAIN = 'https://www.manga-raw.club'
const method = 'GET'

export const MangaRawInfo: SourceInfo = {
  version: '1.0.4',
  name: 'MangaRaw',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from MangaRaw.',
  hentaiSource: false,
  websiteBaseURL: MR_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    }
  ]
}

export class MangaRaw extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${MR_DOMAIN}/manga/${mangaId}` }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MR_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${MR_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${MR_DOMAIN}/reader/en/${chapterId}`,
      method: method,
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
        url: `${MR_DOMAIN}/browse/?results=${page++}&filter=Updated`,
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

  }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'trending_manga', title: 'Trending Manga', view_more: false });
    const section2 = createHomeSection({ id: 'most_viewed', title: 'Most Viewed Today', view_more: false });
    const section3 = createHomeSection({ id: 'new_manga', title: 'New Manga', view_more: true });
    const sections = [section1, section2, section3];

    const request = createRequestObject({
      url: MR_DOMAIN,
      method,
      param: "/listy/manga/"
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
        param = `/browse/?results=${page}&filter=New`;
        break;
      case "top_manga":
        param = `/browse/?results=${page}&filter=views`;
        break;
      default:
        return Promise.resolve(null);;
    }
    const request = createRequestObject({
      url: `${MR_DOMAIN}`,
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
    const search = generateSearch(query);
    const request = createRequestObject({
      url: `${MR_DOMAIN}/search/?search=`,
      method,
      param: search
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    const manga = parseSearch($);

    return createPagedResults({
      results: manga,
      metadata: undefined
    });
  }

  async getTags(): Promise<TagSection[] | null> {
    const request = createRequestObject({
      url: `${MR_DOMAIN}/browse`,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }
}