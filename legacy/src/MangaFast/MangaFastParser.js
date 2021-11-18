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
