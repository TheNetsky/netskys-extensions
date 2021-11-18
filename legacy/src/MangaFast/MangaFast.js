"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaFast = exports.MangaFastInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaFastParser_1 = require("./MangaFastParser");
const MF_DOMAIN = 'https://mangafast.net';
const method = 'GET';
exports.MangaFastInfo = {
    version: '1.0.8',
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
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaFast extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 15000,
        });
    }
    getMangaShareUrl(mangaId) { return `${MF_DOMAIN}/read/${mangaId}`; }
    ;
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/read/${mangaId}/`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/read/${mangaId}/`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseChapters)($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/${chapterId}`,
                method: method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseChapterDetails)($, mangaId, chapterId);
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedManga = {
                ids: [],
            };
            const params = [
                "latest-update",
                "latest-manhua"
            ];
            for (const param of params) {
                const request = createRequestObject({
                    url: `${MF_DOMAIN}/home/`,
                    method,
                    param: param
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = (0, MangaFastParser_1.parseUpdatedManga)($, time, ids);
                if (updatedManga.ids.length > 0) {
                    mangaUpdatesFoundCallback(createMangaUpdates({
                        ids: updatedManga.ids
                    }));
                }
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const promises = [];
            for (const section of sections) {
                sectionCallback(section.section);
                promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                    const $ = this.cheerio.load(response.data);
                    const tiles = (0, MangaFastParser_1.parseHomeSections)($, section.section);
                    section.section.items = tiles;
                    sectionCallback(section.section);
                }));
            }
            yield Promise.all(promises);
        });
    }
    searchRequest(query, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 0;
            const search = (0, MangaFastParser_1.generateSearch)(query);
            const request = createRequestObject({
                url: `https://search.mangafast.net/comics/ms`,
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "mangafast": "mangafast"
                },
                data: JSON.stringify({
                    "q": search,
                    "limit": 50,
                    "offset": page
                })
            });
            let response = yield this.requestManager.schedule(request, 1);
            response = typeof (response.data) === "string" ? JSON.parse(response.data) : response.data;
            const data = Object(response);
            const mangas = [];
            const collectedIds = [];
            for (const manga of data.hits) {
                if (!(manga === null || manga === void 0 ? void 0 : manga.slug) || !(manga === null || manga === void 0 ? void 0 : manga.title))
                    continue;
                if (collectedIds.includes(manga.slug))
                    continue;
                mangas.push(createMangaTile({
                    id: manga.slug,
                    image: (manga === null || manga === void 0 ? void 0 : manga.thumbnail) ? manga.thumbnail : "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: manga.title }),
                }));
            }
            metadata = { page: page + 50 };
            return createPagedResults({
                results: mangas,
                metadata
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/genre/action/`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseTags)($);
        });
    }
}
exports.MangaFast = MangaFast;
