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
exports.Webtoons = exports.WebtoonsInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const WebtoonsParser_1 = require("./WebtoonsParser");
const WEBTOON_DOMAIN = "https://www.webtoons.com";
exports.WebtoonsInfo = {
    version: "1.0.0",
    name: "WebToons",
    icon: "logo.png",
    author: "VibrantClouds",
    authorWebsite: "https://github.com/conradweiser",
    description: "Webtoons",
    hentaiSource: false,
    websiteBaseURL: WEBTOON_DOMAIN,
    sourceTags: [
        {
            text: "Slow",
            type: paperback_extensions_common_1.TagType.YELLOW
        }
    ]
};
/**
 * Note that MangaIDs here are encoded as to avoid holding special characters.
 * A Origional title will merely be a string of numbers. However a challenge title (a canvas in search results)
 * will be encoded as c<value> - Such as c12345
 * Make sure that this challenge value is parsed before using any IDs, as the URL formatting differs depending on the manga class
 */
class Webtoons extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 5
        });
    }
    /**
     * This sources requires itself as a referer for images to resolve correctly
     */
    globalRequestHeaders() {
        return {
            referer: WEBTOON_DOMAIN,
        };
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mangaId.startsWith("c")) {
                // This is a challenge title
                const request = createRequestObject({
                    url: `${WEBTOON_DOMAIN}/challenge/episodeList?titleNo=${mangaId.substr(1, mangaId.length)}`,
                    method: "GET",
                    headers: {
                        referer: WEBTOON_DOMAIN,
                    },
                });
                const data = yield this.requestManager.schedule(request, 1); //TODO: What if this isn't a 200 code
                const $ = this.cheerio.load(data.data);
                return yield WebtoonsParser_1.parseMangaDetailsChallenge($, mangaId);
            }
            else {
                // This is an origional title
                const request = createRequestObject({
                    url: `${WEBTOON_DOMAIN}/episodeList?titleNo=${mangaId}`,
                    method: "GET",
                });
                const data = yield this.requestManager.schedule(request, 1);
                if (data.status != 200) {
                    throw new Error(`Returned a nonstandard HTTP code: ${data.status}`);
                }
                const $ = this.cheerio.load(data.data);
                return yield WebtoonsParser_1.parseMangaDetailsOrig($, mangaId);
            }
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mangaId.startsWith("c")) {
                const request = createRequestObject({
                    url: `${WEBTOON_DOMAIN}/en/challenge/reeeee/list?title_no=${mangaId.substr(1, mangaId.length)}`,
                    method: "GET",
                    headers: {
                        referer: WEBTOON_DOMAIN,
                    },
                });
                let data = yield this.requestManager.schedule(request, 1);
                if (data.status != 200 && data.status >= 400) {
                    throw new Error(`Failed to get chapters for Webtoons using mangaId ${mangaId}`);
                }
                let $ = this.cheerio.load(data.data);
                const parseResults = WebtoonsParser_1.parseGetChaptersChallenge($, mangaId);
                // If there are more pages that need to be scanned, concat them together
                let hasNextPage = parseResults.hasNextPage;
                while (hasNextPage) {
                    const newRequest = createRequestObject({
                        url: `${WEBTOON_DOMAIN}/en/challenge/${parseResults.pagnationId}/list?title_no=${mangaId.substr(1, mangaId.length)}&page=${hasNextPage}`,
                        method: "GET",
                        headers: {
                            referer: WEBTOON_DOMAIN,
                        },
                    });
                    data = yield this.requestManager.schedule(newRequest, 1);
                    $ = this.cheerio.load(data.data);
                    const appendResults = WebtoonsParser_1.parseGetChaptersChallenge($, mangaId);
                    hasNextPage = appendResults.hasNextPage;
                    parseResults.chapters = parseResults.chapters.concat(appendResults.chapters);
                }
                // We've collected all of the pages, reverse the chapter list so that we're going from 1 to current properly, and return!
                return parseResults.chapters.reverse();
            }
            else {
                const request = createRequestObject({
                    url: `${WEBTOON_DOMAIN}/en/aaahh/reeeee/list?title_no=${mangaId}`,
                    method: "GET",
                    headers: {
                        referer: WEBTOON_DOMAIN,
                    },
                });
                let data = yield this.requestManager.schedule(request, 1);
                let $ = this.cheerio.load(data.data);
                const parseResults = WebtoonsParser_1.parseGetChaptersOrig($, mangaId);
                // If there are more pages that need to be scanned, concat them together
                let hasNextPage = parseResults.hasNextPage;
                while (hasNextPage) {
                    const newRequest = createRequestObject({
                        url: `${WEBTOON_DOMAIN}/en/${parseResults.titleId}/${parseResults.pagnationId}/list?title_no=${mangaId}&page=${hasNextPage}`,
                        method: "GET",
                        headers: {
                            referer: WEBTOON_DOMAIN,
                        },
                    });
                    data = yield this.requestManager.schedule(newRequest, 1);
                    $ = this.cheerio.load(data.data);
                    const appendResults = WebtoonsParser_1.parseGetChaptersOrig($, mangaId);
                    hasNextPage = appendResults.hasNextPage;
                    parseResults.chapters = parseResults.chapters.concat(appendResults.chapters);
                }
                // We've collected all of the pages, reverse the chapter list so that we're going from 1 to current properly, and return!
                return parseResults.chapters.reverse();
            }
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mangaId.startsWith('c')) {
                // Challenge parsing
                const request = createRequestObject({
                    url: `${WEBTOON_DOMAIN}/en/challenge/ree/someChapter/viewer?title_no=${mangaId.substr(1, mangaId.length)}&episode_no=${chapterId}&webtoonType=CHALLENGE`,
                    method: 'GET',
                    headers: {
                        referer: WEBTOON_DOMAIN
                    }
                });
                const data = yield this.requestManager.schedule(request, 1);
                if (data.status != 200 && data.status >= 400) {
                    throw new Error(`Failed to get challenge chapter details for title: ${mangaId} for chapter ${chapterId}`);
                }
                const $ = this.cheerio.load(data.data);
                return WebtoonsParser_1.parseChapterDetailsChallenge($, mangaId, chapterId);
            }
            else {
                // Orig parsing
                const request = createRequestObject({
                    url: `${WEBTOON_DOMAIN}/en/fantasy/ree/someChapter/viewer?title_no=${mangaId}&episode_no=${chapterId}`,
                    method: 'GET',
                    headers: {
                        referer: WEBTOON_DOMAIN
                    }
                });
                const data = yield this.requestManager.schedule(request, 1);
                if (data.status != 200 && data.status >= 400) {
                    throw new Error(`Failed to get orig chapter details for title: ${mangaId} for chapter ${chapterId}`);
                }
                const $ = this.cheerio.load(data.data);
                return WebtoonsParser_1.parseChapterDetailsOrig($, mangaId, chapterId);
            }
        });
    }
    searchRequest(query, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${WEBTOON_DOMAIN}/en/search?keyword=${query.title}`,
                method: "GET",
                headers: {
                    referer: WEBTOON_DOMAIN,
                },
            });
            const data = yield this.requestManager.schedule(request, 1);
            if (data.status != 200 && data.status >= 400) {
                throw new Error(`Returned a nonstandard HTTP code: ${data.status}`);
            }
            const $ = this.cheerio.load(data.data);
            //TODO: Support paged results
            const results = yield WebtoonsParser_1.parseSearchResults($);
            return results;
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const rollingUpdates = createHomeSection({ id: 'rolling_updates', title: 'Hot Webcomics', view_more: true });
            const completedSeries = createHomeSection({ id: 'completed_series', title: `Completed Series`, view_more: true });
            sectionCallback(rollingUpdates);
            sectionCallback(completedSeries);
            const request = createRequestObject({
                url: `${WEBTOON_DOMAIN}/en/dailySchedule`,
                method: `GET`
            });
            const data = yield this.requestManager.schedule(request, 1);
            if (data.status != 200) {
                throw new Error(`Failed to retrieve homepage information`);
            }
            const $ = this.cheerio.load(data.data);
            WebtoonsParser_1.parseHomeSections($, [rollingUpdates, completedSeries], sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            // We don't care about metadata for this source, fortunately
            //TODO: Add support for a view-more for canvas titles later
            switch (homepageSectionId) {
                case "rolling_updates": {
                    const request = createRequestObject({
                        url: `${WEBTOON_DOMAIN}/en/dailySchedule`,
                        method: `GET`
                    });
                    const data = yield this.requestManager.schedule(request, 1);
                    if (data.status != 200 && data.status >= 400) {
                        throw new Error(`Failed to getViewMoreItems for section ${homepageSectionId}`);
                    }
                    const $ = this.cheerio.load(data.data);
                    return WebtoonsParser_1.parseRollingViewMoreTitles($);
                }
                case "completed_series": {
                    const request = createRequestObject({
                        url: `${WEBTOON_DOMAIN}/en/dailySchedule`,
                        method: `GET`
                    });
                    const data = yield this.requestManager.schedule(request, 1);
                    if (data.status != 200 && data.status >= 400) {
                        throw new Error(`Failed to getViewMoreItems for section ${homepageSectionId}`);
                    }
                    const $ = this.cheerio.load(data.data);
                    return WebtoonsParser_1.parseCompletedViewMoreTitles($);
                }
                default: return null;
            }
        });
    }
}
exports.Webtoons = Webtoons;

},{"./WebtoonsParser":27,"paperback-extensions-common":4}],27:[function(require,module,exports){
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
exports.parseHomeSections = exports.parseCompletedViewMoreTitles = exports.parseRollingViewMoreTitles = exports.parseSearchResults = exports.parseChapterDetailsOrig = exports.parseChapterDetailsChallenge = exports.parseGetChaptersOrig = exports.parseGetChaptersChallenge = exports.parseMangaDetailsOrig = exports.parseMangaDetailsChallenge = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const WEBTOON_DOMAIN = 'https://www.webtoons.com';
exports.parseMangaDetailsChallenge = ($, mangaId) => __awaiter(void 0, void 0, void 0, function* () {
    const title = $('h3._challengeTitle').text().replace('DASHBOARD', '').trim();
    const image = $('img', $('span.thmb')).attr('src');
    if (!image) {
        throw new Error(`Failed to parse MangaDetails challenge image for ${mangaId}`);
    }
    let rating = $('em#_starScoreAverage').text();
    const completed = $('span.txt_ico_completed2') === undefined ? paperback_extensions_common_1.MangaStatus.ONGOING : paperback_extensions_common_1.MangaStatus.COMPLETED;
    const author = $('span.author').text().replace(/author info/, '').trim();
    const description = $('p.summary').text().trim();
    if (isNaN(Number(rating))) {
        rating = '0';
    }
    return createManga({
        id: mangaId,
        titles: [title],
        image: image,
        rating: Number(rating),
        status: completed,
        author: author,
        desc: description
    });
});
exports.parseMangaDetailsOrig = ($, mangaId) => __awaiter(void 0, void 0, void 0, function* () {
    const title = $("h1.subj").text();
    // The image is awkwardly embedded into a style, parse that out
    const imageContext = $("div.detail_body").attr("style");
    const image = imageContext === null || imageContext === void 0 ? void 0 : imageContext.match(/url\((.+)\)/);
    if (!imageContext || !image || !image[1]) {
        throw new Error(`Failed to parse MangaDetails for ${mangaId}`);
    }
    let rating = $("em#_starScoreAverage").text();
    const completed = $("span.txt_ico_completed2") === undefined ? paperback_extensions_common_1.MangaStatus.ONGOING : paperback_extensions_common_1.MangaStatus.COMPLETED;
    const author = $("a.author")
        .text()
        .replace(/author info/, "")
        .trim();
    const description = $("p.summary").text().trim();
    // If we can't parse the rating for some reason, set it to zero
    if (isNaN(Number(rating))) {
        rating = "0";
    }
    return createManga({
        id: mangaId,
        titles: [title],
        image: image[1],
        rating: Number(rating),
        status: completed,
        author: author,
        desc: description,
    });
});
/**
 * We're supposed to return a Chapter[] here, but since we might need more pages to get all of the
 * chapters, return a paged structure here
 */
exports.parseGetChaptersChallenge = ($, mangaId) => {
    var _a;
    const chapters = [];
    for (let context of $('li', $('ul#_listUl')).toArray()) {
        const id = $(context).attr('data-episode-no');
        const name = $('span', $('span.subj', $(context))).text().trim();
        const dateContext = $('span.date', $(context)).text().trim();
        if (!id || !name || !dateContext) {
            throw new Error(`Failed to get chapters for ${mangaId} - There's some kind of parsing problem. Please report this to the extension developers`);
        }
        const numericId = isNaN(Number(id)) ? 0 : Number(id);
        chapters.push(createChapter({
            mangaId: mangaId,
            chapNum: numericId,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            id: id,
            name: name,
            time: new Date(dateContext)
        }));
    }
    // Do we have another page that we need to navigate to?
    if ($('a', $('div.paginate')).last().attr('href') != '#') {
        // Yup, queue up a navigation to the next page value
        const valContext = $('span.on', $('div.paginate')).text();
        const nextPageVal = Number(valContext) + 1;
        const paginationId = (_a = $('link').last().attr('href')) === null || _a === void 0 ? void 0 : _a.match(/\/challenge\/(.+)\/list/);
        if (isNaN(nextPageVal) || !paginationId || !paginationId[1]) {
            console.log("Error retrieving the next page to scan for, results may be incomplete");
            return {
                chapters: chapters
            };
        }
        return {
            chapters: chapters,
            pagnationId: paginationId[1],
            hasNextPage: nextPageVal
        };
    }
    else {
        return {
            chapters: chapters
        };
    }
};
/**
 * We're supposed to return a Chapter[] here, but since we might need more pages to get all of the
 * chapters, return a paged structure here
 */
