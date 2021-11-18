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
exports.MangaJar = exports.MangaJarInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaJarParser_1 = require("./MangaJarParser");
const MJ_DOMAIN = 'https://mangajar.com';
const method = 'GET';
exports.MangaJarInfo = {
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
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaJar extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.cookies = [
            createCookie({ name: 'adultConfirmed', value: '1', domain: "mangajar.com" }),
            createCookie({ name: 'readingMode', value: 'v', domain: "mangajar.com" })
        ];
    }
    getMangaShareUrl(mangaId) { return `${MJ_DOMAIN}/manga/${mangaId}`; }
    ;
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MJ_DOMAIN}/manga/`,
                method,
                param: mangaId,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaJarParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            let chapters = [];
            let page = 1;
            let isLast = false;
            while (!isLast) {
                const request = createRequestObject({
                    url: `${MJ_DOMAIN}/manga/${mangaId}/chaptersList`,
                    method,
                    param: `?infinite=1&page=${page++}`,
                    cookies: this.cookies,
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                isLast = !(0, MangaJarParser_1.isLastPage)($) ? false : true;
                chapters = chapters.concat((0, MangaJarParser_1.parseChapters)($, mangaId));
            }
            return chapters;
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MJ_DOMAIN}/manga/${mangaId}/chapter/${chapterId}`,
                method: method,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaJarParser_1.parseChapterDetails)($, mangaId, chapterId);
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let page = 1;
            let updatedManga = {
                ids: [],
                loadMore: true
            };
            while (updatedManga.loadMore) {
                const request = createRequestObject({
                    url: `${MJ_DOMAIN}/manga?sortBy=-last_chapter_at&page=${page++}`,
                    method,
                    cookies: this.cookies,
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = (0, MangaJarParser_1.parseUpdatedManga)($, time, ids);
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
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            (0, MangaJarParser_1.parseHomeSections)($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
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
                    throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`);
            }
            const request = createRequestObject({
                url: MJ_DOMAIN,
                method,
                param,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaJarParser_1.parseViewMore)($);
            metadata = !(0, MangaJarParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    searchRequest(query, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            const search = (0, MangaJarParser_1.generateSearch)(query);
            const request = createRequestObject({
                url: `${MJ_DOMAIN}/search?q=`,
                method,
                headers: {
                    "Accept": "text/html",
                },
                cookies: this.cookies,
                param: `${search}&page=${page}`
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaJarParser_1.parseSearch)($);
            metadata = !(0, MangaJarParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MJ_DOMAIN}/genre`,
                method,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaJarParser_1.parseTags)($);
        });
    }
}
exports.MangaJar = MangaJar;
