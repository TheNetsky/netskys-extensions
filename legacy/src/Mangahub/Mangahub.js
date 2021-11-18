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
exports.Mangahub = exports.MangahubInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangahubParser_1 = require("./MangahubParser");
const MH_DOMAIN = 'https://mangahub.io';
const method = 'GET';
const headers = {
    "content-type": "application/x-www-form-urlencoded"
};
exports.MangahubInfo = {
    version: '1.0.8',
    name: 'Mangahub',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from Mangahub.',
    hentaiSource: false,
    websiteBaseURL: MH_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class Mangahub extends paperback_extensions_common_1.Source {
    getMangaShareUrl(mangaId) { return `${MH_DOMAIN}/manga/${mangaId}`; }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangahubParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangahubParser_1.parseChapters)($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chapterNumber = chapterId.split("chapter-")[1];
            const request = createRequestObject({
                url: `https://api.mghubcdn.com/graphql`,
                method: "POST",
                headers: {
                    'content-type': 'application/json',
                },
                data: `{\"query\":\"{chapter(x:m01,slug:\\\"${mangaId}\\\",number:${chapterNumber}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`
            });
            let response = yield this.requestManager.schedule(request, 1);
            response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            const data = Object(response.data);
            if (!(data === null || data === void 0 ? void 0 : data.chapter))
                throw new Error('Missing "chapter" property!');
            if (!((_a = data.chapter) === null || _a === void 0 ? void 0 : _a.pages))
                throw new Error('Missing "pages" property!');
            const rawPages = JSON.parse(data.chapter.pages);
            const pages = [];
            for (const i in rawPages) {
                pages.push("https://img.mghubcdn.com/file/imghub/" + rawPages[i]);
            }
            return createChapterDetails({
                id: chapterId,
                mangaId: mangaId,
                pages: pages,
                longStrip: false
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/search`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangahubParser_1.parseTags)($);
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedManga = {
                ids: [],
            };
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            updatedManga = (0, MangahubParser_1.parseUpdatedManga)($, time, ids);
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }));
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const section1 = createHomeSection({ id: 'hot_update', title: 'Hot Updates', view_more: true });
            const section2 = createHomeSection({ id: 'hot_manga', title: 'Hot Manga', view_more: true });
            const section3 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
            const sections = [section1, section2, section3];
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            (0, MangahubParser_1.parseHomeSections)($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = "";
            switch (homepageSectionId) {
                case "hot_manga":
                    param = `/popular/page/${page}`;
                    break;
                case "hot_update":
                    param = `/new/page/${page}`;
                    break;
                case "latest_updates":
                    param = `/updates/page/${page}`;
                    break;
                default:
                    throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`);
            }
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
                param,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangahubParser_1.parseViewMore)($, homepageSectionId);
            metadata = !(0, MangahubParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
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
            const search = (0, MangahubParser_1.generateSearch)(query);
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
                headers,
                param: `/search/page/${page}?q=${search}&order=POPULAR&genre=all`
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, MangahubParser_1.parseSearch)($);
            metadata = !(0, MangahubParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
}
exports.Mangahub = Mangahub;
