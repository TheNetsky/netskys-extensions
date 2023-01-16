(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
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

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":13}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./Searchable"), exports);
__exportStar(require("./Requestable"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);

},{"./ChapterProviding":8,"./MangaProgressProviding":9,"./MangaProviding":10,"./Requestable":11,"./Searchable":12}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/MangaProgress"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":15,"./DynamicUI/Exports/DUIForm":16,"./DynamicUI/Exports/DUIFormRow":17,"./DynamicUI/Exports/DUISection":18,"./DynamicUI/Rows/Exports/DUIButton":19,"./DynamicUI/Rows/Exports/DUIHeader":20,"./DynamicUI/Rows/Exports/DUIInputField":21,"./DynamicUI/Rows/Exports/DUILabel":22,"./DynamicUI/Rows/Exports/DUILink":23,"./DynamicUI/Rows/Exports/DUIMultilineLabel":24,"./DynamicUI/Rows/Exports/DUINavigationButton":25,"./DynamicUI/Rows/Exports/DUIOAuthButton":26,"./DynamicUI/Rows/Exports/DUISecureInputField":27,"./DynamicUI/Rows/Exports/DUISelect":28,"./DynamicUI/Rows/Exports/DUIStepper":29,"./DynamicUI/Rows/Exports/DUISwitch":30,"./Exports/Chapter":31,"./Exports/ChapterDetails":32,"./Exports/Cookie":33,"./Exports/HomeSection":34,"./Exports/IconText":35,"./Exports/MangaInfo":36,"./Exports/MangaProgress":37,"./Exports/MangaUpdates":38,"./Exports/PBCanvas":39,"./Exports/PBImage":40,"./Exports/PagedResults":41,"./Exports/PartialSourceManga":42,"./Exports/RawData":43,"./Exports/Request":44,"./Exports/RequestManager":45,"./Exports/Response":46,"./Exports/SearchField":47,"./Exports/SearchRequest":48,"./Exports/SecureStateManager":49,"./Exports/SourceCookieStore":50,"./Exports/SourceInterceptor":51,"./Exports/SourceManga":52,"./Exports/SourceStateManager":53,"./Exports/Tag":54,"./Exports/TagSection":55,"./Exports/TrackedMangaChapterReadAction":56,"./Exports/TrackerActionQueue":57}],59:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":14,"./generated/_exports":58}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaHere = exports.MangaHereInfo = void 0;
const types_1 = require("@paperback/types");
const MangaHereParser_1 = require("./MangaHereParser");
const MangaHereHelper_1 = require("./MangaHereHelper");
const MH_DOMAIN = 'https://www.mangahere.cc';
const MH_DOMAIN_MOBILE = 'http://m.mangahere.cc';
exports.MangaHereInfo = {
    version: '3.0.0',
    name: 'MangaHere',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from MangaHere.',
    contentRating: types_1.ContentRating.MATURE,
    websiteBaseURL: MH_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: types_1.BadgeColor.GREEN
        }
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
};
class MangaHere extends types_1.Source {
    constructor() {
        super(...arguments);
        this.cookies = [App.createCookie({ name: 'isAdult', value: '1', domain: 'www.mangahere.cc' })];
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 5,
            requestTimeout: 20000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'referer': `${MH_DOMAIN}/`,
                            'user-agent': await this.requestManager.getDefaultUserAgent()
                        }
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
    }
    getMangaShareUrl(mangaId) { return `${MH_DOMAIN}/manga/${mangaId}`; }
    async getMangaDetails(mangaId) {
        const request = App.createRequest({
            url: `${MH_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        return (0, MangaHereParser_1.parseMangaDetails)($, mangaId);
    }
    async getChapters(mangaId) {
        const request = App.createRequest({
            url: `${MH_DOMAIN}/manga/`,
            method: 'GET',
            param: mangaId,
            cookies: this.cookies
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        return (0, MangaHereParser_1.parseChapters)($);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = App.createRequest({
            url: `${MH_DOMAIN_MOBILE}/roll_manga/${mangaId}/${chapterId}`,
            method: 'GET',
            cookies: this.cookies
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        return (0, MangaHereParser_1.parseChapterDetails)($, mangaId, chapterId);
    }
    async getHomePageSections(sectionCallback) {
        const request = App.createRequest({
            url: MH_DOMAIN,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        (0, MangaHereParser_1.parseHomeSections)($, sectionCallback);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
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
        const request = App.createRequest({
            url: `${MH_DOMAIN}/`,
            method: 'GET',
            param
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const manga = (0, MangaHereParser_1.parseViewMore)($, homepageSectionId);
        metadata = !(0, MangaHereParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const url = new MangaHereHelper_1.URLBuilder(MH_DOMAIN)
            .addPathComponent('search')
            .addQueryParameter('page', page)
            .addQueryParameter('title', encodeURI(query?.title || ''))
            .addQueryParameter('genres', query.includedTags?.map((x) => x.id).join('%2C'))
            .buildUrl();
        const request = App.createRequest({
            url: url,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const manga = (0, MangaHereParser_1.parseSearch)($);
        metadata = !(0, MangaHereParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    async getTags() {
        const request = App.createRequest({
            url: `${MH_DOMAIN}/search?`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        return (0, MangaHereParser_1.parseTags)($);
    }
}
exports.MangaHere = MangaHere;

},{"./MangaHereHelper":61,"./MangaHereParser":62,"@paperback/types":59}],61:[function(require,module,exports){
"use strict";
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
            // if (!entry[1] && !includeUndefinedParameters) { return undefined }
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

},{}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseTags = exports.parseViewMore = exports.parseSearch = exports.parseHomeSections = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const parseMangaDetails = ($, mangaId) => {
    const section = $('.detail-info');
    const title = $('span.detail-info-right-title-font', section).text().trim();
    const author = $('p.detail-info-right-say a', section).text().trim();
    const image = $('.detail-info-cover-img', $('.detail-info-cover')).attr('src') ?? '';
    const description = $('p.fullcontent').text().trim();
    const arrayTags = [];
    for (const tag of $('a', '.detail-info-right-tag-list').toArray()) {
        const id = $(tag).attr('href')?.split('/directory/')[1]?.replace(/\//g, '');
        const label = $(tag).text().trim();
        if (!id || !label)
            continue;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })];
    const rawStatus = $('.detail-info-right-title-tip', section).text().trim();
    let status = 'ONGOING';
    switch (rawStatus.toUpperCase()) {
        case 'ONGOING':
            status = 'ONGOING';
            break;
        case 'COMPLETED':
            status = 'COMPLETED';
            break;
        default:
            status = 'ONGOING';
            break;
    }
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            image: image,
            status: status,
            author: author,
            tags: tagSections,
            desc: description,
        })
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($) => {
    const chapters = [];
    for (const chapter of $('div#chapterlist ul li').children('a').toArray()) {
        const title = $('p.title3', chapter).html() ?? '';
        const date = parseDate($('p.title2', chapter).html() ?? '');
        const chapterIdRaw = $(chapter).attr('href')?.trim();
        const chapterIdRegex = chapterIdRaw?.match(/\/manga\/[a-zA-Z0-9_]*\/(.*)\//);
        let chapterId = null;
        if (chapterIdRegex && chapterIdRegex[1])
            chapterId = chapterIdRegex[1];
        if (!chapterId)
            continue;
        const chapRegex = chapterId?.match(/c([0-9.]+)/);
        let chapNum = 0;
        if (chapRegex && chapRegex[1])
            chapNum = Number(chapRegex[1]);
        const volRegex = chapterId?.match(/v([0-9.]+)/);
        let volNum = 0;
        if (volRegex && volRegex[1])
            volNum = Number(volRegex[1]);
        chapters.push(App.createChapter({
            id: chapterId,
            name: title,
            langCode: 'ENG',
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            volume: isNaN(volNum) ? 0 : volNum,
            time: date
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    const pages = [];
    if ($('div#viewer').length == 0)
        pages.push('https://i.imgur.com/8WoVeWv.png'); // Fallback in case the manga is licensed
    for (const page of $('div#viewer').children('img').toArray()) {
        let url = page.attribs['data-original'];
        if (!url)
            continue;
        if (url?.startsWith('//'))
            url = 'https:' + url;
        pages.push(url);
    }
    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    });
    return chapterDetails;
};
exports.parseChapterDetails = parseChapterDetails;
const parseHomeSections = ($, sectionCallback) => {
    const sections = [
        {
            sectionID: App.createHomeSection({
                id: 'hot_release',
                title: 'Hot Manga Releases',
                containsMoreItems: true,
                type: 'singleRowNormal'
            }),
            selector: $('div.manga-list-1').get(0)
        },
        {
            sectionID: App.createHomeSection({
                id: 'being_read',
                title: 'Being Read Right Now',
                containsMoreItems: false,
                type: 'singleRowNormal'
            }),
            selector: $('div.manga-list-1').get(1)
        },
        {
            sectionID: App.createHomeSection({
                id: 'recommended',
                title: 'Recommended',
                containsMoreItems: false,
                type: 'singleRowNormal'
            }),
            selector: $('div.manga-list-3')
        },
        {
            sectionID: App.createHomeSection({
                id: 'new_manga',
                title: 'New Manga Releases',
                containsMoreItems: true,
                type: 'singleRowNormal'
            }),
            selector: $('div.manga-list-1').get(2)
        }
    ];
    const collectedIds = [];
    // Hot Release Manga
    // New Manga
    // Being Read Manga
    for (const section of sections) {
        const mangaArray = [];
        for (const manga of $('li', section.selector).toArray()) {
            const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '');
            const image = $('img', manga).first().attr('src') ?? '';
            const title = $('img', manga).first().attr('alt')?.trim() ?? '';
            const subtitle = $('.manga-list-1-item-subtitle', manga).text().trim();
            if (!id || !title || !image)
                continue;
            if (collectedIds.includes(id))
                continue;
            mangaArray.push(App.createPartialSourceManga({
                image: image,
                title: title,
                mangaId: id,
                subtitle: subtitle
            }));
        }
        section.sectionID.items = mangaArray;
        sectionCallback(section.sectionID);
    }
    // Latest Manga
    const latestSection = App.createHomeSection({
        id: 'latest_updates',
        title: 'Latest Updates',
        containsMoreItems: true,
        type: 'singleRowNormal'
    });
    const latestManga = [];
    for (const manga of $('li', 'div.manga-list-4 ').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '');
        const image = $('img', manga).first().attr('src') ?? '';
        const title = $('a', manga).attr('title')?.trim() ?? '';
        const subtitle = $('ul.manga-list-4-item-part > li', manga).first().text().trim();
        if (!id || !title || !image)
            continue;
        if (collectedIds.includes(id))
            continue;
        latestManga.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
            subtitle: subtitle
        }));
    }
    latestSection.items = latestManga;
    sectionCallback(latestSection);
};
exports.parseHomeSections = parseHomeSections;
const parseSearch = ($) => {
    const mangaItems = [];
    const collectedIds = [];
    for (const manga of $('ul.manga-list-4-list > li').toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '');
        const image = $('img', manga).first().attr('src') ?? '';
        const title = $('a', manga).attr('title')?.trim() ?? '';
        const subtitle = $('a', $('p.manga-list-4-item-tip', manga).get(1)).text();
        if (!id || !title || !image)
            continue;
        if (collectedIds.includes(id))
            continue;
        mangaItems.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
            subtitle: subtitle
        }));
        collectedIds.push(id);
    }
    return mangaItems;
};
exports.parseSearch = parseSearch;
const parseViewMore = ($, homepageSectionId) => {
    const mangaItems = [];
    const collectedIds = [];
    if (homepageSectionId === 'latest_updates') {
        for (const manga of $('ul.manga-list-4-list > li').toArray()) {
            const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '');
            const image = $('img', manga).first().attr('src') ?? '';
            const title = $('a', manga).attr('title')?.trim() ?? '';
            const subtitle = $('ul.manga-list-4-item-part > li', manga).first().text().trim();
            if (!id || !title || !image)
                continue;
            if (collectedIds.includes(id))
                continue;
            mangaItems.push(App.createPartialSourceManga({
                image: image,
                title: title,
                mangaId: id,
                subtitle: subtitle
            }));
            collectedIds.push(id);
        }
        return mangaItems;
    }
    for (const manga of $('li', $.html()).toArray()) {
        const id = $('a', manga).attr('href')?.split('/manga/')[1]?.replace(/\//g, '');
        const image = $('img', manga).first().attr('src') ?? '';
        const title = $('img', manga).first().attr('alt')?.trim() ?? '';
        const subtitle = $('p.manga-list-1-item-subtitle', manga).text().trim();
        if (!id || !title || !image)
            continue;
        if (collectedIds.includes(id))
            continue;
        mangaItems.push(App.createPartialSourceManga({
            image: image,
            title: title,
            mangaId: id,
            subtitle: subtitle
        }));
        collectedIds.push(id);
    }
    return mangaItems;
};
exports.parseViewMore = parseViewMore;
const parseTags = ($) => {
    const arrayTags = [];
    for (const tag of $('div.tag-box > a').toArray()) {
        const label = $(tag).text().trim();
        const id = $(tag).attr('data-val') ?? '';
        if (!id || !label)
            continue;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })];
    return tagSections;
};
exports.parseTags = parseTags;
const parseDate = (date) => {
    date = date.toUpperCase();
    let time;
    const number = Number((/\d*/.exec(date) ?? [])[0]);
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

},{}]},{},[60])(60)
});
