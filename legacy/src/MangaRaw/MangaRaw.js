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
exports.MangaRaw = exports.MangaRawInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaRawParser_1 = require("./MangaRawParser");
const MR_DOMAIN = 'https://www.manga-raw.club';
const method = 'GET';
exports.MangaRawInfo = {
    version: '1.0.4',
    name: 'MangaRaw',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaRaw.',
    hentaiSource: false,
    websiteBaseURL: MR_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaRaw extends paperback_extensions_common_1.Source {
    getMangaShareUrl(mangaId) { return `${MR_DOMAIN}/manga/${mangaId}`; }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MR_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaRawParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MR_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaRawParser_1.parseChapters)($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MR_DOMAIN}/reader/en/${chapterId}`,
                method: method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaRawParser_1.parseChapterDetails)($, mangaId, chapterId);
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
                    url: `${MR_DOMAIN}/browse/?results=${page++}&filter=Updated`,
                    method,
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = (0, MangaRawParser_1.parseUpdatedManga)($, time, ids);
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
            const section1 = createHomeSection({ id: 'trending_manga', title: 'Trending Manga', view_more: false });
            const section2 = createHomeSection({ id: 'most_viewed', title: 'Most Viewed Today', view_more: false });
            const section3 = createHomeSection({ id: 'new_manga', title: 'New Manga', view_more: true });
            const sections = [section1, section2, section3];
            const request = createRequestObject({
                url: MR_DOMAIN,
                method,
                param: "/listy/manga/"
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            (0, MangaRawParser_1.parseHomeSections)($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case "new_manga":
                    param = `/browse/?results=${page}&filter=New`;
                    break;
                case "top_manga":
                    param = `/browse/?results=${page}&filter=views`;
                    break;
                default:
                    return Promise.resolve(null);
                    ;
            }
            const request = createRequestObject({
                url: `${MR_DOMAIN}`,
                method,
                param,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaRawParser_1.parseViewMore)($, homepageSectionId);
            metadata = !(0, MangaRawParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    searchRequest(query, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const search = (0, MangaRawParser_1.generateSearch)(query);
            const request = createRequestObject({
                url: `${MR_DOMAIN}/search/?search=`,
                method,
                param: search
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangaRawParser_1.parseSearch)($);
            return createPagedResults({
                results: manga,
                metadata: undefined
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MR_DOMAIN}/browse`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaRawParser_1.parseTags)($);
        });
    }
}
exports.MangaRaw = MangaRaw;
