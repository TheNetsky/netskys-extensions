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
exports.MangaFox2 = exports.MangaFox2Info = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaFox2Parser_1 = require("./MangaFox2Parser");
const FF_DOMAIN = 'https://fanfox.net';
const FF_DOMAIN_MOBILE = 'https://m.fanfox.net';
const method = 'GET';
const headers = {
    "content-type": "application/x-www-form-urlencoded"
};
exports.MangaFox2Info = {
    version: '1.0.12',
    name: 'MangaFox2',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from Fanfox aka Mangafox.',
    hentaiSource: false,
    websiteBaseURL: FF_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaFox2 extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.cookies = [createCookie({ name: 'isAdult', value: '1', domain: "fanfox.net" })];
    }
    getMangaShareUrl(mangaId) { return `${FF_DOMAIN}/manga/${mangaId}`; }
    ;
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FF_DOMAIN}/manga/`,
                method,
                param: mangaId,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFox2Parser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FF_DOMAIN}/manga/`,
                method,
                param: mangaId,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFox2Parser_1.parseChapters)($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FF_DOMAIN_MOBILE}/roll_manga/${mangaId}/${chapterId}`,
                method: method,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFox2Parser_1.parseChapterDetails)($, mangaId, chapterId);
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
                    url: `${FF_DOMAIN}/releases/${page++}.html`,
                    method,
                    cookies: this.cookies
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = (0, MangaFox2Parser_1.parseUpdatedManga)($, time, ids);
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
            const section1 = createHomeSection({ id: 'hot_update', title: 'Hot Manga Releases', view_more: true });
            const section2 = createHomeSection({ id: 'being_read', title: 'Being Read Right Now' });
            const section3 = createHomeSection({ id: 'new_manga', title: 'New Manga Releases', view_more: true });
            const section4 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
            const sections = [section1, section2, section3, section4];
            const request = createRequestObject({
                url: FF_DOMAIN,
                method,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            (0, MangaFox2Parser_1.parseHomeSections)($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case "hot_update":
                    param = `/hot/`;
                    break;
                case "new_manga":
                    param = `/directory/${page}.html?news`;
                    break;
                case "latest_updates":
                    param = `/releases/${page}.html`;
                    break;
                default:
                    return Promise.resolve(null);
                    ;
            }
            const request = createRequestObject({
                url: `${FF_DOMAIN}`,
                method,
                param,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaFox2Parser_1.parseViewMore)($, homepageSectionId);
            metadata = !(0, MangaFox2Parser_1.isLastPage)($) ? { page: page + 1 } : undefined;
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
            const search = (0, MangaFox2Parser_1.generateSearch)(query);
            const request = createRequestObject({
                url: `${FF_DOMAIN}/search?`,
                method,
                headers,
                cookies: this.cookies,
                param: `title=${search}&page=${page}`
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaFox2Parser_1.parseSearch)($);
            metadata = !(0, MangaFox2Parser_1.isLastPage)($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FF_DOMAIN}/search?`,
                method,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFox2Parser_1.parseTags)($);
        });
    }
}
exports.MangaFox2 = MangaFox2;
