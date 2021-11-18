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
exports.MangaKatana = exports.MangaKatanaInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaKatanaParser_1 = require("./MangaKatanaParser");
const MK_DOMAIN = 'https://mangakatana.com';
const method = 'GET';
const headers = {
    "content-type": "application/x-www-form-urlencoded"
};
exports.MangaKatanaInfo = {
    version: '1.0.6',
    name: 'MangaKatana',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaKatana.',
    hentaiSource: false,
    websiteBaseURL: MK_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaKatana extends paperback_extensions_common_1.Source {
    getMangaShareUrl(mangaId) { return `${MK_DOMAIN}/manga/${mangaId}`; }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MK_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaKatanaParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MK_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaKatanaParser_1.parseChapters)($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MK_DOMAIN}/manga/${mangaId}/${chapterId}`,
                method: method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data, { xmlMode: false });
            return (0, MangaKatanaParser_1.parseChapterDetails)($, mangaId, chapterId);
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MK_DOMAIN}/genres`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaKatanaParser_1.parseTags)($);
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
                    url: `${MK_DOMAIN}/latest/page/${page++}`,
                    method,
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = (0, MangaKatanaParser_1.parseUpdatedManga)($, time, ids);
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
            const section1 = createHomeSection({ id: 'hot_update', title: 'Hot Updates' });
            const section2 = createHomeSection({ id: 'hot_manga', title: 'Hot Manga', view_more: true });
            const section3 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
            const sections = [section1, section2, section3];
            const request = createRequestObject({
                url: MK_DOMAIN,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            (0, MangaKatanaParser_1.parseHomeSections)($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case "hot_manga":
                    param = `/new-manga/page/${page}`;
                    break;
                case "latest_updates":
                    param = `/latest/page/${page}`;
                    break;
                default:
                    return Promise.resolve(null);
                    ;
            }
            const request = createRequestObject({
                url: `${MK_DOMAIN}`,
                method,
                param,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaKatanaParser_1.parseViewMore)($, homepageSectionId);
            metadata = !(0, MangaKatanaParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
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
            const search = (0, MangaKatanaParser_1.generateSearch)(query);
            const request = createRequestObject({
                url: MK_DOMAIN,
                method,
                headers,
                param: `/page/${page}?search=${search}&search_by=book_name`
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaKatanaParser_1.parseSearch)($);
            metadata = !(0, MangaKatanaParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
}
exports.MangaKatana = MangaKatana;
