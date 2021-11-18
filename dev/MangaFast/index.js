(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
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
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
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

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

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
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./Tracker"), exports);

},{"./Source":1,"./Tracker":2}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);

},{"./base":3,"./models":46}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],6:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],7:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],8:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],9:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],10:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],11:[function(require,module,exports){
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
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],22:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],23:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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

},{"./Button":8,"./Form":9,"./FormRow":10,"./Header":11,"./InputField":12,"./Label":13,"./Link":14,"./MultilineLabel":15,"./NavigationButton":16,"./OAuthButton":17,"./Section":18,"./Select":19,"./Stepper":20,"./Switch":21,"./WebViewButton":22}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],28:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],29:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],30:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],31:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],32:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],33:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],34:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],35:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],36:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],40:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],43:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],44:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],45:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],46:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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

},{"./Chapter":5,"./ChapterDetails":6,"./Constants":7,"./DynamicUI":23,"./HomeSection":24,"./Languages":25,"./Manga":26,"./MangaTile":27,"./MangaUpdate":28,"./PagedResults":29,"./RawData":30,"./RequestHeaders":31,"./RequestInterceptor":32,"./RequestManager":33,"./RequestObject":34,"./ResponseObject":35,"./SearchField":36,"./SearchRequest":37,"./SourceInfo":38,"./SourceManga":39,"./SourceStateManager":40,"./SourceTag":41,"./TagSection":42,"./TrackedManga":43,"./TrackedMangaChapterReadAction":44,"./TrackerActionQueue":45}],47:[function(require,module,exports){
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
exports.MangaFast = exports.MangaFastInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaFastParser_1 = require("./MangaFastParser");
const MF_DOMAIN = 'https://mangafast.net';
const method = 'GET';
exports.MangaFastInfo = {
    version: '1.0.8',
    name: 'MangaFast',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaFast.',
    hentaiSource: false,
    websiteBaseURL: MF_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaFast extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 15000,
        });
    }
    getMangaShareUrl(mangaId) { return `${MF_DOMAIN}/read/${mangaId}`; }
    ;
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/read/${mangaId}/`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseMangaDetails)($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/read/${mangaId}/`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseChapters)($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/${chapterId}`,
                method: method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseChapterDetails)($, mangaId, chapterId);
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedManga = {
                ids: [],
            };
            const params = [
                "latest-update",
                "latest-manhua"
            ];
            for (const param of params) {
                const request = createRequestObject({
                    url: `${MF_DOMAIN}/home/`,
                    method,
                    param: param
                });
                const response = yield this.requestManager.schedule(request, 1);
                const $ = this.cheerio.load(response.data);
                updatedManga = (0, MangaFastParser_1.parseUpdatedManga)($, time, ids);
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
            const sections = [
                //New Manga
                {
                    request: createRequestObject({
                        url: `${MF_DOMAIN}/home/`,
                        method,
                        param: "new-manga"
                    }),
                    section: createHomeSection({
                        id: "new_manga",
                        title: "New Manga",
                        view_more: false,
                    }),
                },
                //Popular Manga
                {
                    request: createRequestObject({
                        url: `${MF_DOMAIN}/home/`,
                        method,
                        param: "popular-type"
                    }),
                    section: createHomeSection({
                        id: "popular_manga",
                        title: "Popular Manga",
                        view_more: false,
                    }),
                },
                //Latest Manga Update 
                {
                    request: createRequestObject({
                        url: `${MF_DOMAIN}/home/`,
                        method,
                        param: "latest-update"
                    }),
                    section: createHomeSection({
                        id: "latest_manga_update",
                        title: "Latest Manga Update",
                        view_more: false,
                    }),
                },
                //Latest Manhua Update 
                {
                    request: createRequestObject({
                        url: `${MF_DOMAIN}/home/`,
                        method,
                        param: "latest-manhua"
                    }),
                    section: createHomeSection({
                        id: "latest_manhua_update",
                        title: "Latest Manhua Update",
                        view_more: false,
                    }),
                },
            ];
            const promises = [];
            for (const section of sections) {
                sectionCallback(section.section);
                promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                    const $ = this.cheerio.load(response.data);
                    const tiles = (0, MangaFastParser_1.parseHomeSections)($, section.section);
                    section.section.items = tiles;
                    sectionCallback(section.section);
                }));
            }
            yield Promise.all(promises);
        });
    }
    searchRequest(query, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 0;
            const search = (0, MangaFastParser_1.generateSearch)(query);
            const request = createRequestObject({
                url: `https://search.mangafast.net/comics/ms`,
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "mangafast": "mangafast"
                },
                data: JSON.stringify({
                    "q": search,
                    "limit": 50,
                    "offset": page
                })
            });
            let response = yield this.requestManager.schedule(request, 1);
            response = typeof (response.data) === "string" ? JSON.parse(response.data) : response.data;
            const data = Object(response);
            const mangas = [];
            const collectedIds = [];
            for (const manga of data.hits) {
                if (!(manga === null || manga === void 0 ? void 0 : manga.slug) || !(manga === null || manga === void 0 ? void 0 : manga.title))
                    continue;
                if (collectedIds.includes(manga.slug))
                    continue;
                mangas.push(createMangaTile({
                    id: manga.slug,
                    image: (manga === null || manga === void 0 ? void 0 : manga.thumbnail) ? manga.thumbnail : "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: manga.title }),
                }));
            }
            metadata = { page: page + 50 };
            return createPagedResults({
                results: mangas,
                metadata
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MF_DOMAIN}/genre/action/`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return (0, MangaFastParser_1.parseTags)($);
        });
    }
}
exports.MangaFast = MangaFast;

},{"./MangaFastParser":48,"paperback-extensions-common":4}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTags = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MF_DOMAIN = 'https://mangafast.net';
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c, _d;
    const titles = [];
    titles.push($("td:contains(Comic Title)").next().text().trim()); //Main English title
    const author = $("td:contains(Author)").next().text().trim();
    const image = (_a = $("img.shadow", "div.text-center.ims").attr('src')) !== null && _a !== void 0 ? _a : "";
    const description = $("p.desc").text().trim();
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("a", $("td:contains(Genre)").next()).toArray()) {
        const label = $(tag).text().trim();
        const id = encodeURI((_d = (_c = (_b = $(tag).attr("href")) === null || _b === void 0 ? void 0 : _b.replace("/genre/", "")) === null || _c === void 0 ? void 0 : _c.replace(/\/$/, "")) !== null && _d !== void 0 ? _d : "");
        if (!id || !label)
            continue;
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $("td:contains(Status)").next().text().trim();
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
        image: image ? image : "https://i.imgur.com/GYUxEX8.png",
        rating: 0,
        status: status,
        author: author,
        tags: tagSections,
        desc: description,
        //hentai: hentai
        hentai: false //MangaDex down
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($, mangaId) => {
    var _a;
    const chapters = [];
    for (const chapter of $("a", "div.chapter-link-w").toArray()) {
        const title = $("span.left", chapter).text().trim();
        const id = (_a = $(chapter).attr('href')) === null || _a === void 0 ? void 0 : _a.split("/").pop();
        if ($("span.left > i", chapter).text().trim().toLowerCase().includes("spoiler"))
            continue; //Latest chaper is usually an empty spoiler page.
        const date = new Date($("span.right", chapter).text().trim());
        const chapRegex = title.match(/(\d+\.?\_?\d?)/);
        let chapterNumber = 0;
        if (chapRegex && chapRegex[1])
            chapterNumber = Number(chapRegex[1].replace(/\\/g, "."));
        if (!id)
            continue;
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
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    var _a, _b;
    const pages = [];
    for (const p of $("img", "div.content-comic").toArray()) {
        let image = (_a = $(p).attr("src")) !== null && _a !== void 0 ? _a : "";
        if (!image)
            image = (_b = $(p).attr("data-src")) !== null && _b !== void 0 ? _b : "";
        if (image.includes("adsense"))
            continue;
        if (!image)
            throw new Error(`Unable to parse image(s) from chapterID: ${chapterId}`);
        pages.push(image);
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
//No real place to the updates besides the 12 tiles on the homescreen.
const parseUpdatedManga = ($, time, ids) => {
    var _a;
    const updatedManga = [];
    for (const manga of $("div.ls4.last-updates-content", "div.ls4w").toArray()) {
        const id = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split("/").pop();
        const dateSection = $("span.ls4s", manga).text().trim();
        const dateRegex = dateSection.match(/[Ll]ast\s[Uu]pdate\s(.*)/);
        let date = null;
        if (dateRegex && dateRegex[1])
            date = dateRegex[1];
        if (!id)
            continue;
        const mangaDate = parseDate(date);
        if (mangaDate > time) {
            if (ids.includes(id)) {
                updatedManga.push(id);
            }
        }
    }
    return {
        ids: updatedManga
    };
};
exports.parseUpdatedManga = parseUpdatedManga;
const parseHomeSections = ($, section) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const mangaTiles = [];
    switch (section.id) {
        //Top Manga 
        case "top_manga":
            for (const manga of $("div.ls23", "div.ls123").toArray()) {
                const id = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split("/").pop();
                const title = $("a", manga).attr('title');
                const image = (_c = (_b = $("img", manga).attr('src')) === null || _b === void 0 ? void 0 : _b.split("?")[0]) !== null && _c !== void 0 ? _c : "";
                const lastChapter = $("span.ls23s", manga).text().trim();
                if (!id || !title)
                    continue;
                mangaTiles.push(createMangaTile({
                    id: id,
                    image: image ? image : "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: lastChapter }),
                }));
            }
            break;
        //Latest Manga Update 
        case "latest_manga_update":
            for (const manga of $("div.ls4,last-updates-content", "div.ls4w").toArray()) {
                const id = (_d = $("a", manga).attr('href')) === null || _d === void 0 ? void 0 : _d.split("/").pop();
                const title = $("a", manga).attr('title');
                const image = (_f = (_e = $("img", manga).attr('src')) === null || _e === void 0 ? void 0 : _e.split("?")[0]) !== null && _f !== void 0 ? _f : "";
                const lastChapter = $("a.ls24", manga).text().trim();
                if (!id || !title)
                    continue;
                mangaTiles.push(createMangaTile({
                    id: id,
                    image: image ? image : "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: lastChapter }),
                }));
            }
            break;
        //New Manga 
        case "new_manga":
            for (const manga of $("div.ls4,last-updates-content", "div.ls4w").toArray()) {
                const id = (_g = $("a", manga).attr('href')) === null || _g === void 0 ? void 0 : _g.split("/").pop();
                const title = $("a", manga).attr('title');
                const image = (_j = (_h = $("img", manga).attr('src')) === null || _h === void 0 ? void 0 : _h.split("?")[0]) !== null && _j !== void 0 ? _j : "";
                const lastChapter = $("a.ls24", manga).text().trim();
                if (!id || !title)
                    continue;
                mangaTiles.push(createMangaTile({
                    id: id,
                    image: image ? image : "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: lastChapter }),
                }));
            }
            break;
        //Latest Manhua Update
        case "latest_manhua_update":
            for (const manga of $("div.ls4,last-updates-content", "div.ls4w").toArray()) {
                const id = (_k = $("a", manga).attr('href')) === null || _k === void 0 ? void 0 : _k.split("/").pop();
                const title = $("a", manga).attr('title');
                const image = (_m = (_l = $("img", manga).attr('src')) === null || _l === void 0 ? void 0 : _l.split("?")[0]) !== null && _m !== void 0 ? _m : "";
                const lastChapter = $("a.ls24", manga).text().trim();
                if (!id || !title)
                    continue;
                mangaTiles.push(createMangaTile({
                    id: id,
                    image: image ? image : "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: lastChapter }),
                }));
            }
            break;
        //Popular Manga
        case "popular_manga":
            for (const manga of $("div.ls2", "div.ls12").toArray()) {
                const id = (_o = $("a", manga).attr('href')) === null || _o === void 0 ? void 0 : _o.split("/").pop();
                const title = $("a", manga).attr('title');
                const image = (_q = (_p = $("img", manga).attr('src')) === null || _p === void 0 ? void 0 : _p.split("?")[0]) !== null && _q !== void 0 ? _q : "";
                const lastChapter = $("a.ls2l", manga).text().trim();
                if (!id || !title)
                    continue;
                mangaTiles.push(createMangaTile({
                    id: id,
                    image: image ? image : "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: lastChapter }),
                }));
            }
            break;
        default:
            break;
    }
    return mangaTiles;
};
exports.parseHomeSections = parseHomeSections;
const generateSearch = (query) => {
    var _a;
    let search = (_a = query.title) !== null && _a !== void 0 ? _a : "";
    return search;
};
exports.generateSearch = generateSearch;
const parseTags = ($) => {
    var _a, _b, _c;
    const arrayTags = [];
    for (const tag of $("li", "ul.genre").toArray()) {
        const label = $("a", tag).text().trim();
        const id = encodeURI((_c = (_b = (_a = $("a", tag).attr("href")) === null || _a === void 0 ? void 0 : _a.replace("/genre/", "")) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, "")) !== null && _c !== void 0 ? _c : "");
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
    else if (date.includes("MINUTE") || date.includes("MIN")) {
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

},{"paperback-extensions-common":4}]},{},[47])(47)
});
