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

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
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
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
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

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
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

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynastyScans = exports.DynastyScansInfo = void 0;
const types_1 = require("@paperback/types");
const DS_DOMAIN = 'https://dynasty-scans.com';
exports.DynastyScansInfo = {
    version: '2.0.0',
    name: 'Dynasty Scans',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from dynasty-scans.com.',
    contentRating: types_1.ContentRating.ADULT,
    websiteBaseURL: DS_DOMAIN,
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
};
class DynastyScans {
    constructor(cheerio) {
        this.cheerio = cheerio;
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 10,
            requestTimeout: 20000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'referer': `${DS_DOMAIN}/`,
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
        this.stateManager = App.createSourceStateManager();
    }
    getMangaShareUrl(mangaId) { return `${DS_DOMAIN}/${mangaId}`; }
    async getMangaDetails(mangaId) {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/${mangaId}.json`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
        const author = data.tags.filter(x => x.type == 'Author');
        const status = data.tags.find(x => x.type == 'Status');
        const arrayTags = [];
        for (const tag of data.tags.filter(x => x.type == 'General')) {
            const label = tag.name;
            const id = tag.permalink;
            if (!id || !label)
                continue;
            arrayTags.push({ id: id, label: label });
        }
        const tagSections = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })];
        let description;
        if (data.description) {
            const $ = this.cheerio.load(`<div>${data.description}</div>`);
            description = $('div').text().trim();
        }
        else {
            description = `Tags: ${data.tags.map((x) => x.name).join(', ')}`;
        }
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [...[data.name], ...data.aliases],
                image: await this.getOrSetThumbnail('SET', mangaId, DS_DOMAIN + data.cover),
                status: status ? status.name : 'Ongoing',
                author: author[0]?.name ? author[0].name : 'Unknown',
                artist: author[1]?.name ? author[1].name : author[0]?.name ? author[0].name : 'Unknown',
                tags: tagSections,
                desc: description
            })
        });
    }
    async getChapters(mangaId) {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/${mangaId}.json`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
        const seriesData = data;
        const doujinData = data;
        const chapters = [];
        const chapterRegex = /Chapter (\d+(\.\d+)?)/;
        const volumeRegex = /Volume (\d+(\.\d+)?)/;
        let sortingIndex = 0;
        switch (data.type) {
            // For doujin/alice_quartet
            case 'Doujin':
                for (const chapter of doujinData.taggings.reverse()) {
                    if (!chapter.permalink || !chapter.title)
                        continue;
                    const chapNumRegex = chapter.title.match(chapterRegex);
                    let chapNum = 0;
                    if (chapNumRegex && chapNumRegex[1])
                        chapNum = Number(chapNumRegex[1]);
                    const volNumRegex = chapter.title.match(volumeRegex);
                    let volNum = 0;
                    if (volNumRegex && volNumRegex[1])
                        volNum = Number(volNumRegex[1]);
                    chapters.push({
                        id: chapter.permalink,
                        name: chapter.title,
                        langCode: '🇬🇧',
                        chapNum: chapNum,
                        sortingIndex,
                        group: chapter.tags.map(x => x.name).join(', '),
                        time: new Date(chapter.released_on),
                        volume: volNum
                    });
                    sortingIndex--;
                }
                break;
            // For series/alice_quartet
            case 'Series':
                for (const chapter of seriesData.taggings.reverse()) {
                    if (!chapter.permalink || !chapter.title)
                        continue;
                    const chapNumRegex = chapter.title.match(chapterRegex);
                    let chapNum = 0;
                    if (chapNumRegex && chapNumRegex[1])
                        chapNum = Number(chapNumRegex[1]);
                    const volNumRegex = chapter.title.match(volumeRegex);
                    let volNum = 0;
                    if (volNumRegex && volNumRegex[1])
                        volNum = Number(volNumRegex[1]);
                    chapters.push({
                        id: chapter.permalink,
                        name: chapter.title,
                        langCode: '🇬🇧',
                        chapNum: chapNum,
                        sortingIndex,
                        time: new Date(chapter.released_on),
                        volume: volNum,
                        group: ''
                    });
                    sortingIndex--;
                }
                break;
            // For chapters/alice_quartet (Not used)
            default:
                break;
        }
        if (chapters.length == 0) {
            throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`);
        }
        return chapters.map(chapter => {
            chapter.sortingIndex += chapters.length;
            return App.createChapter(chapter);
        });
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/chapters/${chapterId}.json`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
        const images = [];
        for (const image of data.pages) {
            images.push(DS_DOMAIN + image.url);
        }
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: images
        });
    }
    async getHomePageSections(sectionCallback) {
        const request = App.createRequest({
            url: `${DS_DOMAIN}/chapters/added.json`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
        const sections = [
            App.createHomeSection({
                id: 'recently_added', title: 'Recently Added', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: true
            }),
            App.createHomeSection({
                id: 'recently_added_doujin', title: 'Recently Added Douijins', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: true
            }),
            App.createHomeSection({
                id: 'recently_added_series', title: 'Recently Added Series', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: true
            })
        ];
        for (const section of sections) {
            const sectionItems = [];
            const items = data.chapters;
            switch (section.id) { // Doujins only
                case 'recently_added_doujin':
                    for (const item of items.filter(x => !x.series).slice(0, 10)) {
                        const id = item.tags.find(t => t.type == 'Doujin');
                        if (!id)
                            continue;
                        sectionItems.push(App.createPartialSourceManga({
                            mangaId: `doujins/${id?.permalink}`,
                            image: await this.getOrSetThumbnail('FETCH', `doujins/${id?.permalink}`),
                            title: item.title,
                            subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                        }));
                    }
                    break;
                case 'recently_added_series': // Series only
                    for (const item of items.filter(x => x.series).slice(0, 10)) {
                        const id = item.tags.find(t => t.type == 'Series');
                        if (!id)
                            continue;
                        sectionItems.push(App.createPartialSourceManga({
                            mangaId: `series/${id?.permalink}`,
                            image: await this.getOrSetThumbnail('FETCH', `series/${id?.permalink}`),
                            title: item.title,
                            subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                        }));
                    }
                    break;
                default: // Mixed
                    for (const item of items.slice(0, 10)) {
                        let id = '';
                        if (item.series) {
                            const sId = item.tags.find(t => t.type == 'Series');
                            id = `series/${sId?.permalink}`;
                        }
                        else {
                            const dId = item.tags.find(t => t.type == 'Doujin');
                            id = `doujins/${dId?.permalink}`;
                        }
                        if (!id)
                            continue;
                        sectionItems.push(App.createPartialSourceManga({
                            mangaId: id,
                            image: await this.getOrSetThumbnail('FETCH', id),
                            title: item.title,
                            subtitle: item.tags.map(t => t.name).join(', ')
                        }));
                    }
                    break;
            }
            section.items = [...new Map(sectionItems.map(x => [x.mangaId, x])).values()];
            sectionCallback(section);
        }
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const request = App.createRequest({
            url: `${DS_DOMAIN}/chapters/added.json?page=${page}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
        const sectionItems = [];
        const items = data.chapters;
        switch (homepageSectionId) { // Doujins only
            case 'recently_added_doujin':
                for (const item of items.filter(x => !x.series)) {
                    const id = item.tags.find(t => t.type == 'Doujin');
                    if (!id)
                        continue;
                    sectionItems.push(App.createPartialSourceManga({
                        mangaId: `doujins/${id?.permalink}`,
                        image: await this.getOrSetThumbnail('GET', `doujins/${id?.permalink}`),
                        title: item.title,
                        subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                    }));
                }
                break;
            case 'recently_added_series': // Series only
                for (const item of items.filter(x => x.series)) {
                    const id = item.tags.find(t => t.type == 'Series');
                    if (!id)
                        continue;
                    sectionItems.push(App.createPartialSourceManga({
                        mangaId: `series/${id?.permalink}`,
                        image: await this.getOrSetThumbnail('GET', `series/${id?.permalink}`),
                        title: item.title,
                        subtitle: item.tags.filter(x => x.type == 'General').map(t => t.name).join(', ')
                    }));
                }
                break;
            default: // Mixed
                for (const item of items) {
                    let id = '';
                    if (item.series) {
                        const sId = item.tags.find(t => t.type == 'Series');
                        id = `series/${sId?.permalink}`;
                    }
                    else {
                        const dId = item.tags.find(t => t.type == 'Doujin');
                        id = `doujins/${dId?.permalink}`;
                    }
                    if (!id)
                        continue;
                    sectionItems.push(App.createPartialSourceManga({
                        mangaId: id,
                        image: await this.getOrSetThumbnail('GET', id),
                        title: item.title,
                        subtitle: item.tags.map(t => t.name).join(', ')
                    }));
                }
                break;
        }
        metadata = data.current_page < data.total_pages ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: [...new Map(sectionItems.map(x => [x.mangaId, x])).values()],
            metadata
        });
    }
    async getSearchTags() {
        const tagSections = [];
        let getMore = true;
        let page = 1;
        while (getMore) {
            const request = App.createRequest({
                url: `${DS_DOMAIN}/tags.json?page=${page++}`,
                method: 'GET'
            });
            const response = await this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            for (const tagType of data.tags) {
                for (const key of Object.keys(tagType)) {
                    const tags = [];
                    for (const tag of tagType[key]) {
                        tags.push({
                            id: tag.permalink,
                            label: tag.name
                        });
                    }
                    tagSections.push(App.createTagSection({ id: key, label: key, tags: tags.map(x => App.createTag(x)) }));
                }
            }
            if (data.current_page >= data.total_pages) {
                getMore = false;
            }
        }
        return tagSections;
    }
    async supportsTagExclusion() {
        return true;
    }
    async getSearchResults(query, metadata) {
        async function getTagId(global, tags) {
            const tagIds = [];
            for (const tag of tags) {
                const request = App.createRequest({
                    url: `${DS_DOMAIN}/tags/suggest?query=${tag.label}`,
                    method: 'POST'
                });
                const response = await global.requestManager.schedule(request, 1);
                const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
                const tagId = data.find((x) => x.type == 'General');
                tagIds.push(tagId.id);
            }
            return tagIds;
        }
        let tagString = '';
        const includedTagIds = await getTagId(this, query?.includedTags);
        if (includedTagIds.length > 0) {
            tagString = tagString + includedTagIds.map(x => '&with%5B%5D=' + x).join();
        }
        const excludedTagIds = await getTagId(this, query?.excludedTags);
        if (includedTagIds.length > 0) {
            tagString = tagString + excludedTagIds.map(x => '&without%5B%5D=' + x).join();
        }
        const page = metadata?.page ?? 1;
        const request = App.createRequest({
            url: `${DS_DOMAIN}/search?page=${page}&q=${encodeURI(query?.title ?? '')}&classes%5B%5D=Doujin&classes%5B%5D=Series${tagString}&sort=`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const results = [];
        for (const item of $('dl.chapter-list > dd').toArray()) {
            const id = $('a.name', item).attr('href')?.replace(/\/$/, '') ?? '';
            const title = $('a.name', item).text().trim() ?? '';
            const tags = $('span.tags > a', item).toArray().map(x => $(x).text().trim()).join(', ');
            if (!id || !title)
                continue;
            results.push(App.createPartialSourceManga({
                mangaId: id,
                image: await this.getOrSetThumbnail('FETCH', id),
                title: title,
                subtitle: tags
            }));
        }
        metadata = { page: page + 1 };
        return App.createPagedResults({ results: results });
    }
    async getOrSetThumbnail(method, mangaId, coverURL) {
        async function fetchThumbnail(global) {
            const request = App.createRequest({
                url: `${DS_DOMAIN}/${mangaId}.json`,
                method: 'GET'
            });
            const response = await global.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            return data.cover ? DS_DOMAIN + data.cover : '';
        }
        const hasCover = await this.stateManager.retrieve(mangaId) ?? '';
        let cover = '';
        switch (method) {
            case 'GET':
                cover = hasCover;
                break;
            case 'SET':
                if (!coverURL) {
                    throw new Error('Cannot set new cover with providing a coverURL!');
                }
                await this.stateManager.store(mangaId, coverURL);
                cover = coverURL;
                break;
            case 'FETCH':
                if (hasCover) {
                    cover = hasCover;
                    break;
                }
                cover = await fetchThumbnail(this);
                await this.stateManager.store(mangaId, cover);
                break;
        }
        return cover;
    }
}
exports.DynastyScans = DynastyScans;

},{"@paperback/types":61}]},{},[62])(62)
});
