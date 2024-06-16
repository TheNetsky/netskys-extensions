function compat() {
"use strict";
var source = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUIBinding.js
  var require_DUIBinding = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUIBinding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUIForm.js
  var require_DUIForm = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUIForm.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUIFormRow.js
  var require_DUIFormRow = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUIFormRow.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUISection.js
  var require_DUISection = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Exports/DUISection.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIButton.js
  var require_DUIButton = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIButton.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIHeader.js
  var require_DUIHeader = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIHeader.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIInputField.js
  var require_DUIInputField = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIInputField.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUILabel.js
  var require_DUILabel = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUILabel.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUILink.js
  var require_DUILink = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUILink.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIMultilineLabel.js
  var require_DUIMultilineLabel = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIMultilineLabel.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUINavigationButton.js
  var require_DUINavigationButton = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUINavigationButton.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIOAuthButton.js
  var require_DUIOAuthButton = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIOAuthButton.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUISecureInputField.js
  var require_DUISecureInputField = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUISecureInputField.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUISelect.js
  var require_DUISelect = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUISelect.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIStepper.js
  var require_DUIStepper = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUIStepper.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUISwitch.js
  var require_DUISwitch = __commonJS({
    "node_modules/@paperback/types/lib/generated/DynamicUI/Rows/Exports/DUISwitch.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/ChapterDetails.js
  var require_ChapterDetails = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/ChapterDetails.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/Chapter.js
  var require_Chapter = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/Chapter.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/Cookie.js
  var require_Cookie = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/Cookie.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/HomeSection.js
  var require_HomeSection = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/HomeSection.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/IconText.js
  var require_IconText = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/IconText.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/MangaInfo.js
  var require_MangaInfo = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/MangaInfo.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/MangaProgress.js
  var require_MangaProgress = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/MangaProgress.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/PartialSourceManga.js
  var require_PartialSourceManga = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/PartialSourceManga.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/MangaUpdates.js
  var require_MangaUpdates = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/MangaUpdates.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/PBCanvas.js
  var require_PBCanvas = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/PBCanvas.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/PBImage.js
  var require_PBImage = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/PBImage.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/PagedResults.js
  var require_PagedResults = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/PagedResults.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/RawData.js
  var require_RawData = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/RawData.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/Request.js
  var require_Request = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/Request.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/SourceInterceptor.js
  var require_SourceInterceptor = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/SourceInterceptor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/RequestManager.js
  var require_RequestManager = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/RequestManager.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/Response.js
  var require_Response = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/Response.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/SearchField.js
  var require_SearchField = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/SearchField.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/SearchRequest.js
  var require_SearchRequest = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/SearchRequest.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/SourceCookieStore.js
  var require_SourceCookieStore = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/SourceCookieStore.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/SourceManga.js
  var require_SourceManga = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/SourceManga.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/SecureStateManager.js
  var require_SecureStateManager = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/SecureStateManager.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/SourceStateManager.js
  var require_SourceStateManager = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/SourceStateManager.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/Tag.js
  var require_Tag = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/Tag.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/TagSection.js
  var require_TagSection = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/TagSection.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/TrackedMangaChapterReadAction.js
  var require_TrackedMangaChapterReadAction = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/TrackedMangaChapterReadAction.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/Exports/TrackerActionQueue.js
  var require_TrackerActionQueue = __commonJS({
    "node_modules/@paperback/types/lib/generated/Exports/TrackerActionQueue.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/generated/_exports.js
  var require_exports = __commonJS({
    "node_modules/@paperback/types/lib/generated/_exports.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_DUIBinding(), exports);
      __exportStar(require_DUIForm(), exports);
      __exportStar(require_DUIFormRow(), exports);
      __exportStar(require_DUISection(), exports);
      __exportStar(require_DUIButton(), exports);
      __exportStar(require_DUIHeader(), exports);
      __exportStar(require_DUIInputField(), exports);
      __exportStar(require_DUILabel(), exports);
      __exportStar(require_DUILink(), exports);
      __exportStar(require_DUIMultilineLabel(), exports);
      __exportStar(require_DUINavigationButton(), exports);
      __exportStar(require_DUIOAuthButton(), exports);
      __exportStar(require_DUISecureInputField(), exports);
      __exportStar(require_DUISelect(), exports);
      __exportStar(require_DUIStepper(), exports);
      __exportStar(require_DUISwitch(), exports);
      __exportStar(require_ChapterDetails(), exports);
      __exportStar(require_Chapter(), exports);
      __exportStar(require_Cookie(), exports);
      __exportStar(require_HomeSection(), exports);
      __exportStar(require_IconText(), exports);
      __exportStar(require_MangaInfo(), exports);
      __exportStar(require_MangaProgress(), exports);
      __exportStar(require_PartialSourceManga(), exports);
      __exportStar(require_MangaUpdates(), exports);
      __exportStar(require_PBCanvas(), exports);
      __exportStar(require_PBImage(), exports);
      __exportStar(require_PagedResults(), exports);
      __exportStar(require_RawData(), exports);
      __exportStar(require_Request(), exports);
      __exportStar(require_SourceInterceptor(), exports);
      __exportStar(require_RequestManager(), exports);
      __exportStar(require_Response(), exports);
      __exportStar(require_SearchField(), exports);
      __exportStar(require_SearchRequest(), exports);
      __exportStar(require_SourceCookieStore(), exports);
      __exportStar(require_SourceManga(), exports);
      __exportStar(require_SecureStateManager(), exports);
      __exportStar(require_SourceStateManager(), exports);
      __exportStar(require_Tag(), exports);
      __exportStar(require_TagSection(), exports);
      __exportStar(require_TrackedMangaChapterReadAction(), exports);
      __exportStar(require_TrackerActionQueue(), exports);
    }
  });

  // node_modules/@paperback/types/lib/base/Source.js
  var require_Source = __commonJS({
    "node_modules/@paperback/types/lib/base/Source.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
      var Source = class {
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
          return this.getSearchTags?.();
        }
      };
      exports.Source = Source;
      function convertTime(timeAgo) {
        let time;
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
        trimmed = trimmed == 0 && timeAgo.includes("a") ? 1 : trimmed;
        if (timeAgo.includes("minutes")) {
          time = new Date(Date.now() - trimmed * 6e4);
        } else if (timeAgo.includes("hours")) {
          time = new Date(Date.now() - trimmed * 36e5);
        } else if (timeAgo.includes("days")) {
          time = new Date(Date.now() - trimmed * 864e5);
        } else if (timeAgo.includes("year") || timeAgo.includes("years")) {
          time = new Date(Date.now() - trimmed * 31556952e3);
        } else {
          time = new Date(Date.now());
        }
        return time;
      }
      exports.convertTime = convertTime;
      function urlEncodeObject(obj) {
        let ret = {};
        for (const entry of Object.entries(obj)) {
          ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
        }
        return ret;
      }
      exports.urlEncodeObject = urlEncodeObject;
    }
  });

  // node_modules/@paperback/types/lib/base/ByteArray.js
  var require_ByteArray = __commonJS({
    "node_modules/@paperback/types/lib/base/ByteArray.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/Badge.js
  var require_Badge = __commonJS({
    "node_modules/@paperback/types/lib/base/Badge.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.BadgeColor = void 0;
      var BadgeColor;
      (function(BadgeColor2) {
        BadgeColor2["BLUE"] = "default";
        BadgeColor2["GREEN"] = "success";
        BadgeColor2["GREY"] = "info";
        BadgeColor2["YELLOW"] = "warning";
        BadgeColor2["RED"] = "danger";
      })(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/ChapterProviding.js
  var require_ChapterProviding = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/ChapterProviding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/CloudflareBypassRequestProviding.js
  var require_CloudflareBypassRequestProviding = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/CloudflareBypassRequestProviding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/HomePageSectionsProviding.js
  var require_HomePageSectionsProviding = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/HomePageSectionsProviding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/MangaProgressProviding.js
  var require_MangaProgressProviding = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/MangaProgressProviding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/MangaProviding.js
  var require_MangaProviding = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/MangaProviding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/RequestManagerProviding.js
  var require_RequestManagerProviding = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/RequestManagerProviding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/SearchResultsProviding.js
  var require_SearchResultsProviding = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/SearchResultsProviding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/interfaces/index.js
  var require_interfaces = __commonJS({
    "node_modules/@paperback/types/lib/base/interfaces/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_ChapterProviding(), exports);
      __exportStar(require_CloudflareBypassRequestProviding(), exports);
      __exportStar(require_HomePageSectionsProviding(), exports);
      __exportStar(require_MangaProgressProviding(), exports);
      __exportStar(require_MangaProviding(), exports);
      __exportStar(require_RequestManagerProviding(), exports);
      __exportStar(require_SearchResultsProviding(), exports);
    }
  });

  // node_modules/@paperback/types/lib/base/SourceInfo.js
  var require_SourceInfo = __commonJS({
    "node_modules/@paperback/types/lib/base/SourceInfo.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ContentRating = exports.SourceIntents = void 0;
      var SourceIntents2;
      (function(SourceIntents3) {
        SourceIntents3[SourceIntents3["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
        SourceIntents3[SourceIntents3["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
        SourceIntents3[SourceIntents3["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
        SourceIntents3[SourceIntents3["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
        SourceIntents3[SourceIntents3["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
        SourceIntents3[SourceIntents3["SETTINGS_UI"] = 32] = "SETTINGS_UI";
      })(SourceIntents2 = exports.SourceIntents || (exports.SourceIntents = {}));
      var ContentRating2;
      (function(ContentRating3) {
        ContentRating3["EVERYONE"] = "EVERYONE";
        ContentRating3["MATURE"] = "MATURE";
        ContentRating3["ADULT"] = "ADULT";
      })(ContentRating2 = exports.ContentRating || (exports.ContentRating = {}));
    }
  });

  // node_modules/@paperback/types/lib/base/HomeSectionType.js
  var require_HomeSectionType = __commonJS({
    "node_modules/@paperback/types/lib/base/HomeSectionType.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.HomeSectionType = void 0;
      var HomeSectionType2;
      (function(HomeSectionType3) {
        HomeSectionType3["singleRowNormal"] = "singleRowNormal";
        HomeSectionType3["singleRowLarge"] = "singleRowLarge";
        HomeSectionType3["doubleRow"] = "doubleRow";
        HomeSectionType3["featured"] = "featured";
      })(HomeSectionType2 = exports.HomeSectionType || (exports.HomeSectionType = {}));
    }
  });

  // node_modules/@paperback/types/lib/base/PaperbackExtensionBase.js
  var require_PaperbackExtensionBase = __commonJS({
    "node_modules/@paperback/types/lib/base/PaperbackExtensionBase.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/base/index.js
  var require_base = __commonJS({
    "node_modules/@paperback/types/lib/base/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_Source(), exports);
      __exportStar(require_ByteArray(), exports);
      __exportStar(require_Badge(), exports);
      __exportStar(require_interfaces(), exports);
      __exportStar(require_SourceInfo(), exports);
      __exportStar(require_HomeSectionType(), exports);
      __exportStar(require_PaperbackExtensionBase(), exports);
    }
  });

  // node_modules/@paperback/types/lib/compat/DyamicUI.js
  var require_DyamicUI = __commonJS({
    "node_modules/@paperback/types/lib/compat/DyamicUI.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/@paperback/types/lib/index.js
  var require_lib = __commonJS({
    "node_modules/@paperback/types/lib/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_exports(), exports);
      __exportStar(require_base(), exports);
      __exportStar(require_DyamicUI(), exports);
    }
  });

  // src/DynastyScans/DynastyScans.ts
  var DynastyScans_exports = {};
  __export(DynastyScans_exports, {
    DynastyScans: () => DynastyScans,
    DynastyScansInfo: () => DynastyScansInfo
  });
  var import_types = __toESM(require_lib());
  var DS_DOMAIN = "https://dynasty-scans.com";
  var DynastyScansInfo = {
    version: "2.0.1",
    name: "Dynasty Scans",
    icon: "icon.png",
    author: "Netsky",
    authorWebsite: "https://github.com/TheNetsky",
    description: "Extension that pulls manga from dynasty-scans.com.",
    contentRating: import_types.ContentRating.ADULT,
    websiteBaseURL: DS_DOMAIN,
    intents: import_types.SourceIntents.MANGA_CHAPTERS | import_types.SourceIntents.HOMEPAGE_SECTIONS | import_types.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
  };
  var DynastyScans = class {
    constructor(cheerio) {
      this.cheerio = cheerio;
      this.requestManager = App.createRequestManager({
        requestsPerSecond: 10,
        requestTimeout: 2e4,
        interceptor: {
          interceptRequest: async (request) => {
            request.headers = {
              ...request.headers ?? {},
              ...{
                "referer": `${DS_DOMAIN}/`,
                "user-agent": await this.requestManager.getDefaultUserAgent()
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
    getMangaShareUrl(mangaId) {
      return `${DS_DOMAIN}/${mangaId}`;
    }
    async getMangaDetails(mangaId) {
      const request = App.createRequest({
        url: `${DS_DOMAIN}/${mangaId}.json`,
        // series/alice_quartet or doujins/alice_quartet
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      const author = data.tags.filter((x) => x.type == "Author");
      const status = data.tags.find((x) => x.type == "Status");
      const arrayTags = [];
      for (const tag of data.tags.filter((x) => x.type == "General")) {
        const label = tag.name;
        const id = tag.permalink;
        if (!id || !label) continue;
        arrayTags.push({ id, label });
      }
      const tagSections = [App.createTagSection({ id: "0", label: "genres", tags: arrayTags.map((x) => App.createTag(x)) })];
      let description;
      if (data.description) {
        const $ = this.cheerio.load(`<div>${data.description}</div>`);
        description = $("div").text().trim();
      } else {
        description = `Tags: ${data.tags.map((x) => x.name).join(", ")}`;
      }
      return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
          titles: [...[data.name], ...data.aliases],
          image: await this.getOrSetThumbnail("SET", mangaId, DS_DOMAIN + data.cover),
          status: status ? status.name : "Ongoing",
          author: author[0]?.name ? author[0].name : "Unknown",
          artist: author[1]?.name ? author[1].name : author[0]?.name ? author[0].name : "Unknown",
          tags: tagSections,
          desc: description
        })
      });
    }
    async getChapters(mangaId) {
      const request = App.createRequest({
        url: `${DS_DOMAIN}/${mangaId}.json`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      const seriesData = data;
      const doujinData = data;
      const chapters = [];
      const chapterRegex = /Chapter (\d+(\.\d+)?)/;
      const volumeRegex = /Volume (\d+(\.\d+)?)/;
      let sortingIndex = 0;
      switch (data.type) {
        case "Doujin":
          for (const chapter of doujinData.taggings.reverse()) {
            if (!chapter.permalink || !chapter.title) continue;
            const chapNumRegex = chapter.title.match(chapterRegex);
            let chapNum = 0;
            if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1]);
            const volNumRegex = chapter.title.match(volumeRegex);
            let volNum = 0;
            if (volNumRegex && volNumRegex[1]) volNum = Number(volNumRegex[1]);
            chapters.push({
              id: chapter.permalink,
              name: chapter.title,
              langCode: "\u{1F1EC}\u{1F1E7}",
              chapNum,
              sortingIndex,
              group: chapter.tags.map((x) => x.name).join(", "),
              time: new Date(chapter.released_on),
              volume: volNum
            });
            sortingIndex--;
          }
          break;
        case "Series":
          for (const chapter of seriesData.taggings.reverse()) {
            if (!chapter.permalink || !chapter.title) continue;
            const chapNumRegex = chapter.title.match(chapterRegex);
            let chapNum = 0;
            if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1]);
            const volNumRegex = chapter.title.match(volumeRegex);
            let volNum = 0;
            if (volNumRegex && volNumRegex[1]) volNum = Number(volNumRegex[1]);
            chapters.push({
              id: chapter.permalink,
              name: chapter.title,
              langCode: "\u{1F1EC}\u{1F1E7}",
              chapNum,
              sortingIndex,
              time: new Date(chapter.released_on),
              volume: volNum,
              group: ""
            });
            sortingIndex--;
          }
          break;
        default:
          break;
      }
      if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`);
      }
      return chapters.map((chapter) => {
        chapter.sortingIndex += chapters.length;
        return App.createChapter(chapter);
      });
    }
    async getChapterDetails(mangaId, chapterId) {
      const request = App.createRequest({
        url: `${DS_DOMAIN}/chapters/${chapterId}.json`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      const images = [];
      for (const image of data.pages) {
        images.push(DS_DOMAIN + image.url);
      }
      return App.createChapterDetails({
        id: chapterId,
        mangaId,
        pages: images
      });
    }
    async getHomePageSections(sectionCallback) {
      const request = App.createRequest({
        url: `${DS_DOMAIN}/chapters/added.json`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      const sections = [
        App.createHomeSection({
          id: "recently_added",
          title: "Recently Added",
          type: import_types.HomeSectionType.singleRowNormal,
          containsMoreItems: true
        }),
        App.createHomeSection({
          id: "recently_added_doujin",
          title: "Recently Added Douijins",
          type: import_types.HomeSectionType.singleRowNormal,
          containsMoreItems: true
        }),
        App.createHomeSection({
          id: "recently_added_series",
          title: "Recently Added Series",
          type: import_types.HomeSectionType.singleRowNormal,
          containsMoreItems: true
        })
      ];
      for (const section of sections) {
        const sectionItems = [];
        const items = data.chapters;
        switch (section.id) {
          case "recently_added_doujin":
            for (const item of items.filter((x) => !x.series).slice(0, 10)) {
              const id = item.tags.find((t) => t.type == "Doujin");
              if (!id?.permalink) continue;
              sectionItems.push(App.createPartialSourceManga({
                mangaId: `doujins/${id?.permalink}`,
                image: await this.getOrSetThumbnail("FETCH", `doujins/${id?.permalink}`),
                title: item.title,
                subtitle: item.tags.filter((x) => x.type == "General").map((t) => t.name).join(", ")
              }));
            }
            break;
          case "recently_added_series":
            for (const item of items.filter((x) => x.series).slice(0, 10)) {
              const id = item.tags.find((t) => t.type == "Series");
              if (!id?.permalink) continue;
              sectionItems.push(App.createPartialSourceManga({
                mangaId: `series/${id?.permalink}`,
                image: await this.getOrSetThumbnail("FETCH", `series/${id?.permalink}`),
                title: item.title,
                subtitle: item.tags.filter((x) => x.type == "General").map((t) => t.name).join(", ")
              }));
            }
            break;
          default:
            for (const item of items.slice(0, 10)) {
              let id = "";
              if (item.series) {
                const sId = item.tags.find((t) => t.type == "Series");
                if (!sId?.permalink) continue;
                id = `series/${sId?.permalink}`;
              } else {
                const dId = item.tags.find((t) => t.type == "Doujin");
                if (!dId?.permalink) continue;
                id = `doujins/${dId?.permalink}`;
              }
              if (!id) continue;
              sectionItems.push(App.createPartialSourceManga({
                mangaId: id,
                image: await this.getOrSetThumbnail("FETCH", id),
                title: item.title,
                subtitle: item.tags.map((t) => t.name).join(", ")
              }));
            }
            break;
        }
        section.items = [...new Map(sectionItems.map((x) => [x.mangaId, x])).values()];
        sectionCallback(section);
      }
    }
    async getViewMoreItems(homepageSectionId, metadata) {
      const page = metadata?.page ?? 1;
      const request = App.createRequest({
        url: `${DS_DOMAIN}/chapters/added.json?page=${page}`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      const sectionItems = [];
      const items = data.chapters;
      switch (homepageSectionId) {
        case "recently_added_doujin":
          for (const item of items.filter((x) => !x.series)) {
            const id = item.tags.find((t) => t.type == "Doujin");
            if (!id?.permalink) continue;
            sectionItems.push(App.createPartialSourceManga({
              mangaId: `doujins/${id?.permalink}`,
              image: await this.getOrSetThumbnail("GET", `doujins/${id?.permalink}`),
              title: item.title,
              subtitle: item.tags.filter((x) => x.type == "General").map((t) => t.name).join(", ")
            }));
          }
          break;
        case "recently_added_series":
          for (const item of items.filter((x) => x.series)) {
            const id = item.tags.find((t) => t.type == "Series");
            if (!id?.permalink) continue;
            sectionItems.push(App.createPartialSourceManga({
              mangaId: `series/${id?.permalink}`,
              image: await this.getOrSetThumbnail("GET", `series/${id?.permalink}`),
              title: item.title,
              subtitle: item.tags.filter((x) => x.type == "General").map((t) => t.name).join(", ")
            }));
          }
          break;
        default:
          for (const item of items) {
            let id = "";
            if (item.series) {
              const sId = item.tags.find((t) => t.type == "Series");
              id = `series/${sId?.permalink}`;
            } else {
              const dId = item.tags.find((t) => t.type == "Doujin");
              id = `doujins/${dId?.permalink}`;
            }
            if (!id) continue;
            sectionItems.push(App.createPartialSourceManga({
              mangaId: id,
              image: await this.getOrSetThumbnail("GET", id),
              title: item.title,
              subtitle: item.tags.map((t) => t.name).join(", ")
            }));
          }
          break;
      }
      metadata = data.current_page < data.total_pages ? { page: page + 1 } : void 0;
      return App.createPagedResults({
        results: [...new Map(sectionItems.map((x) => [x.mangaId, x])).values()],
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
          method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
        for (const tagType of data.tags) {
          for (const key of Object.keys(tagType)) {
            const tags = [];
            for (const tag of tagType[key]) {
              tags.push({
                id: tag.permalink,
                label: tag.name
              });
            }
            tagSections.push(App.createTagSection({ id: key, label: key, tags: tags.map((x) => App.createTag(x)) }));
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
          const request2 = App.createRequest({
            url: `${DS_DOMAIN}/tags/suggest?query=${tag.label}`,
            method: "POST"
          });
          const response2 = await global.requestManager.schedule(request2, 1);
          const data = typeof response2.data === "string" ? JSON.parse(response2.data) : response2.data;
          const tagId = data.find((x) => x.type == "General");
          tagIds.push(tagId.id);
        }
        return tagIds;
      }
      let tagString = "";
      const includedTagIds = await getTagId(this, query?.includedTags);
      if (includedTagIds.length > 0) {
        tagString = tagString + includedTagIds.map((x) => "&with%5B%5D=" + x).join();
      }
      const excludedTagIds = await getTagId(this, query?.excludedTags);
      if (includedTagIds.length > 0) {
        tagString = tagString + excludedTagIds.map((x) => "&without%5B%5D=" + x).join();
      }
      const page = metadata?.page ?? 1;
      const request = App.createRequest({
        url: `${DS_DOMAIN}/search?page=${page}&q=${encodeURI(query?.title ?? "")}&classes%5B%5D=Doujin&classes%5B%5D=Series${tagString}&sort=`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $ = this.cheerio.load(response.data);
      const results = [];
      for (const item of $("dl.chapter-list > dd").toArray()) {
        const id = $("a.name", item).attr("href")?.replace(/\/$/, "") ?? "";
        const title = $("a.name", item).text().trim() ?? "";
        const tags = $("span.tags > a", item).toArray().map((x) => $(x).text().trim()).join(", ");
        if (!id || !title) continue;
        results.push(App.createPartialSourceManga({
          mangaId: id,
          image: await this.getOrSetThumbnail("FETCH", id),
          title,
          subtitle: tags
        }));
      }
      metadata = { page: page + 1 };
      return App.createPagedResults({ results });
    }
    async getOrSetThumbnail(method, mangaId, coverURL) {
      async function fetchThumbnail(global) {
        try {
          const request = App.createRequest({
            url: `${DS_DOMAIN}/${mangaId}.json`,
            // series/alice_quartet or doujins/alice_quartet
            method: "GET"
          });
          const response = await global.requestManager.schedule(request, 1);
          const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
          return data.cover ? DS_DOMAIN + data.cover : "";
        } catch (error) {
          throw new Error(error);
        }
      }
      const hasCover = await this.stateManager.retrieve(mangaId) ?? "";
      let cover = "";
      switch (method) {
        case "GET":
          cover = hasCover;
          break;
        case "SET":
          if (!coverURL) {
            throw new Error("Cannot set new cover with providing a coverURL!");
          }
          await this.stateManager.store(mangaId, coverURL);
          cover = coverURL;
          break;
        case "FETCH":
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
  };
  return __toCommonJS(DynastyScans_exports);
})();
return source;} this.Sources = compat(); if (typeof exports === 'object' && typeof module !== 'undefined') {module.exports = this.Sources;}
