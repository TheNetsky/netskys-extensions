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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaHere_1 = require("../MangaHere/MangaHere");
describe('MangaHere Tests', function () {
    var wrapper = new paperback_extensions_common_1.APIWrapper();
    var source = new MangaHere_1.MangaHere(cheerio_1.default);
    var chai = require('chai'), expect = chai.expect, should = chai.should();
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    /**
     * The Manga ID which this unit test uses to base it's details off of.
     * Try to choose a manga which is updated frequently, so that the historical checking test can
     * return proper results, as it is limited to searching 30 days back due to extremely long processing times otherwise.
     */
    var mangaId = "lian_qi_lianle_sanqiannian"; // Mashle
    it("Retrieve Manga Details", () => __awaiter(this, void 0, void 0, function* () {
        let details = yield wrapper.getMangaDetails(source, mangaId);
        expect(details, "No results found with test-defined ID [" + mangaId + "]").to.exist;
        // Validate that the fields are filled
        let data = details;
        expect(data.id, "Missing ID").to.be.not.empty;
        expect(data.image, "Missing Image").to.be.not.empty;
        expect(data.status, "Missing Status").to.exist;
        expect(data.author, "Missing Author").to.be.not.empty;
        expect(data.desc, "Missing Description").to.be.not.empty;
        expect(data.titles, "Missing Titles").to.be.not.empty;
        expect(data.rating, "Missing Rating").to.exist;
    }));
    it("Get Chapters", () => __awaiter(this, void 0, void 0, function* () {
        let data = yield wrapper.getChapters(source, mangaId);
        expect(data, "No chapters present for: [" + mangaId + "]").to.not.be.empty;
        let entry = data[0];
        expect(entry.id, "No ID present").to.not.be.empty;
        expect(entry.time, "No date present").to.exist;
        expect(entry.name, "No title available").to.not.be.empty;
        expect(entry.chapNum, "No chapter number present").to.exist;
    }));
    it("Get Chapter Details", () => __awaiter(this, void 0, void 0, function* () {
        let chapters = yield wrapper.getChapters(source, mangaId);
        let data = yield wrapper.getChapterDetails(source, mangaId, chapters[0].id);
        expect(data, "No server response").to.exist;
        expect(data, "Empty server response").to.not.be.empty;
        expect(data.id, "Missing ID").to.be.not.empty;
        expect(data.mangaId, "Missing MangaID").to.be.not.empty;
        expect(data.pages, "No pages present").to.be.not.empty;
    }));
    it("Testing home page results for hot titles", () => __awaiter(this, void 0, void 0, function* () {
        let results = yield wrapper.getViewMoreItems(source, "hot_update", {}, 1);
        expect(results, "No results whatsoever for this section").to.exist;
        expect(results, "No results whatsoever for this section").to.exist;
        let data = results[0];
        expect(data.id, "No ID present").to.exist;
        expect(data.image, "No image present").to.exist;
        expect(data.title.text, "No title present").to.exist;
    }));
    it("Testing home page results for new titles", () => __awaiter(this, void 0, void 0, function* () {
        let results = yield wrapper.getViewMoreItems(source, "new_manga", {}, 1);
        expect(results, "No results whatsoever for this section").to.exist;
        expect(results, "No results whatsoever for this section").to.exist;
        let data = results[0];
        expect(data.id, "No ID present").to.exist;
        expect(data.image, "No image present").to.exist;
    }));
    it("Testing home page results for latest updated titles", () => __awaiter(this, void 0, void 0, function* () {
        let results = yield wrapper.getViewMoreItems(source, "latest_updates", {}, 1);
        expect(results, "No results whatsoever for this section").to.exist;
        expect(results, "No results whatsoever for this section").to.exist;
        let data = results[0];
        expect(data.id, "No ID present").to.exist;
        expect(data.image, "No image present").to.exist;
        expect(data.title.text, "No title present").to.exist;
    }));
    it("Testing search", () => __awaiter(this, void 0, void 0, function* () {
        let testSearch = createSearchRequest({
            title: 'attack'
        });
        let search = yield wrapper.searchRequest(source, testSearch, { page: 4 });
        let result = search.results[0];
        console.log(search.results);
        expect(result, "No response from server").to.exist;
        expect(result.id, "No ID found for search query").to.be.not.empty;
        expect(result.image, "No image found for search").to.be.not.empty;
        expect(result.title, "No title").to.be.not.null;
        expect(result.subtitleText, "No subtitle text").to.be.not.null;
    }));
    it("Testing Home-Page aquisition", () => __awaiter(this, void 0, void 0, function* () {
        let homePages = yield wrapper.getHomePageSections(source);
        expect(homePages, "No response from server").to.exist;
        expect(homePages[0], "No top weekly section available").to.exist;
        expect(homePages[1], "No latest updates section available").to.exist;
        expect(homePages[2], "No new manga section available").to.exist;
    }));
    it("Testing Notifications", () => __awaiter(this, void 0, void 0, function* () {
        let updates = yield wrapper.filterUpdatedManga(source, new Date("2021-3-18"), [mangaId]);
        expect(updates, "No server response").to.exist;
        expect(updates, "Empty server response").to.not.be.empty;
        expect(updates[0], "No updates").to.not.be.empty;
    }));
});
