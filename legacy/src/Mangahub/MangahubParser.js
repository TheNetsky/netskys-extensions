"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseTags = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const entities = require("entities");
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const titles = [];
    titles.push(decodeHTMLEntity($("h1._3xnDj").contents().first().text().trim()));
    for (const title of $("h1._3xnDj > small").text().trim().split(/\\|; /)) {
        if (title !== "")
            titles.push(decodeHTMLEntity(title.trim()));
    }
    const image = (_b = (_a = $("img.img-responsive")) === null || _a === void 0 ? void 0 : _a.attr("src")) !== null && _b !== void 0 ? _b : "";
    const author = decodeHTMLEntity((_c = $("._3QCtP > div:nth-child(2) > div:nth-child(1) > span:nth-child(2)").text().trim()) !== null && _c !== void 0 ? _c : "");
    const artist = decodeHTMLEntity((_d = $("._3QCtP > div:nth-child(2) > div:nth-child(2) > span:nth-child(2)").text().trim()) !== null && _d !== void 0 ? _d : "");
    const description = decodeHTMLEntity((_g = (_f = (_e = $("div#noanim-content-tab-pane-99 p.ZyMp7")) === null || _e === void 0 ? void 0 : _e.first()) === null || _f === void 0 ? void 0 : _f.text()) !== null && _g !== void 0 ? _g : "No description available");
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("._3Czbn a").toArray()) {
        const label = $(tag).text().trim();
        const id = (_j = (_h = $(tag).attr('href')) === null || _h === void 0 ? void 0 : _h.split("/genre/")[1]) !== null && _j !== void 0 ? _j : "";
        if (!id || !label)
            continue;
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = (_k = $("._3QCtP > div:nth-child(2) > div:nth-child(3) > span:nth-child(2)")) === null || _k === void 0 ? void 0 : _k.first().text().trim();
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
        image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
        rating: 0,
        status: status,
        author: author == "" ? "Unknown" : author,
        artist: artist == "" ? "Unknown" : artist,
        tags: tagSections,
        desc: description,
        //hentai: hentai
        hentai: false //MangaDex down
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($, mangaId) => {
    var _a, _b, _c, _d;
    const chapters = [];
    for (const chapter of $("ul.MWqeC,list-group").children("li").toArray()) {
        const id = (_b = (_a = $('a', chapter).attr('href')) === null || _a === void 0 ? void 0 : _a.split(`/${mangaId}/`).pop()) !== null && _b !== void 0 ? _b : "";
        const title = $("span.text-secondary._3D1SJ", chapter).text().replace("#", "Chapter ").trim();
        const chapterSection = $("span.text-secondary._3D1SJ", chapter).text().trim();
        const chapRegex = chapterSection.match(/(\d+\.?\d?)/);
        let chapterNumber = 0;
        if (chapRegex && chapRegex[1])
            chapterNumber = Number(chapRegex[1]);
        const date = parseDate((_d = (_c = $("small.UovLc", chapter)) === null || _c === void 0 ? void 0 : _c.text()) !== null && _d !== void 0 ? _d : "");
        if (!id)
            continue;
        chapters.push(createChapter({
            id,
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
//Unable to get tags from site, might need to hardcode these?
const parseTags = ($) => {
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] })];
    return tagSections;
};
exports.parseTags = parseTags;
const parseUpdatedManga = ($, time, ids) => {
    var _a, _b;
    const updatedManga = [];
    for (const manga of $("div.media", "div._21UU2").toArray()) {
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/').pop()) !== null && _b !== void 0 ? _b : "";
        const mangaDate = parseDate($('._3L1my', manga).first().text());
        if (!id)
            continue;
        if (mangaDate > time) {
            if (ids.includes(id)) {
                updatedManga.push(id);
            }
        }
    }
    return {
        ids: updatedManga,
    };
};
exports.parseUpdatedManga = parseUpdatedManga;
const parseHomeSections = ($, sections, sectionCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    for (const section of sections)
        sectionCallback(section);
    //Popular Mango Updates
    const hotMangaUpdate = [];
    for (const manga of $("div.manga-slide", "div.manga-slider").toArray()) {
        const title = $("strong", manga).text().trim();
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/').pop()) !== null && _b !== void 0 ? _b : "";
        const imageSection = (_c = $("div.m-slide-background", manga).attr("style")) !== null && _c !== void 0 ? _c : "";
        const imgRegex = imageSection.match(/(https?:\/\/.*\.(?:png|jpg))/);
        let image = "https://i.imgur.com/GYUxEX8.png";
        if (imgRegex && imgRegex[0])
            image = imgRegex[0];
        const subtitle = $("em", manga).text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        hotMangaUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[0].items = hotMangaUpdate;
    sectionCallback(sections[0]);
    //Hot Mango
    const hotManga = [];
    for (const manga of $("div.media", "._11E7v").toArray()) {
        const title = (_d = $('img', manga).first().attr('alt')) !== null && _d !== void 0 ? _d : "";
        const id = (_f = (_e = $('a', manga).attr('href')) === null || _e === void 0 ? void 0 : _e.split('/manga/').pop()) !== null && _f !== void 0 ? _f : "";
        const image = (_g = $('img', manga).first().attr('src')) !== null && _g !== void 0 ? _g : "";
        const subtitle = $("p > a.text-secondary", manga).text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        hotManga.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[1].items = hotManga;
    sectionCallback(sections[1]);
    //Latest Mango
    const latestManga = [];
    const latestArray = $("div.media", "div._21UU2").toArray();
    for (const manga of latestArray.splice(0, 30)) { //Too many items! (Over 500!)
        const title = (_h = $('img', manga).first().attr('alt')) !== null && _h !== void 0 ? _h : "";
        const id = (_k = (_j = $('a', manga).attr('href')) === null || _j === void 0 ? void 0 : _j.split('/manga/').pop()) !== null && _k !== void 0 ? _k : "";
        const image = (_l = $('img', manga).first().attr('src')) !== null && _l !== void 0 ? _l : "";
        const subtitle = $("span.text-secondary._3D1SJ", manga).text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        latestManga.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[2].items = latestManga;
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
    var _a, _b, _c, _d;
    const mangas = [];
    const collectedIds = [];
    for (const manga of $("div.media-manga.media", "div#mangalist").toArray()) {
        const title = (_a = $('img', manga).first().attr('alt')) !== null && _a !== void 0 ? _a : "";
        const id = (_c = (_b = $("a", manga).attr('href')) === null || _b === void 0 ? void 0 : _b.split("/manga/").pop()) !== null && _c !== void 0 ? _c : "";
        const image = (_d = $("img", manga).attr('src')) !== null && _d !== void 0 ? _d : "";
        const subtitle = $("p > a", manga).first().text().replace("#", "Chapter ").trim();
        if (collectedIds.includes(id) || !id || !title)
            continue;
        mangas.push(createMangaTile({
            id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
        collectedIds.push(id);
    }
    ;
    return mangas;
};
exports.parseSearch = parseSearch;
const parseViewMore = ($, homepageSectionId) => {
    var _a, _b, _c, _d;
    const mangas = [];
    for (const manga of $("div#mangalist div.media-manga.media").toArray()) {
        const title = (_a = $('img', manga).first().attr('alt')) !== null && _a !== void 0 ? _a : "";
        const id = (_c = (_b = $("a", manga).attr('href')) === null || _b === void 0 ? void 0 : _b.split("/manga/").pop()) !== null && _c !== void 0 ? _c : "";
        const image = (_d = $("img", manga).attr('src')) !== null && _d !== void 0 ? _d : "";
        const subtitle = $("p > a", manga).first().text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        mangas.push(createMangaTile({
            id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    return mangas;
};
exports.parseViewMore = parseViewMore;
const isLastPage = ($) => {
    let isLast = true;
    let hasNext = Boolean($("a.btn.btn-primary").text());
    if (hasNext)
        isLast = false;
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
    return entities.decodeHTML(str);
};
