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
import { parseTags, parseUpdatedManga, generateSearch, parseChapterDetails, parseChapters, parseHomeSections, parseMangaDetails, UpdatedManga } from "./MangaFastParser"

const MF_DOMAIN = 'https://mangafast.net'
const method = 'GET'

export const MangaFastInfo: SourceInfo = {
  version: '1.0.7',
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
      "latest-update",
      "latest-manhua"
    ]

    for (const param of params) {
      const request = createRequestObject({
        url: `${MF_DOMAIN}/home/`,
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
          url: `${MF_DOMAIN}/home/`,
          method,
          param: "new-manga"
        }),
        section: createHomeSection({
          id: "new_manga",
          title: "New Manga",
          view_more: false,
        }),
      },
      //Popular Manga
      {
        request: createRequestObject({
          url: `${MF_DOMAIN}/home/`,
          method,
          param: "popular-type"
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
          url: `${MF_DOMAIN}/home/`,
          method,
          param: "latest-update"
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
          url: `${MF_DOMAIN}/home/`,
          method,
          param: "latest-manhua"
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
    let page: number = metadata?.page ?? 0;
    const search = generateSearch(query);
    const request = createRequestObject({
      url: `https://search.mangafast.net/indexes/comics/search`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Meili-API-Key": "masterKey"

      },
      data: JSON.stringify({
        "q": search,
        "limit": 50,
        "offset": page
      })
    });

    let response = await this.requestManager.schedule(request, 1);
    response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    const data = Object(response);

    const mangas = [];
    const collectedIds: string[] = [];
    for (const manga of data.hits) {
      if (collectedIds.includes(manga.slug)) continue;
      mangas.push(createMangaTile({
        id: manga.slug,
        image: manga?.thumbnail ? manga.thumbnail : "https://i.imgur.com/GYUxEX8.png",
        title: createIconText({ text: manga.title }),
      }));
    }

    metadata = { page: page + 50 };

    return createPagedResults({
      results: mangas,
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