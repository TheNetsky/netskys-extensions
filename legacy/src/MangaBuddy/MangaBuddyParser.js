"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseTags = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c, _d;
    const titles = [];
    titles.push(decodeHTMLEntity($("h1.novel-title").text().trim())); //Main English Title
    const altTitles = $("span:contains(Alternative :)").next().text().split(";");
    for (const title of altTitles) {
        if (!title)
            continue;
        titles.push(decodeHTMLEntity(title.trim()));
    }
    const image = (_a = "https:" + $("img", "figure.cover").attr('data-src')) !== null && _a !== void 0 ? _a : "";
    const description = decodeHTMLEntity($("div.content", "div.summary").text().trim());
    const author = decodeHTMLEntity($("span:contains(Authors:)").nextAll().text().trim().replace(/\n/, ",").replace(/\s+/g, " "));
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("li", "div.categories").toArray()) {
        const label = $(tag).text().trim();
        const id = encodeURI((_d = (_c = (_b = $("a", tag).attr("href")) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.split("/genres/")[1]) !== null && _d !== void 0 ? _d : "");
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
const parseChapters = (data, mangaId) => {
    const chapters = [];
    for (const chapter of data) {
        const title = chapter.name;
        const id = chapter.slug;
        const date = new Date(chapter.updated_at);
        const chapterNumber = Number(/chapter-(\d+)/.test(id) ? id.match(/chapter-(\d+)/)[1] : 0);
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
    const pages = [];
    for (const p of $("div.chapter-image", "div#chapter__content").toArray()) {
        let image = $("img", p).attr("data-src");
        if (!image)
            image = $("img", p).attr("src");
        pages.push("https:" + image);
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
    const updatedManga = [];
    for (const manga of $("div.latest-item", "div.section.box.grid-items").toArray()) {
        const data = JSON.parse($("script", manga).get()[0].children[0].data);
        const id = data.slug;
        const mangaDate = new Date(data.updated_at);
        if (ids.includes(id)) {
            updatedManga.push(id);
        }
    }
    return {
        ids: updatedManga,
    };
};
exports.parseUpdatedManga = parseUpdatedManga;
const parseHomeSections = ($, sections, sectionCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    for (const section of sections)
        sectionCallback(section);
    //Latest Updates
    const latestMangaUpdate = [];
    for (const manga of $("div.latest-item", "div.section.box.grid-items").toArray()) {
        const data = JSON.parse($("script", manga).get()[0].children[0].data);
        const id = data.slug;
        const title = data.name;
        const image = (_a = "https:" + data.cover) !== null && _a !== void 0 ? _a : "";
        const subtitle = (_b = data.updated_at_text) !== null && _b !== void 0 ? _b : "";
        if (!id || !title)
            continue;
        latestMangaUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[0].items = latestMangaUpdate;
    sectionCallback(sections[0]);
    //Popular Manga
    const popularManga = [];
    for (const manga of $("div.trending-item", "div.section-body.popular").toArray()) {
        const id = (_c = $("a", manga).attr('href')) === null || _c === void 0 ? void 0 : _c.replace("/", "");
        const title = $("a", manga).attr('title');
        const image = (_d = "https:" + $("img", manga).attr('data-src')) !== null && _d !== void 0 ? _d : "";
        if (!id || !title)
            continue;
        popularManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    sections[1].items = popularManga;
    sectionCallback(sections[1]);
    //Top Monthly Manga
    const topMonthlyManga = [];
    for (const manga of $("div.inner", "div#monthly").toArray()) {
        const id = (_e = $("a", manga).attr('href')) === null || _e === void 0 ? void 0 : _e.replace("/", "");
        const title = $("h3.title", manga).text().trim();
        const image = (_f = "https:" + $("img", manga).attr('data-src')) !== null && _f !== void 0 ? _f : "";
        const subtitle = $("h4.chap-item", manga).text().trim();
        if (!id || !title)
            continue;
        topMonthlyManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) }),
        }));
    }
    sections[2].items = topMonthlyManga;
    sectionCallback(sections[2]);
    //Top Weekly Manga
    const topWeeklyManga = [];
    for (const manga of $("div.inner", "div#weekly").toArray()) {
        const id = (_g = $("a", manga).attr('href')) === null || _g === void 0 ? void 0 : _g.replace("/", "");
        const title = $("h3.title", manga).text().trim();
        const image = (_h = "https:" + $("img", manga).attr('data-src')) !== null && _h !== void 0 ? _h : "";
        const subtitle = $("h4.chap-item", manga).text().trim();
        if (!id || !title)
            continue;
        topWeeklyManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) }),
        }));
    }
    sections[3].items = topWeeklyManga;
    sectionCallback(sections[3]);
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
    var _a, _b;
    const mangas = [];
    for (const manga of $("div.novel-detailed-item", "div.section-body").toArray()) {
        const id = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.replace("/", "");
        const title = $("a", manga).attr('title');
        const image = (_b = "https:" + $("img", manga).attr('data-src')) !== null && _b !== void 0 ? _b : "";
        if (!id || !title)
            continue;
        mangas.push(createMangaTile({
            id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    return mangas;
};
exports.parseSearch = parseSearch;
const parseViewMore = ($) => {
    var _a, _b;
    const mangas = [];
    for (const manga of $("div.novel-detailed-item", "div.section-body").toArray()) {
        const id = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.replace("/", "");
        const title = $("a", manga).attr('title');
        const image = (_b = "https:" + $("img", manga).attr('data-src')) !== null && _b !== void 0 ? _b : "";
        if (!id || !title)
            continue;
        mangas.push(createMangaTile({
            id,
            image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    return mangas;
};
exports.parseViewMore = parseViewMore;
const parseTags = ($) => {
    var _a, _b;
    const arrayTags = [];
    for (const tag of $("div.category-item-wrapper", "div.section__categories").toArray()) {
        const label = $("a", tag).text().trim();
        const id = (_b = (_a = $("a", tag).attr('href')) === null || _a === void 0 ? void 0 : _a.split("genres/")[1]) !== null && _b !== void 0 ? _b : "";
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    return tagSections;
};
exports.parseTags = parseTags;
const isLastPage = ($) => {
    let isLast = false;
    const selector = $("a:contains(❯)", "div.paginator").attr("href");
    if (!selector || selector == "")
        isLast = true;
    return isLast;
};
exports.isLastPage = isLastPage;
const decodeHTMLEntity = (str) => {
    return str.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
};
