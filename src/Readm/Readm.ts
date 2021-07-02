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
  MangaTile
} from "paperback-extensions-common"
import { parseUpdatedManga, generateSearch, parseChapterDetails, isLastPage, parseTags, parseChapters, parseHomeSections, parseMangaDetails, parseViewMore, UpdatedManga } from "./ReadmParser"

const RM_DOMAIN = 'https://readm.org'
const method = 'GET'

export const ReadmInfo: SourceInfo = {
  version: '1.0.11',
  name: 'Readm',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from Readm.',
  hentaiSource: false,
  websiteBaseURL: RM_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    },
    {
      text: "Cloudflare",
      type: TagType.RED
    }
  ]
}

export class Readm extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${RM_DOMAIN}/manga/${mangaId}` }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${RM_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${RM_DOMAIN}/manga/`,
      method,
      param: mangaId,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${RM_DOMAIN}/manga/${mangaId}/${chapterId}`,
      method,
      param: "/all-pages"
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data, { xmlMode: false });
    return parseChapterDetails($, mangaId, chapterId);
  }

  async getTags(): Promise<TagSection[] | null> {
    const request = createRequestObject({
      url: RM_DOMAIN,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }

  async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
    let page = 1;
    let updatedManga: UpdatedManga = {
      ids: [],
      loadMore: true
    };

    while (updatedManga.loadMore) {
      const request = createRequestObject({
        url: `${RM_DOMAIN}/latest-releases/${page++}`,
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
    const section1 = createHomeSection({ id: 'hot_update', title: 'Hot Manga Updates' });
    const section2 = createHomeSection({ id: 'hot_manga', title: 'Popular Manga', view_more: true });
    const section3 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
    const section4 = createHomeSection({ id: 'new_manga', title: 'Recently Added Manga' });
    const sections = [section1, section2, section3, section4];
    const request = createRequestObject({
      url: RM_DOMAIN,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    parseHomeSections($, sections, sectionCallback);
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults | null> {
    let page: number = metadata?.page ?? 1;
    let param: string = "";
    switch (homepageSectionId) {
      case "hot_manga":
        param = `/popular-manga/${page}`;
        break;
      case "latest_updates":
        param = `/latest-releases/${page}`;
        break;
      default:
        throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`);
    }

    const request = createRequestObject({
      url: RM_DOMAIN,
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

  async searchRequest(query: SearchRequest): Promise<PagedResults> {
    const search = generateSearch(query);
    const request = createRequestObject({
      url: `${RM_DOMAIN}/service/search`,
      method: "POST",
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-type': "application/x-www-form-urlencoded",
      },
      data: `dataType=json&phrase=${search}`
    });

    let response = await this.requestManager.schedule(request, 1);
    response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    const data = Object(response);
    const manga: MangaTile[] = [];

    if (!data.manga) throw new Error("Failed to create proper response object, missing manga property!");

    for (const m of data.manga) {
      if (!m.url || !m.title) {
        console.log("Missing URL or Title property in manga object!");
        continue;
      }
      const id: string = m.url.replace("/manga/", "");
      const image: string = RM_DOMAIN + m.image;
      const title: string = m.title;
      manga.push(createMangaTile({
        id,
        image: image,
        title: createIconText({ text: title }),
      }));
    }

    return createPagedResults({
      results: manga,
    });
  }


  getCloudflareBypassRequest() {
    return createRequestObject({
      url: RM_DOMAIN,
      method: method,
    })
  }
}