(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
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
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    getTags() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return (_a = this.getSearchTags) === null || _a === void 0 ? void 0 : _a.call(this);
        });
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
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
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],4:[function(require,module,exports){
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
__exportStar(require("./Tracker"), exports);

},{"./Source":2,"./Tracker":3}],5:[function(require,module,exports){
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

},{"./APIWrapper":1,"./base":4,"./models":47}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],7:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],8:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],9:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],10:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],11:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],12:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],13:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],14:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],15:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],16:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],17:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],18:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],19:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],20:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],21:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],22:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],23:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],24:[function(require,module,exports){
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
__exportStar(require("./Button"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./Header"), exports);
__exportStar(require("./InputField"), exports);
__exportStar(require("./Label"), exports);
__exportStar(require("./Link"), exports);
__exportStar(require("./MultilineLabel"), exports);
__exportStar(require("./NavigationButton"), exports);
__exportStar(require("./OAuthButton"), exports);
__exportStar(require("./Section"), exports);
__exportStar(require("./Select"), exports);
__exportStar(require("./Switch"), exports);
__exportStar(require("./WebViewButton"), exports);
__exportStar(require("./FormRow"), exports);
__exportStar(require("./Stepper"), exports);

},{"./Button":9,"./Form":10,"./FormRow":11,"./Header":12,"./InputField":13,"./Label":14,"./Link":15,"./MultilineLabel":16,"./NavigationButton":17,"./OAuthButton":18,"./Section":19,"./Select":20,"./Stepper":21,"./Switch":22,"./WebViewButton":23}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
    MangaStatus[MangaStatus["UNKNOWN"] = 2] = "UNKNOWN";
    MangaStatus[MangaStatus["ABANDONED"] = 3] = "ABANDONED";
    MangaStatus[MangaStatus["HIATUS"] = 4] = "HIATUS";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],28:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],29:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],30:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],31:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],32:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],33:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],34:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],35:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],36:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],37:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = void 0;
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],40:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],41:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],44:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],45:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],46:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],47:[function(require,module,exports){
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
__exportStar(require("./SourceStateManager"), exports);
__exportStar(require("./RequestInterceptor"), exports);
__exportStar(require("./DynamicUI"), exports);
__exportStar(require("./TrackedManga"), exports);
__exportStar(require("./SourceManga"), exports);
__exportStar(require("./TrackedMangaChapterReadAction"), exports);
__exportStar(require("./TrackerActionQueue"), exports);
__exportStar(require("./SearchField"), exports);
__exportStar(require("./RawData"), exports);

},{"./Chapter":6,"./ChapterDetails":7,"./Constants":8,"./DynamicUI":24,"./HomeSection":25,"./Languages":26,"./Manga":27,"./MangaTile":28,"./MangaUpdate":29,"./PagedResults":30,"./RawData":31,"./RequestHeaders":32,"./RequestInterceptor":33,"./RequestManager":34,"./RequestObject":35,"./ResponseObject":36,"./SearchField":37,"./SearchRequest":38,"./SourceInfo":39,"./SourceManga":40,"./SourceStateManager":41,"./SourceTag":42,"./TagSection":43,"./TrackedManga":44,"./TrackedMangaChapterReadAction":45,"./TrackerActionQueue":46}],48:[function(require,module,exports){
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
exports.MangaHere = exports.MangaHereInfo = void 0;
/* eslint-disable linebreak-style */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaHereParser_1 = require("./MangaHereParser");
const MangaHereHelper_1 = require("./MangaHereHelper");
const MH_DOMAIN = 'https://www.mangahere.cc';
const MH_DOMAIN_MOBILE = 'http://m.mangahere.cc';
const headers = {
    'content-type': 'application/x-www-form-urlencoded'
};
exports.MangaHereInfo = {
    version: '2.0.2',
    name: 'MangaHere',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaHere.',
    contentRating: paperback_extensions_common_1.ContentRating.MATURE,
    websiteBaseURL: MH_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaHere extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.cookies = [createCookie({ name: 'isAdult', value: '1', domain: 'www.mangahere.cc' })];
        this.requestManager = createRequestManager({
            requestsPerSecond: 5,
            requestTimeout: 20000,
        });
    }
    getMangaShareUrl(mangaId) { return `${MH_DOMAIN}/manga/${mangaId}`; }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/manga/`,
                method: 'GET',
                param: mangaId,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangaHereParser_1.parseMangaDetails($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/manga/`,
                method: 'GET',
                param: mangaId,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangaHereParser_1.parseChapters($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN_MOBILE}/roll_manga/${mangaId}/${chapterId}`,
                method: 'GET',
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangaHereParser_1.parseChapterDetails($, mangaId, chapterId);
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
                    url: `${MH_DOMAIN}/latest/${page++}`,
                    method: 'GET',
                    cookies: this.cookies
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = MangaHereParser_1.parseUpdatedManga($, time, ids);
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
            const request = createRequestObject({
                url: MH_DOMAIN,
                method: 'GET',
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            MangaHereParser_1.parseHomeSections($, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case 'hot_release':
                    param = '/hot/';
                    break;
                case 'new_manga':
                    param = `/directory/${page}.htm?news`;
                    break;
                case 'latest_updates':
                    param = `/latest/${page}`;
                    break;
                default:
                    throw new Error(`Invalid homeSectionId | ${homepageSectionId}`);
            }
            const request = createRequestObject({
                url: `${MH_DOMAIN}/`,
                method: 'GET',
                param,
                cookies: this.cookies
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = MangaHereParser_1.parseViewMore($, homepageSectionId);
            metadata = !MangaHereParser_1.isLastPage($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    getSearchResults(query, metadata) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            const url = new MangaHereHelper_1.URLBuilder(MH_DOMAIN)
                .addPathComponent('search')
                .addQueryParameter('page', page)
                .addQueryParameter('title', encodeURI((query === null || query === void 0 ? void 0 : query.title) || ''))
                .addQueryParameter('genres', (_b = query.includedTags) === null || _b === void 0 ? void 0 : _b.map((x) => x.id).join('%2C'))
                .buildUrl();
            const request = createRequestObject({
                url: url,
                method: 'GET',
                headers,
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = MangaHereParser_1.parseSearch($);
            metadata = !MangaHereParser_1.isLastPage($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/search?`,
                method: 'GET',
                cookies: this.cookies,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangaHereParser_1.parseTags($);
        });
    }
}
exports.MangaHere = MangaHere;

},{"./MangaHereHelper":49,"./MangaHereParser":50,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
/* eslint-disable linebreak-style */
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLBuilder = void 0;
class URLBuilder {
    constructor(baseUrl) {
        this.parameters = {};
        this.pathComponents = [];
        this.baseUrl = baseUrl.replace(/(^\/)?(?=.*)(\/$)?/gim, '');
    }
    addPathComponent(component) {
        this.pathComponents.push(component.replace(/(^\/)?(?=.*)(\/$)?/gim, ''));
        return this;
    }
    addQueryParameter(key, value) {
        this.parameters[key] = value;
        return this;
    }
    buildUrl({ addTrailingSlash, includeUndefinedParameters } = { addTrailingSlash: false, includeUndefinedParameters: false }) {
        let finalUrl = this.baseUrl + '/';
        finalUrl += this.pathComponents.join('/');
        finalUrl += addTrailingSlash ? '/' : '';
        finalUrl += Object.values(this.parameters).length > 0 ? '?' : '';
        finalUrl += Object.entries(this.parameters).map(entry => {
            //if (!entry[1] && !includeUndefinedParameters) { return undefined }
            if (Array.isArray(entry[1])) {
                return entry[1].map(value => value || includeUndefinedParameters ? `${entry[0]}[]=${value}` : undefined)
                    .filter(x => x !== undefined)
                    .join('&');
            }
            if (typeof entry[1] === 'object') {
                return Object.keys(entry[1]).map(key => entry[1][key] || includeUndefinedParameters ? `${entry[0]}[${key}]=${entry[1][key]}` : undefined)
                    .filter(x => x !== undefined)
                    .join('&');
            }
            return `${entry[0]}=${entry[1]}`;
        }).filter(x => x !== undefined).join('&');
        return finalUrl;
    }
}
exports.URLBuilder = URLBuilder;

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseTags = exports.parseViewMore = exports.parseSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable linebreak-style */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c;
    const section = $('.detail-info');
    const title = $('span.detail-info-right-title-font', section).text().trim();
    const rating = $('span.item-score', section).text().trim().replace(',', '.');
    const author = $('p.detail-info-right-say a', section).text().trim();
    const image = (_a = $('.detail-info-cover-img', $('.detail-info-cover')).attr('src')) !== null && _a !== void 0 ? _a : '';
    const description = $('p.fullcontent').text().trim();
    let hentai = false;
    const arrayTags = [];
    for (const tag of $('a', '.detail-info-right-tag-list').toArray()) {
        const id = (_c = (_b = $(tag).attr('href')) === null || _b === void 0 ? void 0 : _b.split('/directory/')[1]) === null || _c === void 0 ? void 0 : _c.replace(/\//g, '');
        const label = $(tag).text().trim();
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase()))
            hentai = true;
        if (!id || !label)
            continue;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $('.detail-info-right-title-tip', section).text().trim();
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
        titles: [title],
        image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
        rating: Number(rating),
        status: status,
        author: author,
        tags: tagSections,
        desc: description,
        hentai: hentai
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($, mangaId) => {
    var _a, _b, _c;
    const chapters = [];
    for (const chapter of $('div#chapterlist ul li').children('a').toArray()) {
        const title = (_a = $('p.title3', chapter).html()) !== null && _a !== void 0 ? _a : '';
        const date = parseDate((_b = $('p.title2', chapter).html()) !== null && _b !== void 0 ? _b : '');
        const chapterIdRaw = (_c = $(chapter).attr('href')) === null || _c === void 0 ? void 0 : _c.trim();
        const chapterIdRegex = chapterIdRaw === null || chapterIdRaw === void 0 ? void 0 : chapterIdRaw.match(/\/manga\/[a-zA-Z0-9_]*\/(.*)\//);
        let chapterId = null;
        if (chapterIdRegex && chapterIdRegex[1])
            chapterId = chapterIdRegex[1];
        if (!chapterId)
            continue;
        const chapRegex = chapterId === null || chapterId === void 0 ? void 0 : chapterId.match(/c([0-9.]+)/);
        let chapNum = 0;
        if (chapRegex && chapRegex[1])
            chapNum = Number(chapRegex[1]);
        const volRegex = chapterId === null || chapterId === void 0 ? void 0 : chapterId.match(/v([0-9.]+)/);
        let volNum = 0;
        if (volRegex && volRegex[1])
            volNum = Number(volRegex[1]);
        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: title,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            volume: isNaN(volNum) ? 0 : volNum,
            time: date,
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    const pages = [];
    if ($('div#viewer').length == 0)
        pages.push('https://i.imgur.com/8WoVeWv.png'); //Fallback in case the manga is licensed
    for (const page of $('div#viewer').children('img').toArray()) {
        let url = page.attribs['data-original'];
        if (!url)
            continue;
        if (url === null || url === void 0 ? void 0 : url.startsWith('//'))
            url = 'https:' + url;
        pages.push(url);
    }
    const chapterDetails = createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: false
    });
    return chapterDetails;
};
exports.parseChapterDetails = parseChapterDetails;
const parseUpdatedManga = ($, time, ids) => {
    var _a, _b;
    let loadMore = true;
    const updatedManga = [];
    for (const manga of $('li', 'div.manga-list-4 ').toArray()) {
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/')[1]) === null || _b === void 0 ? void 0 : _b.replace(/\//g, '');
        if (!id)
            continue;
        const date = $('.manga-list-4-item-subtitle > span', $(manga)).text().trim();
        const mangaDate = parseDate(date);
        if (!mangaDate || !id)
            continue;
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
        loadMore,
    };
};
exports.parseUpdatedManga = parseUpdatedManga;
const parseHomeSections = ($, sectionCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const sections = [
        {
            sectionID: createHomeSection({ id: 'hot_release', title: 'Hot Manga Releases', view_more: true }),
            selector: $('div.manga-list-1').get(0)
        },
        {
            sectionID: createHomeSection({ id: 'being_read', title: 'Being Read Right Now' }),
            selector: $('div.manga-list-1').get(1)
        },
        {
            sectionID: createHomeSection({ id: 'recommended', title: 'Recommended' }),
            selector: $('div.manga-list-3')
        },
        {
            sectionID: createHomeSection({ id: 'new_manga', title: 'New Manga Releases', view_more: true }),
            selector: $('div.manga-list-1').get(2)
        }
    ];
    //Hot Release Manga
    //New Manga
    //Being Read Manga
    const collectedIds = [];
    for (const section of sections) {
        const mangaArray = [];
        for (const manga of $('li', section.selector).toArray()) {
            const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/')[1]) === null || _b === void 0 ? void 0 : _b.replace(/\//g, '');
            const image = (_c = $('img', manga).first().attr('src')) !== null && _c !== void 0 ? _c : '';
            const title = (_e = (_d = $('img', manga).first().attr('alt')) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : '';
            const subtitle = $('div.manga-list-1-item-subtitle', manga).text().trim();
            if (!id || !title || !image)
                continue;
            if (collectedIds.includes(id))
                continue;
            mangaArray.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
        section.sectionID.items = mangaArray;
        sectionCallback(section.sectionID);
    }
    //Latest Manga
    const latestSection = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
    const latestManga = [];
    for (const manga of $('li', 'div.manga-list-4 ').toArray()) {
        const id = (_g = (_f = $('a', manga).attr('href')) === null || _f === void 0 ? void 0 : _f.split('/manga/')[1]) === null || _g === void 0 ? void 0 : _g.replace(/\//g, '');
        const image = (_h = $('img', manga).first().attr('src')) !== null && _h !== void 0 ? _h : '';
        const title = (_k = (_j = $('a', manga).attr('title')) === null || _j === void 0 ? void 0 : _j.trim()) !== null && _k !== void 0 ? _k : '';
        const subtitle = $('ul.manga-list-4-item-part > li', manga).first().text().trim();
        if (!id || !title || !image)
            continue;
        if (collectedIds.includes(id))
            continue;
        latestManga.push(createMangaTile({
            id: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    latestSection.items = latestManga;
    sectionCallback(latestSection);
};
exports.parseHomeSections = parseHomeSections;
const parseSearch = ($) => {
    var _a, _b, _c, _d, _e;
    const mangaItems = [];
    const collectedIds = [];
    for (const manga of $('ul.manga-list-4-list > li').toArray()) {
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/')[1]) === null || _b === void 0 ? void 0 : _b.replace(/\//g, '');
        const image = (_c = $('img', manga).first().attr('src')) !== null && _c !== void 0 ? _c : '';
        const title = (_e = (_d = $('a', manga).attr('title')) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : '';
        const subtitle = $('a', $('p.manga-list-4-item-tip', manga).get(1)).text();
        if (!id || !title || !image)
            continue;
        if (collectedIds.includes(id))
            continue;
        mangaItems.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
        collectedIds.push(id);
    }
    return mangaItems;
};
exports.parseSearch = parseSearch;
const parseViewMore = ($, homepageSectionId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const mangaItems = [];
    const collectedIds = [];
    if (homepageSectionId === 'latest_updates') {
        for (const manga of $('ul.manga-list-4-list > li').toArray()) {
            const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/')[1]) === null || _b === void 0 ? void 0 : _b.replace(/\//g, '');
            const image = (_c = $('img', manga).first().attr('src')) !== null && _c !== void 0 ? _c : '';
            const title = (_e = (_d = $('a', manga).attr('title')) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : '';
            const subtitle = $('ul.manga-list-4-item-part > li', manga).first().text().trim();
            if (!id || !title || !image)
                continue;
            if (collectedIds.includes(id))
                continue;
            mangaItems.push(createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }));
            collectedIds.push(id);
        }
        return mangaItems;
    }
    for (const manga of $('li', $.html()).toArray()) {
        const id = (_g = (_f = $('a', manga).attr('href')) === null || _f === void 0 ? void 0 : _f.split('/manga/')[1]) === null || _g === void 0 ? void 0 : _g.replace(/\//g, '');
        const image = (_h = $('img', manga).first().attr('src')) !== null && _h !== void 0 ? _h : '';
        const title = (_k = (_j = $('img', manga).first().attr('alt')) === null || _j === void 0 ? void 0 : _j.trim()) !== null && _k !== void 0 ? _k : '';
        const subtitle = $('p.manga-list-1-item-subtitle', manga).text().trim();
        if (!id || !title || !image)
            continue;
        if (collectedIds.includes(id))
            continue;
        mangaItems.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
        collectedIds.push(id);
    }
    return mangaItems;
};
exports.parseViewMore = parseViewMore;
const parseTags = ($) => {
    var _a;
    const arrayTags = [];
    for (const tag of $('div.tag-box > a').toArray()) {
        const label = $(tag).text().trim();
        const id = (_a = $(tag).attr('data-val')) !== null && _a !== void 0 ? _a : '';
        if (!id || !label)
            continue;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    return tagSections;
};
exports.parseTags = parseTags;
const parseDate = (date) => {
    var _a;
    date = date.toUpperCase();
    let time;
    const number = Number(((_a = /\d*/.exec(date)) !== null && _a !== void 0 ? _a : [])[0]);
    if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
        time = new Date(Date.now());
    }
    else if (date.includes('YEAR') || date.includes('YEARS')) {
        time = new Date(Date.now() - (number * 31556952000));
    }
    else if (date.includes('MONTH') || date.includes('MONTHS')) {
        time = new Date(Date.now() - (number * 2592000000));
    }
    else if (date.includes('WEEK') || date.includes('WEEKS')) {
        time = new Date(Date.now() - (number * 604800000));
    }
    else if (date.includes('YESTERDAY')) {
        time = new Date(Date.now() - 86400000);
    }
    else if (date.includes('DAY') || date.includes('DAYS')) {
        time = new Date(Date.now() - (number * 86400000));
    }
    else if (date.includes('HOUR') || date.includes('HOURS')) {
        time = new Date(Date.now() - (number * 3600000));
    }
    else if (date.includes('MINUTE') || date.includes('MINUTES')) {
        time = new Date(Date.now() - (number * 60000));
    }
    else if (date.includes('SECOND') || date.includes('SECONDS')) {
        time = new Date(Date.now() - (number * 1000));
    }
    else {
        time = new Date(date);
    }
    return time;
};
const isLastPage = ($) => {
    let isLast = true;
    const pages = [];
    for (const page of $('a', '.pager-list-left').toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p))
            continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($('a.active', '.pager-list-left').text().trim());
    if (currentPage <= lastPage)
        isLast = false;
    return isLast;
};
exports.isLastPage = isLastPage;

},{"paperback-extensions-common":5}]},{},[48])(48)
});
