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
import { parseUpdatedManga, parseTags, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, parseViewMore, UpdatedManga } from "./FunmangaParser"

const FM_DOMAIN = 'https://www.funmanga.com'
const method = 'GET'

export const FunmangaInfo: SourceInfo = {
  version: '1.0.4',
  name: 'Funmanga',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from Funmanga.',
  hentaiSource: false,
  websiteBaseURL: FM_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    }
  ]
}

export class Funmanga extends Source {
  getMangaShareUrl(mangaId: string): string | null { return `${FM_DOMAIN}/${mangaId}` };

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${FM_DOMAIN}/`,
      method,
      param: mangaId,
    })

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${FM_DOMAIN}/`,
      method,
      param: mangaId,
    })

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${FM_DOMAIN}/${mangaId}/${chapterId}`,
      method: method,
      param: "/all-pages"
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data, { xmlMode: false });
    return parseChapterDetails($, mangaId, chapterId);
  }

  async getTags(): Promise<TagSection[] | null> {
    const request = createRequestObject({
      url: `${FM_DOMAIN}`,
      method,
    })

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
        url: `${FM_DOMAIN}/latest-chapters/${page++}`,
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
    const section1 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
    const section2 = createHomeSection({ id: 'hot_update', title: 'Hot Updates' });
    const sections = [section1, section2];

    const request = createRequestObject({
      url: FM_DOMAIN,
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
      case "latest_updates":
        param = `/latest-chapters/${page}`;
        break;
      default:
        return Promise.resolve(null);;
    };

    const request = createRequestObject({
      url: `${FM_DOMAIN}`,
      method,
      param,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const manga = parseViewMore($, homepageSectionId);
    metadata = { page: page + 1 } //There are over 800 pages, some of them have page number but no manga, I doubt anyone will scroll over 700 pages of manga.
    return createPagedResults({
      results: manga,
      metadata
    });
  }

  async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
    const search = generateSearch(query);
    const Searchrequest = createRequestObject({
      url: `${FM_DOMAIN}/service/search`,
      method: "POST",
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-type': "application/x-www-form-urlencoded",
      },
      data: `dataType=json&phrase=${search}`
    });

    let response = await this.requestManager.schedule(Searchrequest, 1);
    response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    const data = Object(response);
    const manga: MangaTile[] = [];
    for (const m of data) {
      const id = m.url.split("https://www.funmanga.com/")[1];
      const image = "https:" + m.image.replace("_30x0", "_198x0");
      const title = m.title;
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
}