exports.parseGetChaptersOrig = ($, mangaId) => {
    var _a;
    const chapters = [];
    for (let context of $('li', $('ul#_listUl')).toArray()) {
        const id = $(context).attr('data-episode-no');
        const name = $('span', $('span.subj', $(context))).text().trim();
        const dateContext = $('span.date', $(context)).text().trim();
        if (!id || !name || !dateContext) {
            throw new Error(`Failed to get chapters for ${mangaId} - There's some kind of parsing problem. Please report this to the extension developers`);
        }
        const numericId = isNaN(Number(id)) ? 0 : Number(id);
        chapters.push(createChapter({
            mangaId: mangaId,
            chapNum: numericId,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            id: id,
            name: name,
            time: new Date(dateContext)
        }));
    }
    // Do we have another page that we need to navigate to?
    if ($('a', $('div.paginate')).last().attr('href') != '#') {
        // Yup, queue up a navigation to the next page value
        const valContext = $('span.on', $('div.paginate')).text();
        const nextPageVal = Number(valContext) + 1;
        const paginationIds = (_a = $('link').last().attr('href')) === null || _a === void 0 ? void 0 : _a.match(/\/en\/(.+)\/(.+)\/list/);
        if (isNaN(nextPageVal) || !paginationIds || !paginationIds[1] || !paginationIds[2]) {
            console.log("Error retrieving the next page to scan for, results may be incomplete");
            return {
                chapters: chapters
            };
        }
        return {
            chapters: chapters,
            titleId: paginationIds[1],
            pagnationId: paginationIds[2],
            hasNextPage: nextPageVal
        };
    }
    else {
        return {
            chapters: chapters
        };
    }
};
exports.parseChapterDetailsChallenge = ($, mangaId, chapterId) => {
    const pages = [];
    for (let pageContext of $('img', $('div.viewer_img')).toArray()) {
        const url = $(pageContext).attr('data-url');
        if (!url) {
            throw new Error(`Failed to parse image URL for ${mangaId}`);
        }
        pages.push(url);
    }
    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    });
};
exports.parseChapterDetailsOrig = ($, mangaId, chapterId) => {
    const pages = [];
    for (let pageContext of $('img', $('div.viewer_img')).toArray()) {
        const url = $(pageContext).attr('data-url');
        if (!url) {
            throw new Error(`Failed to parse image URL for ${mangaId}`);
        }
        pages.push(url);
    }
    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    });
};
exports.parseSearchResults = ($) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const searchResults = [];
    // Webtoons splits results into two pieces: A Origionals category, and a canvas category. Both need supported
    // Get the 'Origional' pane details
    for (let tile of $("li", $("ul.card_lst")).toArray()) {
        let id = (_a = $("a.card_item", $(tile)).attr("href")) === null || _a === void 0 ? void 0 : _a.match(/\?titleNo=(\d+)/);
        let image = $("img", $(tile)).attr("src");
        let title = createIconText({ text: $(".subj", $(tile)).text() });
        let primaryText = createIconText({ text: $("em.grade_num", $(tile)).text(), icon: "heart" }); //TODO: What is this image icon name?
        // If the ID, Image or Title is missing, do not add this as an entry
        if (!id || !id[1] || !image || !title.text) {
            console.log(`Failed to parse Orig search result tile`);
            continue;
        }
        searchResults.push(createMangaTile({
            id: id[1],
            image: image,
            title: title,
            primaryText: primaryText,
        }));
    }
    // Capture all of the canvas results
    for (let tile of $("li", $("div.challenge_lst")).toArray()) {
        let id = (_b = $("a.challenge_item", $(tile)).attr("href")) === null || _b === void 0 ? void 0 : _b.match(/\?titleNo=(\d+)/);
        let image = $("img", $(tile)).attr("src");
        let title = createIconText({ text: $(".subj", $(tile)).text() });
        if (!id || !id[1] || !image || !title.text) {
            console.log(`Failed to parse canvas search result tile`);
            continue;
        }
        searchResults.push(createMangaTile({
            id: `c${id[1]}`,
            image: image,
            title: title,
        }));
    }
    //TODO: Support ViewMore
    return createPagedResults({
        results: searchResults,
    });
});
exports.parseRollingViewMoreTitles = ($) => {
    var _a;
    const tiles = [];
    for (let context of $('li', $('div#dailyList')).toArray()) { // This is quite the broad selector, it's probably fine?
        // None of these rolling updates will ever be a challenge title, no need to encode the IDs
        const idContext = (_a = $('a', $(context)).attr('href')) === null || _a === void 0 ? void 0 : _a.match(/list\?title_no=(\d.+)/);
        const title = $('p.subj', $(context)).text().trim();
        const image = $('img', $(context)).attr('src');
        const likes = $('em.grade_num', $(context)).text();
        if (!idContext || !idContext[1] || !image || !title) {
            console.log(`Failed to parse viewMoreContent for rollingUpdates`);
            continue;
        }
        tiles.push(createMangaTile({
            id: idContext[1],
            title: createIconText({ text: title }),
            image: image,
            primaryText: createIconText({ text: likes, icon: 'heart' })
        }));
    }
    return createPagedResults({ results: tiles });
};
exports.parseCompletedViewMoreTitles = ($) => {
    var _a;
    const tiles = [];
    for (let context of $('li', $('ul.daily_card', $('div.daily_section', $('div.comp')))).toArray()) {
        // None of these rolling updates will ever be a challenge title, no need to encode the IDs
        const idContext = (_a = $('a', $(context)).attr('href')) === null || _a === void 0 ? void 0 : _a.match(/list\?title_no=(\d.+)/);
        const title = $('p.subj', $(context)).text().trim();
        const image = $('img', $(context)).attr('src');
        const likes = $('em.grade_num', $(context)).text();
        if (!idContext || !idContext[1] || !image || !title) {
            console.log(`Failed to parse content for a viewMoreContent for completed titles`);
            continue;
        }
        tiles.push(createMangaTile({
            id: idContext[1],
            title: createIconText({ text: title }),
            image: image,
            primaryText: createIconText({ text: likes, icon: 'heart' })
        }));
    }
    return createPagedResults({ results: tiles });
};
exports.parseHomeSections = ($, sections, sectionCallback) => {
    var _a, _b;
    const rollingUpdates = [];
    const completedSeries = [];
    // We're only going to grab the first title for each day by default. View more will provide the full list
    for (let scheduleContext of $('div.daily_section', $('#dailyList')).toArray()) {
        const cardContext = $('li', $('ul.daily_card', $(scheduleContext)).first()).first();
        // None of these rolling updates will ever be a challenge title, no need to encode the IDs
        const idContext = (_a = $('a', $(cardContext)).attr('href')) === null || _a === void 0 ? void 0 : _a.match(/list\?title_no=(\d.+)/);
        const title = $('p.subj', $(cardContext)).text().trim();
        const image = $('img', $(cardContext)).attr('src');
        const likes = $('em.grade_num', $(cardContext)).text();
        if (!idContext || !idContext[1] || !image || !title) {
            console.log(`Failed to parse content for a rollingUpdates title`);
            continue;
        }
        rollingUpdates.push(createMangaTile({
            id: idContext[1],
            title: createIconText({ text: title }),
            image: image,
            primaryText: createIconText({ text: likes, icon: 'heart' })
        }));
    }
    sections[0].items = rollingUpdates;
    sections[0].view_more = true;
    sectionCallback(sections[0]);
    // Only get the first 15 titles for the completed series list
    let counter = 0;
    for (let context of $('li', $('ul.daily_card', $('div.daily_section', $('div.comp')))).toArray()) {
        if (counter == 10) {
            break;
        }
        // None of these rolling updates will ever be a challenge title, no need to encode the IDs
        const idContext = (_b = $('a', $(context)).attr('href')) === null || _b === void 0 ? void 0 : _b.match(/list\?title_no=(\d.+)/);
        const title = $('p.subj', $(context)).text().trim();
        const image = $('img', $(context)).attr('src');
        const likes = $('em.grade_num', $(context)).text();
        if (!idContext || !idContext[1] || !image || !title) {
            console.log(`Failed to parse content for a rollingUpdates title`);
            continue;
        }
        completedSeries.push(createMangaTile({
            id: idContext[1],
            title: createIconText({ text: title }),
            image: image,
            primaryText: createIconText({ text: likes, icon: 'heart' })
        }));
        counter++;
    }
    sections[1].items = completedSeries;
    sections[1].view_more = true;
    sectionCallback(sections[1]);
};

},{"paperback-extensions-common":4}]},{},[26])(26)
});
