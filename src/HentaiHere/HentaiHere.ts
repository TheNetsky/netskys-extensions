import {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  SearchRequest,
  PagedResults,
  SourceInfo,
  TagType,
  TagSection,
} from "paperback-extensions-common"
import { parseTags, parseSearch, isLastPage, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, parseViewMore, UpdatedManga } from "./HentaiHereParser"

const HH_DOMAIN = 'https://hentaihere.com'
const method = 'GET'

export const HentaiHereInfo: SourceInfo = {
  version: '1.0.4',
  name: 'HentaiHere',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from HentaiHere',
  hentaiSource: false,
  websiteBaseURL: HH_DOMAIN,
  sourceTags: [
    {
      text: "18+",
      type: TagType.YELLOW
    }
  ]
}

export class HentaiHere extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${HH_DOMAIN}/m/${mangaId}` };

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${HH_DOMAIN}/m/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${HH_DOMAIN}/m/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${HH_DOMAIN}/m/${mangaId}/${chapterId}/1`,
      method: method,
    });

    const response = await this.requestManager.schedule(request, 1);
    return parseChapterDetails(response.data, mangaId, chapterId);
  }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'staff_pick', title: 'Staff Pick', view_more: true });
    const section2 = createHomeSection({ id: 'recently_added', title: 'Recently Added', view_more: true });
    const section3 = createHomeSection({ id: 'trending', title: 'Trending', view_more: true });
    const sections = [section1, section2, section3];

    const request = createRequestObject({
      url: HH_DOMAIN,
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
      case "staff_pick":
        param = `/directory/staff-pick?page=${page}`;
        break;
      case "recently_added":
        param = `/directory/newest?page=${page}`;
        break;
      case "trending":
        param = `/directory/trending?page=${page}`;
        break;
      default:
        return Promise.resolve(null);;
    }

    const request = createRequestObject({
      url: HH_DOMAIN,
      method,
      param
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const manga = parseViewMore($);
    metadata = !isLastPage($) ? { page: page + 1 } : undefined;
    return createPagedResults({
      results: manga,
      metadata,
    });
  }

  async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
    let page: number = metadata?.page ?? 1;
    const search = generateSearch(query);
    const request = createRequestObject({
      url: `${HH_DOMAIN}/search?s=`,
      method,
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
      url: `${HH_DOMAIN}/tags/category`,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }

}