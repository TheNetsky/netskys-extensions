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
exports.MangaBuddy = exports.MangaBuddyInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaBuddyParser_1 = require("./MangaBuddyParser");
const MB_DOMAIN = 'https://mangabuddy.com';
const method = 'GET';
exports.MangaBuddyInfo = {
    version: '1.0.1',
    name: 'MangaBuddy',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaBuddy.',
    hentaiSource: false,
    websiteBaseURL: MB_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaBuddy extends paperback_extensions_common_1.Source {
    getMangaShareUrl(mangaId) { return `${MB_DOMAIN}/${mangaId}`; }
    ;
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MB_DOMAIN}/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaBuddyParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MB_DOMAIN}/api/manga/${mangaId}/chapters`,
                method,
            });
            let response = yield this.requestManager.schedule(request, 1);
            response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            const data = Object(response);
            return (0, MangaBuddyParser_1.parseChapters)(data, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MB_DOMAIN}/${mangaId}/${chapterId}`,
                method: method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaBuddyParser_1.parseChapterDetails)($, mangaId, chapterId);
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedManga = {
                ids: [],
            };
            const request = createRequestObject({
                url: `${MB_DOMAIN}`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            updatedManga = (0, MangaBuddyParser_1.parseUpdatedManga)($, time, ids);
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }));
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const section1 = createHomeSection({ id: 'latest_update', title: 'Latest Update', view_more: true });
            const section2 = createHomeSection({ id: 'hot_manga', title: 'Popular Manga', view_more: true });
            const section3 = createHomeSection({ id: 'top_manga_monthly', title: 'Most Popular Monthly', view_more: false });
            const section4 = createHomeSection({ id: 'top_manga_weekly', title: 'Most Popular Weekly', view_more: false });
            const sections = [section1, section2, section3, section4];
            const request = createRequestObject({
                url: MB_DOMAIN,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            (0, MangaBuddyParser_1.parseHomeSections)($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case "latest_update":
                    param = `/latest?page=${page}`;
                    break;
                case "hot_manga":
                    param = `/popular?page=${page}`;
                    break;
                default:
                    return Promise.resolve(null);
                    ;
            }
            const request = createRequestObject({
                url: MB_DOMAIN,
                method,
                param,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaBuddyParser_1.parseViewMore)($);
            metadata = !(0, MangaBuddyParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
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
            const search = (0, MangaBuddyParser_1.generateSearch)(query);
            const request = createRequestObject({
                url: `${MB_DOMAIN}/search?q=`,
                method,
                param: search + `&page=${page}`
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaBuddyParser_1.parseSearch)($);
            metadata = !(0, MangaBuddyParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MB_DOMAIN}`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaBuddyParser_1.parseTags)($);
        });
    }
}
exports.MangaBuddy = MangaBuddy;
