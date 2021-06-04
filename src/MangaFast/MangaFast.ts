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
import { parseTags, parseSearch, isLastPage, parseUpdatedManga, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, UpdatedManga } from "./MangaFastParser"

const MF_DOMAIN = 'https://mangafast.net'
const method = 'GET'

export const MangaFastInfo: SourceInfo = {
  version: '1.0.6',
  name: 'MangaFast',
  icon: 'icon.png',
  author: 'Netsky',
  authorWebsite: 'https://github.com/TheNetsky',
  description: 'Extension that pulls manga from MangaFast.',
  hentaiSource: false,
  websiteBaseURL: MF_DOMAIN,
  sourceTags: [
    {
      text: "Notifications",
      type: TagType.GREEN
    },
    {
      text: "Slow",
      type: TagType.YELLOW
    }
  ]
}

export class MangaFast extends Source {

  requestManager = createRequestManager({
    requestsPerSecond: 4,
    requestTimeout: 15000,
  });

  getMangaShareUrl(mangaId: string): string | null { return `${MF_DOMAIN}/read/${mangaId}` };

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MF_DOMAIN}/read/${mangaId}/`,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseMangaDetails($, mangaId);
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${MF_DOMAIN}/read/${mangaId}/`,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapters($, mangaId);
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${MF_DOMAIN}/${chapterId}`, //Chapter ID has trailing slash, fix in 0.6!
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

    const params = [
      "?section=latest-update",
      "?section=latest-manhua"
    ]

    for (const param of params) {
      const request = createRequestObject({
        url: `${MF_DOMAIN}/`,
        method,
        param: param
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
    const sections = [
      //New Manga
      {
        request: createRequestObject({
          url: MF_DOMAIN,
          method,
          param: "/?section=new-manga"
        }),
        section: createHomeSection({
          id: "new_manga",
          title: "New Manga",
          view_more: false,
        }),
      },
      //Top Manga
      {
        request: createRequestObject({
          url: MF_DOMAIN,
          method,
        }),
        section: createHomeSection({
          id: "top_manga",
          title: "Top Manga",
          view_more: false,
        }),
      },
      //Popular Manga
      {
        request: createRequestObject({
          url: MF_DOMAIN,
          method,
          param: "/?section=popular-type"
        }),
        section: createHomeSection({
          id: "popular_manga",
          title: "Popular Manga",
          view_more: false,
        }),
      },
      //Latest Manga Update 
      {
        request: createRequestObject({
          url: MF_DOMAIN,
          method,
          param: "/?section=latest-update"
        }),
        section: createHomeSection({
          id: "latest_manga_update",
          title: "Latest Manga Update",
          view_more: false,
        }),
      },
      //Latest Manhua Update 
      {
        request: createRequestObject({
          url: MF_DOMAIN,
          method,
          param: "/?section=latest-manhua"
        }),
        section: createHomeSection({
          id: "latest_manhua_update",
          title: "Latest Manhua Update",
          view_more: false,
        }),
      },
    ];

    const promises: Promise<void>[] = [];

    for (const section of sections) {
      sectionCallback(section.section);
      promises.push(
        this.requestManager.schedule(section.request, 1).then(response => {
          const $ = this.cheerio.load(response.data);
          const tiles = parseHomeSections($, section.section);
          section.section.items = tiles
          sectionCallback(section.section);
        }),
      )
    }

    await Promise.all(promises);
  }

  async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
    let page: number = metadata?.page ?? 1;
    const search = generateSearch(query);
    const request = createRequestObject({
      url: `${MF_DOMAIN}/page/${page}/?s=`,
      method,
      param: search
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
      url: `${MF_DOMAIN}/genre/action/`,
      method,
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseTags($);
  }
}