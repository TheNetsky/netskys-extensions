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
      var BadgeColor2;
      (function(BadgeColor3) {
        BadgeColor3["BLUE"] = "default";
        BadgeColor3["GREEN"] = "success";
        BadgeColor3["GREY"] = "info";
        BadgeColor3["YELLOW"] = "warning";
        BadgeColor3["RED"] = "danger";
      })(BadgeColor2 = exports.BadgeColor || (exports.BadgeColor = {}));
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

  // src/MangaHere/MangaHere.ts
  var MangaHere_exports = {};
  __export(MangaHere_exports, {
    MangaHere: () => MangaHere,
    MangaHereInfo: () => MangaHereInfo
  });
  var import_types2 = __toESM(require_lib());

  // src/MangaHere/MangaHereParser.ts
  var import_types = __toESM(require_lib());
  var parseMangaDetails = ($2, mangaId2) => {
    const section = $2(".detail-info");
    const title = $2("span.detail-info-right-title-font", section).text().trim();
    const author = $2("p.detail-info-right-say a", section).text().trim();
    const image = $2(".detail-info-cover-img", $2(".detail-info-cover")).attr("src") ?? "";
    const description = $2("p.fullcontent").text().trim();
    const arrayTags = [];
    for (const tag of $2("a", ".detail-info-right-tag-list").toArray()) {
      const id = $2(tag).attr("href")?.split("/directory/")[1]?.replace(/\//g, "");
      const label = $2(tag).text().trim();
      if (!id || !label) continue;
      arrayTags.push({ id, label });
    }
    const tagSections = [App.createTagSection({ id: "0", label: "genres", tags: arrayTags.map((x) => App.createTag(x)) })];
    const rawStatus = $2(".detail-info-right-title-tip", section).text().trim();
    let status = "ONGOING";
    switch (rawStatus.toUpperCase()) {
      case "ONGOING":
        status = "Ongoing";
        break;
      case "COMPLETED":
        status = "Completed";
        break;
      default:
        status = "Ongoing";
        break;
    }
    return App.createSourceManga({
      id: mangaId2,
      mangaInfo: App.createMangaInfo({
        titles: [title],
        image,
        status,
        author,
        artist: author,
        tags: tagSections,
        desc: description
      })
    });
  };
  var parseChapters = ($2, mangaId2) => {
    const chapters = [];
    for (const chapter of $2("div#chapterlist ul li").children("a").toArray()) {
      const title = $2("p.title3", chapter).html() ?? "";
      const date = parseDate($2("p.title2", chapter).html() ?? "");
      const chapterIdRaw = $2(chapter).attr("href")?.trim();
      const chapterIdRegex = chapterIdRaw?.match(/\/manga\/[a-zA-Z0-9_]*\/(.*)\//);
      let chapterId2 = null;
      if (chapterIdRegex && chapterIdRegex[1]) chapterId2 = chapterIdRegex[1];
      if (!chapterId2) continue;
      const chapRegex = chapterId2?.match(/c([0-9.]+)/);
      let chapNum = 0;
      if (chapRegex && chapRegex[1]) chapNum = Number(chapRegex[1]);
      const volRegex = chapterId2?.match(/v([0-9.]+)/);
      let volNum = 0;
      if (volRegex && volRegex[1]) volNum = Number(volRegex[1]);
      chapters.push(App.createChapter({
        id: chapterId2,
        name: title,
        langCode: "\u{1F1EC}\u{1F1E7}",
        chapNum: isNaN(chapNum) ? 0 : chapNum,
        volume: isNaN(volNum) ? 0 : volNum,
        time: date
      }));
    }
    if (chapters.length == 0) {
      throw new Error(`Couldn't find any chapters for mangaId: ${mangaId2}!`);
    }
    return chapters;
  };
  var parseChapterDetails = async ($, mangaId, chapterId, url, source) => {
    const pages = [];
    const bar = $("script[src*=chapter_bar]").length;
    if (bar) {
      const script = $("script:contains(function(p,a,c,k,e,d))").html()?.replace("eval", "");
      const deobfuscatedScript = eval(script).toString();
      const urls = deobfuscatedScript.substring(deobfuscatedScript.indexOf("newImgs=['") + 9, deobfuscatedScript.indexOf("'];")).split("','");
      for (const url2 of urls) {
        pages.push("https:" + url2.replace("'", ""));
      }
    } else {
      const script = $("script:contains(function(p,a,c,k,e,d))").html()?.replace("eval", "");
      const deobfuscatedScript = eval(script).toString();
      const secretKeyStart = deobfuscatedScript.indexOf("'");
      const secretKeyEnd = deobfuscatedScript.indexOf(";");
      const secretKeyResultScript = deobfuscatedScript.substring(secretKeyStart, secretKeyEnd).trim();
      let secretKey = eval(secretKeyResultScript).toString();
      const chapterIdStartLoc = $.html().indexOf("chapterid");
      const numericChapterId = $.html().substring(chapterIdStartLoc + 11, $.html().indexOf(";", chapterIdStartLoc)).trim();
      const pagesLinksElements = $("a", $(".pager-list-left > span").first());
      const pagesNumber = Number($(pagesLinksElements[pagesLinksElements.length - 2])?.attr("data-page"));
      const pageBase = url.substring(0, url.lastIndexOf("/"));
      for (let i = 1; i <= pagesNumber; i++) {
        let responseString = "";
        for (let tr = 1; tr <= 3; tr++) {
          const request = App.createRequest({
            url: `${pageBase}/chapterfun.ashx?cid=${numericChapterId}&page=${i}&key=${secretKey}`,
            method: "GET",
            headers: {
              "Referer": url,
              "Accept": "*/*",
              "Accept-Language": "en-US,en;q=0.9",
              "Connection": "keep-alive",
              "X-Requested-With": "XMLHttpRequest"
            }
          });
          const response = await source.requestManager.schedule(request, 1);
          responseString = response.data;
          if (!responseString) {
            continue;
          } else {
            secretKey = "";
          }
        }
        const deobfuscatedScript = eval(responseString.replace("eval", "")).toString();
        const baseLinkStartPos = deobfuscatedScript.indexOf("pix=") + 5;
        const baseLink = deobfuscatedScript.substring(deobfuscatedScript.indexOf("pix=") + 5, deobfuscatedScript.indexOf(";", baseLinkStartPos) - 1);
        const imageLinkStartPos = deobfuscatedScript.indexOf("pvalue=") + 9;
        const imageLinkEndPos = deobfuscatedScript.indexOf('"', imageLinkStartPos);
        const imageLink = deobfuscatedScript.substring(imageLinkStartPos, imageLinkEndPos);
        pages.push(`https:${baseLink}${imageLink}`);
      }
    }
    const chapterDetails = App.createChapterDetails({
      id: chapterId,
      mangaId,
      pages
    });
    return chapterDetails;
  };
  var parseHomeSections = ($2, sectionCallback) => {
    const sections = [
      {
        sectionID: App.createHomeSection({
          id: "hot_release",
          title: "Hot Manga Releases",
          containsMoreItems: true,
          type: import_types.HomeSectionType.singleRowNormal
        }),
        selector: $2("div.manga-list-1").get(0)
      },
      {
        sectionID: App.createHomeSection({
          id: "being_read",
          title: "Being Read Right Now",
          containsMoreItems: false,
          type: import_types.HomeSectionType.singleRowNormal
        }),
        selector: $2("div.manga-list-1").get(1)
      },
      {
        sectionID: App.createHomeSection({
          id: "recommended",
          title: "Recommended",
          containsMoreItems: false,
          type: import_types.HomeSectionType.singleRowNormal
        }),
        selector: $2("div.manga-list-3")
      },
      {
        sectionID: App.createHomeSection({
          id: "new_manga",
          title: "New Manga Releases",
          containsMoreItems: true,
          type: import_types.HomeSectionType.singleRowNormal
        }),
        selector: $2("div.manga-list-1").get(2)
      }
    ];
    const collectedIds = [];
    for (const section of sections) {
      const mangaArray = [];
      for (const manga of $2("li", section.selector).toArray()) {
        const id = $2("a", manga).attr("href")?.split("/manga/")[1]?.replace(/\//g, "");
        const image = $2("img", manga).first().attr("src") ?? "";
        const title = $2("img", manga).first().attr("alt")?.trim() ?? "";
        const subtitle = $2(".manga-list-1-item-subtitle", manga).text().trim();
        if (!id || !title || collectedIds.includes(id)) continue;
        mangaArray.push(App.createPartialSourceManga({
          image,
          title,
          mangaId: id,
          subtitle
        }));
        collectedIds.push(id);
      }
      section.sectionID.items = mangaArray;
      sectionCallback(section.sectionID);
    }
    const latestSection = App.createHomeSection({
      id: "latest_updates",
      title: "Latest Updates",
      containsMoreItems: true,
      type: import_types.HomeSectionType.singleRowNormal
    });
    const latestManga = [];
    for (const manga of $2("li", "div.manga-list-4 ").toArray()) {
      const id = $2("a", manga).attr("href")?.split("/manga/")[1]?.replace(/\//g, "");
      const image = $2("img", manga).first().attr("src") ?? "";
      const title = $2("a", manga).attr("title")?.trim() ?? "";
      const subtitle = $2("ul.manga-list-4-item-part > li", manga).first().text().trim();
      if (!id || !title || collectedIds.includes(id)) continue;
      latestManga.push(App.createPartialSourceManga({
        image,
        title,
        mangaId: id,
        subtitle
      }));
      collectedIds.push(id);
    }
    latestSection.items = latestManga;
    sectionCallback(latestSection);
  };
  var parseSearch = ($2) => {
    const mangaItems = [];
    const collectedIds = [];
    for (const manga of $2("ul.manga-list-4-list > li").toArray()) {
      const id = $2("a", manga).attr("href")?.split("/manga/")[1]?.replace(/\//g, "");
      const image = $2("img", manga).first().attr("src") ?? "";
      const title = $2("a", manga).attr("title")?.trim() ?? "";
      const subtitle = $2("a", $2("p.manga-list-4-item-tip", manga).get(1)).text();
      if (!id || !title || collectedIds.includes(id)) continue;
      mangaItems.push(App.createPartialSourceManga({
        image,
        title,
        mangaId: id,
        subtitle
      }));
      collectedIds.push(id);
    }
    return mangaItems;
  };
  var parseViewMore = ($2, homepageSectionId) => {
    const mangaItems = [];
    const collectedIds = [];
    if (homepageSectionId === "latest_updates") {
      for (const manga of $2("ul.manga-list-4-list > li").toArray()) {
        const id = $2("a", manga).attr("href")?.split("/manga/")[1]?.replace(/\//g, "");
        const image = $2("img", manga).first().attr("src") ?? "";
        const title = $2("a", manga).attr("title")?.trim() ?? "";
        const subtitle = $2("ul.manga-list-4-item-part > li", manga).first().text().trim();
        if (!id || !title || collectedIds.includes(id)) continue;
        mangaItems.push(App.createPartialSourceManga({
          image,
          title,
          mangaId: id,
          subtitle
        }));
        collectedIds.push(id);
      }
      return mangaItems;
    }
    for (const manga of $2("li", $2.html()).toArray()) {
      const id = $2("a", manga).attr("href")?.split("/manga/")[1]?.replace(/\//g, "");
      const image = $2("img", manga).first().attr("src") ?? "";
      const title = $2("img", manga).first().attr("alt")?.trim() ?? "";
      const subtitle = $2("p.manga-list-1-item-subtitle", manga).text().trim();
      if (!id || !title || collectedIds.includes(id)) continue;
      mangaItems.push(App.createPartialSourceManga({
        image,
        title,
        mangaId: id,
        subtitle
      }));
      collectedIds.push(id);
    }
    return mangaItems;
  };
  var parseTags = ($2) => {
    const arrayTags = [];
    for (const tag of $2("div.tag-box > a").toArray()) {
      const label = $2(tag).text().trim();
      const id = $2(tag).attr("data-val") ?? "";
      if (!id || !label) continue;
      arrayTags.push({ id, label });
    }
    const tagSections = [App.createTagSection({ id: "0", label: "genres", tags: arrayTags.map((x) => App.createTag(x)) })];
    return tagSections;
  };
  var parseDate = (date) => {
    date = date.toUpperCase();
    let time;
    const number = Number((/\d*/.exec(date) ?? [])[0]);
    if (date.includes("LESS THAN AN HOUR") || date.includes("JUST NOW")) {
      time = new Date(Date.now());
    } else if (date.includes("YEAR") || date.includes("YEARS")) {
      time = new Date(Date.now() - number * 31556952e3);
    } else if (date.includes("MONTH") || date.includes("MONTHS")) {
      time = new Date(Date.now() - number * 2592e6);
    } else if (date.includes("WEEK") || date.includes("WEEKS")) {
      time = new Date(Date.now() - number * 6048e5);
    } else if (date.includes("YESTERDAY")) {
      time = new Date(Date.now() - 864e5);
    } else if (date.includes("DAY") || date.includes("DAYS")) {
      time = new Date(Date.now() - number * 864e5);
    } else if (date.includes("HOUR") || date.includes("HOURS")) {
      time = new Date(Date.now() - number * 36e5);
    } else if (date.includes("MINUTE") || date.includes("MINUTES")) {
      time = new Date(Date.now() - number * 6e4);
    } else if (date.includes("SECOND") || date.includes("SECONDS")) {
      time = new Date(Date.now() - number * 1e3);
    } else {
      time = new Date(date);
    }
    return time;
  };
  var isLastPage = ($2) => {
    let isLast = true;
    const pages2 = [];
    for (const page of $2("a", ".pager-list-left").toArray()) {
      const p = Number($2(page).text().trim());
      if (isNaN(p)) continue;
      pages2.push(p);
    }
    const lastPage = Math.max(...pages2);
    const currentPage = Number($2("a.active", ".pager-list-left").text().trim());
    if (currentPage <= lastPage) isLast = false;
    return isLast;
  };

  // src/MangaHere/MangaHereHelper.ts
  var URLBuilder = class {
    constructor(baseUrl) {
      this.parameters = {};
      this.pathComponents = [];
      this.baseUrl = baseUrl.replace(/(^\/)?(?=.*)(\/$)?/gim, "");
    }
    addPathComponent(component) {
      this.pathComponents.push(component.replace(/(^\/)?(?=.*)(\/$)?/gim, ""));
      return this;
    }
    addQueryParameter(key, value) {
      this.parameters[key] = value;
      return this;
    }
    buildUrl({ addTrailingSlash, includeUndefinedParameters } = { addTrailingSlash: false, includeUndefinedParameters: false }) {
      let finalUrl = this.baseUrl + "/";
      finalUrl += this.pathComponents.join("/");
      finalUrl += addTrailingSlash ? "/" : "";
      finalUrl += Object.values(this.parameters).length > 0 ? "?" : "";
      finalUrl += Object.entries(this.parameters).map((entry) => {
        if (Array.isArray(entry[1])) {
          return entry[1].map((value) => value || includeUndefinedParameters ? `${entry[0]}[]=${value}` : void 0).filter((x) => x !== void 0).join("&");
        }
        if (typeof entry[1] === "object") {
          return Object.keys(entry[1]).map((key) => entry[1][key] || includeUndefinedParameters ? `${entry[0]}[${key}]=${entry[1][key]}` : void 0).filter((x) => x !== void 0).join("&");
        }
        return `${entry[0]}=${entry[1]}`;
      }).filter((x) => x !== void 0).join("&");
      return finalUrl;
    }
  };

  // src/MangaHere/MangaHere.ts
  var MH_DOMAIN = "https://www.mangahere.cc";
  var MangaHereInfo = {
    version: "3.0.5",
    name: "MangaHere",
    icon: "icon.png",
    author: "Netsky",
    authorWebsite: "https://github.com/TheNetsky",
    description: "Extension that pulls manga from mangahere.cc",
    contentRating: import_types2.ContentRating.MATURE,
    websiteBaseURL: MH_DOMAIN,
    sourceTags: [],
    intents: import_types2.SourceIntents.MANGA_CHAPTERS | import_types2.SourceIntents.HOMEPAGE_SECTIONS | import_types2.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
  };
  var MangaHere = class {
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
                "referer": `${MH_DOMAIN}/`,
                "user-agent": await this.requestManager.getDefaultUserAgent()
              }
            }, request.cookies = [
              App.createCookie({ name: "isAdult", value: "1", domain: "www.mangahere.cc" })
            ];
            return request;
          },
          interceptResponse: async (response) => {
            return response;
          }
        }
      });
    }
    getMangaShareUrl(mangaId2) {
      return `${MH_DOMAIN}/manga/${mangaId2}`;
    }
    async getMangaDetails(mangaId2) {
      const request = App.createRequest({
        url: `${MH_DOMAIN}/manga/${mangaId2}`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $2 = this.cheerio.load(response.data);
      return parseMangaDetails($2, mangaId2);
    }
    async getChapters(mangaId2) {
      const request = App.createRequest({
        url: `${MH_DOMAIN}/manga/${mangaId2}`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $2 = this.cheerio.load(response.data);
      return parseChapters($2, mangaId2);
    }
    async getChapterDetails(mangaId2, chapterId2) {
      const request = App.createRequest({
        url: `${MH_DOMAIN}/manga/${mangaId2}/${chapterId2}/1.html`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $2 = this.cheerio.load(response.data);
      return parseChapterDetails($2, mangaId2, chapterId2, request.url, this);
    }
    async getHomePageSections(sectionCallback) {
      const request = App.createRequest({
        url: MH_DOMAIN,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $2 = this.cheerio.load(response.data);
      parseHomeSections($2, sectionCallback);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
      const page = metadata?.page ?? 1;
      let param = "";
      switch (homepageSectionId) {
        case "hot_release":
          param = "hot";
          break;
        case "new_manga":
          param = `directory/${page}.htm?news`;
          break;
        case "latest_updates":
          param = `latest/${page}`;
          break;
        default:
          throw new Error(`Invalid homeSectionId | ${homepageSectionId}`);
      }
      const request = App.createRequest({
        url: `${MH_DOMAIN}/${param}`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $2 = this.cheerio.load(response.data);
      const manga = parseViewMore($2, homepageSectionId);
      metadata = !isLastPage($2) ? { page: page + 1 } : void 0;
      return App.createPagedResults({
        results: manga,
        metadata
      });
    }
    async getSearchResults(query, metadata) {
      const page = metadata?.page ?? 1;
      const url2 = new URLBuilder(MH_DOMAIN).addPathComponent("search").addQueryParameter("page", page).addQueryParameter("title", encodeURI(query?.title || "")).addQueryParameter("genres", query.includedTags?.map((x) => x.id).join("%2C")).buildUrl();
      const request = App.createRequest({
        url: url2,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $2 = this.cheerio.load(response.data);
      const manga = parseSearch($2);
      metadata = !isLastPage($2) ? { page: page + 1 } : void 0;
      return App.createPagedResults({
        results: manga,
        metadata
      });
    }
    async getSearchTags() {
      const request = App.createRequest({
        url: `${MH_DOMAIN}/search?`,
        method: "GET"
      });
      const response = await this.requestManager.schedule(request, 1);
      const $2 = this.cheerio.load(response.data);
      return parseTags($2);
    }
  };
  return __toCommonJS(MangaHere_exports);
})();
return source;} this.Sources = compat(); if (typeof exports === 'object' && typeof module !== 'undefined') {module.exports = this.Sources;}
