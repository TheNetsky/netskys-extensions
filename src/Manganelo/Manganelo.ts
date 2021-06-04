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
  RequestHeaders
} from "paperback-extensions-common"
import { parseTags, parseSearch, isLastPage, parseViewMore, parseUpdatedManga, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, UpdatedManga } from "./ManganeloParser"

const MN_DOMAIN = 'https://manganelo.com'
const MANGANATO_DOMAIN = 'https://manganato.com'
const READMANGANATO_DOMAIN = 'https://readmanganato.com'
const method = 'GET'

export const ManganeloInfo: SourceInfo = {
  version: '2.3.0',
  name: 'Manganelo',
  icon: 'icon.png',
  author: 'Daniel Kovalevich & Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from Manganelo.',
  hentaiSource: false,
  websiteBaseURL: MN_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    }
  ]
}

export class Manganelo extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${MN_DOMAIN}/manga/${mangaId}` };

  // Temporary solution until migration is out in public builds
  async getNewMangaId(oldMangaId: string): Promise<string> {
    const request = createRequestObject({
      url: `${MN_DOMAIN}/manga/`,
      method,
      param: oldMangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const newMangaId = $('link[rel=canonical]').first().attr('href')?.split('/').pop()
    if (!newMangaId) {
      throw new Error(`Failed to get new id for ${oldMangaId}`)
    }

    return newMangaId
  }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    let url: string
    if (mangaId.includes('manga')) {
      url = `${READMANGANATO_DOMAIN}/${mangaId}`
    } else {
      url = `${MN_DOMAIN}/manga/${mangaId}`
    }

    const request = createRequestObject({
      url,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    let url: string
    if (mangaId.includes('manga')) {
      url = `${READMANGANATO_DOMAIN}/${mangaId}`
    } else {
      url = `${MN_DOMAIN}/manga/${mangaId}`
    }

    const request = createRequestObject({
      url,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    let newMangaId: string
    if (mangaId.includes('manga')) {
      newMangaId = mangaId
    } else {
      newMangaId = await this.getNewMangaId(mangaId)
    }

    const request = createRequestObject({
      url: `${READMANGANATO_DOMAIN}/${newMangaId}/${chapterId}`,
      method: method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapterDetails($, mangaId, chapterId);
  }

  // async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
  //   let page = 1
  //   let updatedManga: UpdatedManga = {
  //     ids: [],
  //     loadMore: true
  //   }

  //   while (updatedManga.loadMore) {
  //     const request = createRequestObject({
  //       url: `${MN_DOMAIN}/genre-all/${page++}`,
  //       method,
  //     });

  //     const response = await this.requestManager.schedule(request, 1);
  //     const $ = this.cheerio.load(response.data);

  //     updatedManga = parseUpdatedManga($, time, ids)
  //     if (updatedManga.ids.length > 0) {
  //       mangaUpdatesFoundCallback(createMangaUpdates({
  //         ids: updatedManga.ids
  //       }));
  //     }
  //   }
  // }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'top_week', title: 'TOP OF THE WEEK', view_more: true });
    const section2 = createHomeSection({ id: 'latest_update', title: 'LATEST UPDATES', view_more: true });
    const section3 = createHomeSection({ id: 'new_manga', title: 'NEW MANGA', view_more: true });
    const sections = [section1, section2, section3];
    const request = createRequestObject({
      url: MANGANATO_DOMAIN,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    parseHomeSections($, sections, sectionCallback);
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
    let page: number = metadata?.page ?? 1;
    let param = "";
    switch (homepageSectionId) {
      case "top_week":
        param = "?type=topview"
        break;
      case "latest_update":
        param = ""
        break;
      case "new_manga":
        param = "?type=newest"
        break;
      default:
        throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
    }

    const request = createRequestObject({
      url: `${MANGANATO_DOMAIN}/genre-all/${page}`,
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
      url: `${MANGANATO_DOMAIN}/search/story/${search}`,
      method,
      param: `?page=${page}`
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

  // async getTags(): Promise<TagSection[] | null> {
  //   const request = createRequestObject({
  //     url: MN_DOMAIN,
  //     method,
  //   });

  //   const response = await this.requestManager.schedule(request, 1);
  //   const $ = this.cheerio.load(response.data);
  //   return parseTags($);
  // }

  globalRequestHeaders(): RequestHeaders {
    return {
      referer: MN_DOMAIN
    }
  }
}