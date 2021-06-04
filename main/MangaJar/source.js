(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
class Source {
    constructor(cheerio) {
        // <-----------        OPTIONAL METHODS        -----------> //
        /**
         * Manages the ratelimits and the number of requests that can be done per second
         * This is also used to fetch pages when a chapter is downloading
         */
        this.requestManager = createRequestManager({
            requestsPerSecond: 2.5,
            requestTimeout: 5000
        });
        this.cheerio = cheerio;
    }
    /**
     * (OPTIONAL METHOD) This function is called when ANY request is made by the Paperback Application out to the internet.
     * By modifying the parameter and returning it, the user can inject any additional headers, cookies, or anything else
     * a source may need to load correctly.
     * The most common use of this function is to add headers to image requests, since you cannot directly access these requests through
     * the source implementation itself.
     *
     * NOTE: This does **NOT** influence any requests defined in the source implementation. This function will only influence requests
     * which happen behind the scenes and are not defined in your source.
     */
    globalRequestHeaders() { return {}; }
    globalRequestCookies() { return []; }
    /**
     * A stateful source may require user input.
     * By supplying this value to the Source, the app will render your form to the user
     * in the application settings.
     */
    getAppStatefulForm() { return createUserForm({ formElements: [] }); }
    /**
     * When the Advanced Search is rendered to the user, this skeleton defines what
     * fields which will show up to the user, and returned back to the source
     * when the request is made.
     */
    getAdvancedSearchForm() { return createUserForm({ formElements: [] }); }
    /**
     * (OPTIONAL METHOD) Given a manga ID, return a URL which Safari can open in a browser to display.
     * @param mangaId
     */
    getMangaShareUrl(mangaId) { return null; }
    /**
     * If a source is secured by Cloudflare, this method should be filled out.
     * By returning a request to the website, this source will attempt to create a session
     * so that the source can load correctly.
     * Usually the {@link Request} url can simply be the base URL to the source.
     */
    getCloudflareBypassRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which communicates with a given source, and returns a list of all possible tags which the source supports.
     * These tags are generic and depend on the source. They could be genres such as 'Isekai, Action, Drama', or they can be
     * listings such as 'Completed, Ongoing'
     * These tags must be tags which can be used in the {@link searchRequest} function to augment the searching capability of the application
     */
    getTags() { return Promise.resolve(null); }
    /**
     * (OPTIONAL METHOD) A function which should scan through the latest updates section of a website, and report back with a list of IDs which have been
     * updated BEFORE the supplied timeframe.
     * This function may have to scan through multiple pages in order to discover the full list of updated manga.
     * Because of this, each batch of IDs should be returned with the mangaUpdatesFoundCallback. The IDs which have been reported for
     * one page, should not be reported again on another page, unless the relevent ID has been detected again. You do not want to persist
     * this internal list between {@link Request} calls
     * @param mangaUpdatesFoundCallback A callback which is used to report a list of manga IDs back to the API
     * @param time This function should find all manga which has been updated between the current time, and this parameter's reported time.
     *             After this time has been passed, the system should stop parsing and return
     */
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) { return Promise.resolve(); }
    /**
     * (OPTIONAL METHOD) A function which should readonly allf the available homepage sections for a given source, and return a {@link HomeSection} object.
     * The sectionCallback is to be used for each given section on the website. This may include a 'Latest Updates' section, or a 'Hot Manga' section.
     * It is recommended that before anything else in your source, you first use this sectionCallback and send it {@link HomeSection} objects
     * which are blank, and have not had any requests done on them just yet. This way, you provide the App with the sections to render on screen,
     * which then will be populated with each additional sectionCallback method called. This is optional, but recommended.
     * @param sectionCallback A callback which is run for each independant HomeSection.
     */
    getHomePageSections(sectionCallback) { return Promise.resolve(); }
    /**
     * (OPTIONAL METHOD) This function will take a given homepageSectionId and metadata value, and with this information, should return
     * all of the manga tiles supplied for the given state of parameters. Most commonly, the metadata value will contain some sort of page information,
     * and this request will target the given page. (Incrementing the page in the response so that the next call will return relevent data)
     * @param homepageSectionId The given ID to the homepage defined in {@link getHomePageSections} which this method is to readonly moreata about
     * @param metadata This is a metadata parameter which is filled our in the {@link getHomePageSections}'s return
     * function. Afterwards, if the metadata value returned in the {@link PagedResults} has been modified, the modified version
     * will be supplied to this function instead of the origional {@link getHomePageSections}'s version.
     * This is useful for keeping track of which page a user is on, pagnating to other pages as ViewMore is called multiple times.
     */
    getViewMoreItems(homepageSectionId, metadata) { return Promise.resolve(null); }
    /**
     * (OPTIONAL METHOD) This function is to return the entire library of a manga website, page by page.
     * If there is an additional page which needs to be called, the {@link PagedResults} value should have it's metadata filled out
     * with information needed to continue pulling information from this website.
     * Note that if the metadata value of {@link PagedResults} is undefined, this method will not continue to run when the user
     * attempts to readonly morenformation
     * @param metadata Identifying information as to what the source needs to call in order to readonly theext batch of data
     * of the directory. Usually this is a page counter.
     */
    getWebsiteMangaDirectory(metadata) { return Promise.resolve(null); }
    // <-----------        PROTECTED METHODS        -----------> //
    // Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('minutes')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(Date.now());
        }
        return time;
    }
    /**
     * When a function requires a POST body, it always should be defined as a JsonObject
     * and then passed through this function to ensure that it's encoded properly.
     * @param obj
     */
    urlEncodeObject(obj) {
        let ret = {};
        for (const entry of Object.entries(obj)) {
            ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
        }
        return ret;
    }
}
exports.Source = Source;

},{}],3:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);

},{"./Source":2}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./APIWrapper"), exports);

},{"./APIWrapper":1,"./base":3,"./models":25}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],6:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],7:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],8:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],11:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],12:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],13:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],14:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],15:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],16:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],17:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],18:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],19:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],20:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],22:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],23:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],24:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],25:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./TrackObject"), exports);
__exportStar(require("./OAuth"), exports);
__exportStar(require("./UserForm"), exports);

},{"./Chapter":5,"./ChapterDetails":6,"./Constants":7,"./HomeSection":8,"./Languages":9,"./Manga":10,"./MangaTile":11,"./MangaUpdate":12,"./OAuth":13,"./PagedResults":14,"./RequestHeaders":15,"./RequestManager":16,"./RequestObject":17,"./ResponseObject":18,"./SearchRequest":19,"./SourceInfo":20,"./SourceTag":21,"./TagSection":22,"./TrackObject":23,"./UserForm":24}],26:[function(require,module,exports){
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
    version: '1.0.5',
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
        this.cookies = [createCookie({ name: 'adultConfirmed', value: '1', domain: "mangajar.com" })];
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
            return MangaJarParser_1.parseMangaDetails($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MJ_DOMAIN}/manga/`,
                method,
                param: mangaId + "/chaptersList",
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangaJarParser_1.parseChapters($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            let metadata = { 'mangaId': mangaId, 'chapterId': chapterId, 'nextPage': false, 'page': 1 };
            const request = createRequestObject({
                url: `${MJ_DOMAIN}/manga/${mangaId}/chapter/${chapterId}`,
                method: method,
                metadata: metadata,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangaJarParser_1.parseChapterDetails($, mangaId, chapterId);
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
                updatedManga = MangaJarParser_1.parseUpdatedManga($, time, ids);
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
            const section3 = createHomeSection({ id: 'hot_manga', title: 'Popular Manga', view_more: true });
            const section4 = createHomeSection({ id: 'new_manga', title: 'Recently Added', view_more: true });
            const sections = [section1, section2, section3, section4];
            const request = createRequestObject({
                url: MJ_DOMAIN,
                method,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            MangaJarParser_1.parseHomeSections($, sections, sectionCallback);
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
                case "hot_manga":
                    param = `/manga?sortBy=popular&page=${page}`;
                    break;
                case "new_manga":
                    param = `/manga?sortBy=-published_at&page=${page}`;
                    break;
                default:
                    return Promise.resolve(null);
                    ;
            }
            const request = createRequestObject({
                url: `${MJ_DOMAIN}`,
                method,
                param,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = MangaJarParser_1.parseViewMore($);
            metadata = !MangaJarParser_1.isLastPage($) ? { page: page + 1 } : undefined;
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
            const search = MangaJarParser_1.generateSearch(query);
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
            const manga = MangaJarParser_1.parseSearch($);
            metadata = !MangaJarParser_1.isLastPage($) ? { page: page + 1 } : undefined;
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
            return MangaJarParser_1.parseTags($);
        });
    }
}
exports.MangaJar = MangaJar;

},{"./MangaJarParser":27,"paperback-extensions-common":4}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseTags = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
exports.parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c, _d;
    const titles = [];
    titles.push(decodeHTMLEntity($("span.post-name", "div.card-body").text().trim())); //Main English Title
    titles.push(decodeHTMLEntity($("h2.post-name-jp.h5", "div.row").text().trim())); //Japanese Title
    titles.push(decodeHTMLEntity($("h2.h6", "div.row").text().trim())); //Kanji Title
    const image = (_a = $("img", "div.col-md-5.col-lg-4.text-center").attr('src')) !== null && _a !== void 0 ? _a : "";
    const rating = $("b.ratingValue.ml-1", "div.post-info").text();
    const description = decodeHTMLEntity($("div.manga-description.entry").text().trim());
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("div.post-info > span > a[href*=genre]").toArray()) {
        const label = $(tag).text().trim();
        const id = encodeURI((_d = (_c = (_b = $(tag).attr("href")) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.split("/genre/")[1]) !== null && _d !== void 0 ? _d : "");
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $("span:contains(Status:)", "div.post-info").text().trim().split(":")[1];
    let status = paperback_extensions_common_1.MangaStatus.ONGOING;
    switch (rawStatus.toUpperCase()) {
        case 'ONGOING':
            status = paperback_extensions_common_1.MangaStatus.ONGOING;
            break;
        case 'COMPLETED':
            status = paperback_extensions_common_1.MangaStatus.COMPLETED;
            break;
        default:
            status = paperback_extensions_common_1.MangaStatus.ONGOING;
            break;
    }
    return createManga({
        id: mangaId,
        titles: titles,
        image,
        rating: Number(rating),
        status: status,
        author: "Unknown",
        tags: tagSections,
        desc: description,
        //hentai: hentai
        hentai: false //MangaDex down
    });
};
exports.parseChapters = ($, mangaId) => {
    var _a, _b;
    const chapters = [];
    for (const c of $("li.list-group-item.chapter-item").toArray()) {
        const title = decodeHTMLEntity($("span.chapter-title", c).text().trim());
        const id = String((_a = $("a", c).attr('href')) === null || _a === void 0 ? void 0 : _a.split("chapter/")[1]);
        const date = parseDate($("span.chapter-date", c).text().trim());
        const chapterNumber = Number((_b = title.split("Chapter")[1].trim()) !== null && _b !== void 0 ? _b : 0);
        chapters.push(createChapter({
            id: id,
            mangaId,
            name: title,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            chapNum: chapterNumber,
            time: date,
        }));
    }
    return chapters;
};
exports.parseChapterDetails = ($, mangaId, chapterId) => {
    var _a;
    const pages = [];
    const mainPage = $("div.carousel-item", "div.carousel-inner").toArray();
    const img = $("img[data-page]", mainPage).toArray();
    for (const p of img) {
        pages.push((_a = $(p).attr("data-alternative")) !== null && _a !== void 0 ? _a : "");
    }
    const chapterDetails = createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: false
    });
    return chapterDetails;
};
exports.parseUpdatedManga = ($, time, ids) => {
    var _a, _b;
    const updatedManga = [];
    let loadMore = true;
    for (const obj of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
        const id = (_b = (_a = $("a", obj).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1]) !== null && _b !== void 0 ? _b : "";
        const dateContext = $('.list-group-item ', $(obj));
        const date = $('span', dateContext).text();
        const mangaDate = parseDate(date);
        if (mangaDate > time) {
            if (ids.includes(id)) {
                updatedManga.push(id);
            }
        }
        else {
            loadMore = false;
        }
    }
    return {
        ids: updatedManga,
        loadMore
    };
};
exports.parseHomeSections = ($, sections, sectionCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    for (const section of sections)
        sectionCallback(section);
    //Top Manga Updates
    const topMangaUpdate = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[0]).toArray()) {
        const id = (_a = $("a", $("div.poster-container", manga)).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1];
        const title = (_b = $("a", $("div.poster-container", manga)).attr('title')) === null || _b === void 0 ? void 0 : _b.trim();
        let image = (_c = $("img", $("div.poster-container", manga)).attr('data-src')) !== null && _c !== void 0 ? _c : "";
        if (!image)
            image = (_d = $("img", $("div.poster-container", manga)).attr('src')) !== null && _d !== void 0 ? _d : "";
        let subtitle = (_e = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0]) !== null && _e !== void 0 ? _e : "";
        subtitle = "Chapter " + subtitle;
        if (!id || !title)
            continue;
        topMangaUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[0].items = topMangaUpdate;
    sectionCallback(sections[0]);
    //New Trending Manga
    const NewTrendingManga = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[1]).toArray()) {
        const id = (_f = $("a", $("div.poster-container", manga)).attr('href')) === null || _f === void 0 ? void 0 : _f.split("manga/")[1];
        const title = (_g = $("a", $("div.poster-container", manga)).attr('title')) === null || _g === void 0 ? void 0 : _g.trim();
        let image = (_h = $("img", $("div.poster-container", manga)).attr('data-src')) !== null && _h !== void 0 ? _h : "";
        if (!image)
            image = (_j = $("img", $("div.poster-container", manga)).attr('src')) !== null && _j !== void 0 ? _j : "";
        let subtitle = (_k = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0]) !== null && _k !== void 0 ? _k : "";
        subtitle = "Chapter " + subtitle;
        if (!id || !title)
            continue;
        NewTrendingManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[1].items = NewTrendingManga;
    sectionCallback(sections[1]);
    //Hot Manga
    const HotManga = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[2]).toArray()) {
        const id = (_l = $("a", $("div.poster-container", manga)).attr('href')) === null || _l === void 0 ? void 0 : _l.split("manga/")[1];
        const title = (_m = $("a", $("div.poster-container", manga)).attr('title')) === null || _m === void 0 ? void 0 : _m.trim();
        let image = (_o = $("img", $("div.poster-container", manga)).attr('data-src')) !== null && _o !== void 0 ? _o : "";
        if (!image)
            image = (_p = $("img", $("div.poster-container", manga)).attr('src')) !== null && _p !== void 0 ? _p : "";
        let subtitle = (_q = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0]) !== null && _q !== void 0 ? _q : "";
        subtitle = "Chapter " + subtitle;
        if (!id || !title)
            continue;
        HotManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[2].items = HotManga;
    sectionCallback(sections[2]);
    //New Manga
    const NewManga = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[3]).toArray()) {
        const id = (_r = $("a", $("div.poster-container", manga)).attr('href')) === null || _r === void 0 ? void 0 : _r.split("manga/")[1];
        const title = (_s = $("a", $("div.poster-container", manga)).attr('title')) === null || _s === void 0 ? void 0 : _s.trim();
        let image = (_t = $("img", $("div.poster-container", manga)).attr('data-src')) !== null && _t !== void 0 ? _t : "";
        if (!image)
            image = (_u = $("img", $("div.poster-container", manga)).attr('src')) !== null && _u !== void 0 ? _u : "";
        let subtitle = (_v = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0]) !== null && _v !== void 0 ? _v : "";
        subtitle = "Chapter " + subtitle;
        if (!id || !title)
            continue;
        NewManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[3].items = NewManga;
    sectionCallback(sections[3]);
    for (const section of sections)
        sectionCallback(section);
};
exports.generateSearch = (query) => {
    var _a;
    let search = (_a = query.title) !== null && _a !== void 0 ? _a : "";
    return encodeURI(search);
};
exports.parseSearch = ($) => {
    var _a, _b, _c, _d, _e, _f;
    const mangas = [];
    for (const obj of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
        const id = (_b = (_a = $("a", obj).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1]) !== null && _b !== void 0 ? _b : "";
        const title = (_c = $("a", obj).attr('title')) === null || _c === void 0 ? void 0 : _c.trim();
        let image = (_d = $("img", obj).attr("data-src")) !== null && _d !== void 0 ? _d : "";
        if (!image)
            image = (_e = $("img", obj).attr("src")) !== null && _e !== void 0 ? _e : "";
        let subtitle = (_f = $("a", $("li.list-group-item", obj)).text().trim()) !== null && _f !== void 0 ? _f : "";
        subtitle = "Chapter " + subtitle;
        if (id && title) {
            mangas.push(createMangaTile({
                id,
                image: image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
    }
    return mangas;
};
exports.parseViewMore = ($) => {
    var _a, _b, _c, _d, _e;
    const manga = [];
    for (const p of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
        const id = (_a = $("a", p).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1];
        const title = (_b = $("a", p).attr('title')) === null || _b === void 0 ? void 0 : _b.trim();
        let image = (_c = $("img", p).attr("data-src")) !== null && _c !== void 0 ? _c : "";
        if (!image)
            image = (_d = $("img", p).attr("src")) !== null && _d !== void 0 ? _d : "";
        let subtitle = (_e = $("a", $("li.list-group-item", p)).text().trim()) !== null && _e !== void 0 ? _e : "";
        subtitle = "Chapter " + subtitle;
        if (!id || !title)
            continue;
        manga.push(createMangaTile({
            id,
            image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    return manga;
};
exports.parseTags = ($) => {
    var _a, _b;
    const arrayTags = [];
    for (const tag of $("div.col-6.col-md-4.py-2", "div.card-body").toArray()) {
        const label = $("a", tag).text().trim();
        const id = (_b = (_a = $("a", tag).attr('href')) === null || _a === void 0 ? void 0 : _a.split("genre/")[1]) !== null && _b !== void 0 ? _b : "";
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    return tagSections;
};
exports.isLastPage = ($) => {
    let isLast = false;
    const pages = [];
    for (const page of $("li.page-item").toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p))
            continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($("li.page-item.active").text().trim());
    if (currentPage >= lastPage)
        isLast = true;
    return isLast;
};
const parseDate = (date) => {
    var _a;
    date = date.toUpperCase();
    let time;
    let number = Number(((_a = /\d*/.exec(date)) !== null && _a !== void 0 ? _a : [])[0]);
    if (date.includes("LESS THAN AN HOUR") || date.includes("JUST NOW")) {
        time = new Date(Date.now());
    }
    else if (date.includes("YEAR") || date.includes("YEARS")) {
        time = new Date(Date.now() - (number * 31556952000));
    }
    else if (date.includes("MONTH") || date.includes("MONTHS")) {
        time = new Date(Date.now() - (number * 2592000000));
    }
    else if (date.includes("WEEK") || date.includes("WEEKS")) {
        time = new Date(Date.now() - (number * 604800000));
    }
    else if (date.includes("YESTERDAY")) {
        time = new Date(Date.now() - 86400000);
    }
    else if (date.includes("DAY") || date.includes("DAYS")) {
        time = new Date(Date.now() - (number * 86400000));
    }
    else if (date.includes("HOUR") || date.includes("HOURS")) {
        time = new Date(Date.now() - (number * 3600000));
    }
    else if (date.includes("MINUTE") || date.includes("MINUTES")) {
        time = new Date(Date.now() - (number * 60000));
    }
    else if (date.includes("SECOND") || date.includes("SECONDS")) {
        time = new Date(Date.now() - (number * 1000));
    }
    else {
        time = new Date(date);
    }
    return time;
};
const decodeHTMLEntity = (str) => {
    return str.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
};

},{"paperback-extensions-common":4}]},{},[26])(26)
});
