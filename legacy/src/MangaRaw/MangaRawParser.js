"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseTags = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const url = "https://www.manga-raw.club";
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c;
    const titles = [];
    titles.push(decodeHTMLEntity($("h1.novel-title.text2row", "div.main-head").text().trim())); //Main English title
    const altTitles = $("h2.alternative-title.text1row", "div.main-head").text().trim().split(",");
    for (const title of altTitles) {
        titles.push(decodeHTMLEntity(title));
    }
    const author = $("span", "div.author").next().text().trim();
    const image = url + $("img", "div.fixed-img").attr('data-src');
    const description = decodeHTMLEntity($("div.content", "div.summary").text().trim());
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("li", "div.categories").toArray()) {
        const label = $(tag).text().trim();
        const id = encodeURI((_c = (_b = (_a = $("a", tag).attr("href")) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.split("genre=")[1]) !== null && _c !== void 0 ? _c : "");
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $("small:contains(Status)", "div.header-stats").prev().text().trim();
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
    var _a, _b, _c;
    const chapters = [];
    for (const c of $("li", "ul.chapter-list").toArray()) {
        const number = (_a = $("strong.chapter-title", c).text().trim().replace(/[^0-9]/g, "")) !== null && _a !== void 0 ? _a : "";
        if (!number)
            continue;
        const title = "Chapter " + number;
        const id = (_c = (_b = $("a", c).attr('href')) === null || _b === void 0 ? void 0 : _b.split("/en/")[1].replace("/", "")) !== null && _c !== void 0 ? _c : "";
        const date = parseDate($("time.chapter-update", c).text().trim().split(",")[0]);
        const chapterNumber = Number(number !== null && number !== void 0 ? number : 0);
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
    for (const p of $("img", 'div[style="font-size: 0;"]').toArray()) {
        let image = (_a = $(p).attr("src")) !== null && _a !== void 0 ? _a : "";
        if (!image)
            image = (_b = $(p).attr("data-src")) !== null && _b !== void 0 ? _b : "";
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
const parseUpdatedManga = ($, time, ids) => {
    var _a, _b;
    const updatedManga = [];
    let loadMore = true;
    for (const obj of $("li.novel-item", "ul.novel-list.grid").toArray()) {
        const id = (_b = (_a = $("a", obj).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1].replace("/", "")) !== null && _b !== void 0 ? _b : "";
        const mangaDate = parseDate($("span", $("div.novel-stats", obj)).text().trim().split(",")[0]);
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
const parseHomeSections = ($, sections, sectionCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    for (const section of sections)
        sectionCallback(section);
    //Trending Manga
    const trendingManga = [];
    for (const manga of $("li.novel-item", "div#popular-novel-section").toArray()) {
        const id = (_b = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1].replace("/", "")) !== null && _b !== void 0 ? _b : "";
        const title = (_c = $("img", manga).attr('alt')) !== null && _c !== void 0 ? _c : "";
        const image = (_d = $("img", manga).attr('src')) !== null && _d !== void 0 ? _d : "";
        if (!id || !title)
            continue;
        trendingManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    sections[0].items = trendingManga;
    sectionCallback(sections[0]);
    const viewedManga = [];
    for (const manga of $("li.swiper-slide.novel-item", "div#recommend-novel-slider").toArray()) {
        const id = (_f = (_e = $("a", manga).attr('href')) === null || _e === void 0 ? void 0 : _e.split("manga/")[1].replace("/", "")) !== null && _f !== void 0 ? _f : "";
        const title = (_g = $("img", manga).attr('alt')) !== null && _g !== void 0 ? _g : "";
        const image = (_h = $("img", manga).attr('src')) !== null && _h !== void 0 ? _h : "";
        if (!id || !title)
            continue;
        viewedManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    sections[1].items = viewedManga;
    sectionCallback(sections[1]);
    const newManga = [];
    for (const manga of $("li.novel-item", "div#updated-novel-slider").toArray()) {
        const id = (_k = (_j = $("a", manga).attr('href')) === null || _j === void 0 ? void 0 : _j.split("manga/")[1].replace("/", "")) !== null && _k !== void 0 ? _k : "";
        const title = $("a", manga).attr('title');
        const image = (_l = $("img", manga).attr('data-src')) !== null && _l !== void 0 ? _l : "";
        if (!id || !title)
            continue;
        newManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    sections[2].items = newManga;
    sectionCallback(sections[2]);
    for (const section of sections)
        sectionCallback(section);
};
exports.parseHomeSections = parseHomeSections;
const generateSearch = (query) => {
    var _a;
    let search = (_a = query.title) !== null && _a !== void 0 ? _a : "";
    return encodeURI(search);
};
exports.generateSearch = generateSearch;
const parseSearch = ($) => {
    var _a, _b, _c;
    const mangas = [];
    const collectedIds = [];
    for (const obj of $("li.novel-item", "ul.novel-list.grid").toArray()) {
        const id = (_b = (_a = $("a", obj).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1].replace("/", "")) !== null && _b !== void 0 ? _b : "";
        const title = $("a", obj).attr('title');
        const image = url + $("img", obj).attr('data-src');
        const subtitle = (_c = "Chapter " + $("strong", $("div.novel-stats", obj)).text().trim().replace(/[^0-9]/g, "")) !== null && _c !== void 0 ? _c : 0;
        if (!collectedIds.includes(id) && id && title) {
            mangas.push(createMangaTile({
                id,
                image: image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
            collectedIds.push(id);
        }
    }
    return mangas;
};
exports.parseSearch = parseSearch;
const parseViewMore = ($, homepageSectionId) => {
    var _a, _b, _c, _d;
    const manga = [];
    const collectedIds = [];
    for (const obj of $("li.novel-item", "ul.novel-list.grid").toArray()) {
        const id = (_b = (_a = $("a", obj).attr('href')) === null || _a === void 0 ? void 0 : _a.split("manga/")[1].replace("/", "")) !== null && _b !== void 0 ? _b : "";
        const title = $("a", obj).attr('title');
        const image = (_c = $("img", obj).attr('data-src')) !== null && _c !== void 0 ? _c : "";
        const subtitle = (_d = "Chapter " + $("strong", $("div.novel-stats", obj)).text().trim().replace(/[^0-9]/g, "")) !== null && _d !== void 0 ? _d : 0;
        if (!collectedIds.includes(id) && id && title) {
            manga.push(createMangaTile({
                id,
                image: image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
            collectedIds.push(id);
        }
    }
    return manga;
};
exports.parseViewMore = parseViewMore;
const parseTags = ($) => {
    var _a, _b, _c;
    const arrayTags = [];
    for (const tag of $("li", "ul.proplist").toArray()) {
        const label = $("a", tag).text().trim();
        const id = encodeURI((_c = (_b = (_a = $("a", tag).attr('href')) === null || _a === void 0 ? void 0 : _a.split("genre=")[1]) === null || _b === void 0 ? void 0 : _b.split("&results")[0]) !== null && _c !== void 0 ? _c : "");
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    return tagSections;
};
exports.parseTags = parseTags;
const isLastPage = ($) => {
    let isLast = false;
    const pages = [];
    for (const page of $("li", "ul.pagination").toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p))
            continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($("li.active").first().text());
    if (currentPage >= lastPage)
        isLast = true;
    return isLast;
};
exports.isLastPage = isLastPage;
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
        let split = date.split("-");
        time = new Date(Number(split[2]), Number(split[0]) - 1, Number(split[1]));
    }
    return time;
};
const decodeHTMLEntity = (str) => {
    return str.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
};
