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
exports.Funmanga = exports.FunmangaInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const FunmangaParser_1 = require("./FunmangaParser");
const FM_DOMAIN = 'https://www.funmanga.com';
const method = 'GET';
exports.FunmangaInfo = {
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
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class Funmanga extends paperback_extensions_common_1.Source {
    getMangaShareUrl(mangaId) { return `${FM_DOMAIN}/${mangaId}`; }
    ;
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FM_DOMAIN}/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, FunmangaParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FM_DOMAIN}/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, FunmangaParser_1.parseChapters)($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FM_DOMAIN}/${mangaId}/${chapterId}`,
                method: method,
                param: "/all-pages"
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data, { xmlMode: false });
            return (0, FunmangaParser_1.parseChapterDetails)($, mangaId, chapterId);
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${FM_DOMAIN}`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, FunmangaParser_1.parseTags)($);
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
                    url: `${FM_DOMAIN}/latest-chapters/${page++}`,
                    method,
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = (0, FunmangaParser_1.parseUpdatedManga)($, time, ids);
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
            const section1 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
            const section2 = createHomeSection({ id: 'hot_update', title: 'Hot Updates' });
            const sections = [section1, section2];
            const request = createRequestObject({
                url: FM_DOMAIN,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            (0, FunmangaParser_1.parseHomeSections)($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case "latest_updates":
                    param = `/latest-chapters/${page}`;
                    break;
                default:
                    return Promise.resolve(null);
                    ;
            }
            ;
            const request = createRequestObject({
                url: `${FM_DOMAIN}`,
                method,
                param,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = (0, FunmangaParser_1.parseViewMore)($, homepageSectionId);
            metadata = { page: page + 1 }; //There are over 800 pages, some of them have page number but no manga, I doubt anyone will scroll over 700 pages of manga.
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    searchRequest(query, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const search = (0, FunmangaParser_1.generateSearch)(query);
            const Searchrequest = createRequestObject({
                url: `${FM_DOMAIN}/service/search`,
                method: "POST",
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-type': "application/x-www-form-urlencoded",
                },
                data: `dataType=json&phrase=${search}`
            });
            let response = yield this.requestManager.schedule(Searchrequest, 1);
            response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            const data = Object(response);
            const manga = [];
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
        });
    }
}
exports.Funmanga = Funmanga;
