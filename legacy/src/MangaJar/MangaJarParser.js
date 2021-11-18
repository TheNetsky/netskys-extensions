"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseTags = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const entities = require("entities");
const parseMangaDetails = ($, mangaId) => {
    var _a, _b;
    const titles = [];
    titles.push(decodeHTMLEntity($("span.post-name", "div.card-body").text().trim())); //Main English Title
    titles.push(decodeHTMLEntity($("h2.post-name-jp.h5", "div.row").text().trim())); //Japanese Title
    titles.push(decodeHTMLEntity($("h2.h6", "div.row").text().trim())); //Kanji Title
    const image = getImageSrc($("img", "div.col-md-5.col-lg-4.text-center"));
    const description = decodeHTMLEntity($("div.manga-description.entry").text().trim());
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("div.post-info > span > a[href*=genre]").toArray()) {
        const label = $(tag).text().trim();
        const id = encodeURI((_b = (_a = $(tag).attr("href")) === null || _a === void 0 ? void 0 : _a.replace("/genre/", "")) !== null && _b !== void 0 ? _b : "");
        if (!id || !label)
            continue;
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $("span:contains(Status:)", "div.post-info").text().split(":")[1].trim();
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
        author: "Unknown",
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
    for (const chapter of $("li.list-group-item.chapter-item").toArray()) {
        const id = (_b = (_a = $("a", chapter).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`/manga/${mangaId}/chapter/`, "")) !== null && _b !== void 0 ? _b : "";
        const date = parseDate($("span.chapter-date", chapter).text().trim());
        const chapterRaw = $("span.chapter-title", chapter).text().trim();
        const volumeString = (_c = chapterRaw === null || chapterRaw === void 0 ? void 0 : chapterRaw.split('Volume')[1]) === null || _c === void 0 ? void 0 : _c.split('Chapter')[0].trim();
        const volume = volumeString ? Number(volumeString) : undefined;
        const chapNumString = (_d = chapterRaw === null || chapterRaw === void 0 ? void 0 : chapterRaw.split('Chapter')[1]) === null || _d === void 0 ? void 0 : _d.split(' ')[1].trim();
        const chapNum = chapNumString ? Number(chapNumString) : 0;
        const chapterName = $("span.chapter-title", chapter).parent().contents().remove().last().text().trim();
        if (!id)
            continue;
        chapters.push(createChapter({
            id,
            mangaId,
            name: !chapterName ? "" : decodeHTMLEntity(chapterName),
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            volume,
            chapNum,
            time: date,
            // @ts-ignore
            sortingIndex: (((volume !== null && volume !== void 0 ? volume : 0) > 0 && !isNaN(volume)) ? volume : 999) * 100000000 + chapNum,
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    var _a;
    const pages = [];
    for (const img of $("img", "div.mt-1").toArray()) {
        let image = (_a = img.attribs["src"]) !== null && _a !== void 0 ? _a : "";
        if (typeof image == "undefined" || image.startsWith("data"))
            image = img.attribs["data-src"];
        if (!image || image.startsWith("data"))
            throw new Error(`Unable to parse image(s) for chapterID: ${chapterId}`);
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
    for (const manga of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
        const id = (_b = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.replace("/manga/", "")) !== null && _b !== void 0 ? _b : "";
        const date = $('.list-group-item > span', manga).text().trim();
        const mangaDate = parseDate(date);
        if (!id)
            continue;
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
        loadMore
    };
};
exports.parseUpdatedManga = parseUpdatedManga;
const parseHomeSections = ($, sections, sectionCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    for (const section of sections)
        sectionCallback(section);
    //Top Manga Updates
    const topMangaUpdate = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(0)).toArray()) {
        const id = (_a = $("a", $("div.poster-container", manga)).attr('href')) === null || _a === void 0 ? void 0 : _a.replace("/manga/", "");
        const title = (_b = $("a", $("div.poster-container", manga)).attr('title')) === null || _b === void 0 ? void 0 : _b.trim();
        const image = getImageSrc($("img", $("div.poster-container", manga)));
        let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim();
        const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
        let subtitle = "";
        if (chapRegex && chapRegex[1])
            subtitle = chapRegex[1];
        subtitle ? subtitle = "Chapter " + subtitle : "";
        if (!id || !title)
            continue;
        topMangaUpdate.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[0].items = topMangaUpdate;
    sectionCallback(sections[0]);
    //New Trending Manga
    const NewTrendingManga = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(1)).toArray()) {
        const id = (_c = $("a", $("div.poster-container", manga)).attr('href')) === null || _c === void 0 ? void 0 : _c.replace("/manga/", "");
        const title = (_d = $("a", $("div.poster-container", manga)).attr('title')) === null || _d === void 0 ? void 0 : _d.trim();
        const image = getImageSrc($("img", $("div.poster-container", manga)));
        let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim();
        const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
        let subtitle = "";
        if (chapRegex && chapRegex[1])
            subtitle = chapRegex[1];
        subtitle ? subtitle = "Chapter " + subtitle : "";
        if (!id || !title)
            continue;
        NewTrendingManga.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[1].items = NewTrendingManga;
    sectionCallback(sections[1]);
    //Hot Manga
    const HotManga = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(2)).toArray()) {
        const id = (_e = $("a", $("div.poster-container", manga)).attr('href')) === null || _e === void 0 ? void 0 : _e.replace("/manga/", "");
        const title = (_f = $("a", $("div.poster-container", manga)).attr('title')) === null || _f === void 0 ? void 0 : _f.trim();
        const image = getImageSrc($("img", $("div.poster-container", manga)));
        let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim();
        const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
        let subtitle = "";
        if (chapRegex && chapRegex[1])
            subtitle = chapRegex[1];
        subtitle ? subtitle = "Chapter " + subtitle : "";
        if (!id || !title)
            continue;
        HotManga.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[2].items = HotManga;
    sectionCallback(sections[2]);
    //New Manga
    const NewManga = [];
    for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(3)).toArray()) {
        const id = (_g = $("a", $("div.poster-container", manga)).attr('href')) === null || _g === void 0 ? void 0 : _g.replace("/manga/", "");
        const title = (_h = $("a", $("div.poster-container", manga)).attr('title')) === null || _h === void 0 ? void 0 : _h.trim();
        const image = getImageSrc($("img", $("div.poster-container", manga)));
        let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim();
        const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
        let subtitle = "";
        if (chapRegex && chapRegex[1])
            subtitle = chapRegex[1];
        subtitle ? subtitle = "Chapter " + subtitle : "";
        if (!id || !title)
            continue;
        NewManga.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[3].items = NewManga;
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
    var _a, _b, _c, _d;
    const mangas = [];
    for (const manga of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
        const id = (_b = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.replace("/manga/", "")) !== null && _b !== void 0 ? _b : "";
        const title = (_c = $("a", manga).attr('title')) === null || _c === void 0 ? void 0 : _c.trim();
        const image = getImageSrc($("img", manga));
        let subtitle = (_d = $("a", $("li.list-group-item", manga)).text().trim()) !== null && _d !== void 0 ? _d : "";
        subtitle ? subtitle = "Chapter " + subtitle : "";
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
exports.parseSearch = parseSearch;
const parseViewMore = ($) => {
    var _a, _b, _c, _d;
    const mangas = [];
    for (const manga of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
        const id = (_b = (_a = $("a", manga).attr('href')) === null || _a === void 0 ? void 0 : _a.replace("/manga/", "")) !== null && _b !== void 0 ? _b : "";
        const title = (_c = $("a", manga).attr('title')) === null || _c === void 0 ? void 0 : _c.trim();
        const image = getImageSrc($("img", manga));
        let subtitle = (_d = $("a", $("li.list-group-item", manga)).text().trim()) !== null && _d !== void 0 ? _d : "";
        subtitle ? subtitle = "Chapter " + subtitle : "";
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
const parseTags = ($) => {
    var _a, _b;
    const arrayTags = [];
    for (const tag of $("div.col-6.col-md-4.py-2").toArray()) {
        const label = $("a", tag).text().trim();
        const id = encodeURI((_b = (_a = $("a", tag).attr("href")) === null || _a === void 0 ? void 0 : _a.replace("/genre/", "")) !== null && _b !== void 0 ? _b : "");
        if (!id || !label)
            continue;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    return tagSections;
};
exports.parseTags = parseTags;
const isLastPage = ($) => {
    let isLast = false;
    const pages = [];
    for (const page of $("li.page-item").toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p))
            continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($("li.page-item.active").text().trim());
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
        time = new Date(date);
    }
    return time;
};
const decodeHTMLEntity = (str) => {
    return entities.decodeHTML(str);
};
const getImageSrc = (imageObj) => {
    var _a, _b, _c;
    let image = "";
    if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('src')) != "undefined" || (image === null || image === void 0 ? void 0 : image.startsWith("data"))) {
        image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('src');
    }
    if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset src')) != "undefined" || (image === null || image === void 0 ? void 0 : image.startsWith("data"))) {
        image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset src');
    }
    if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-splide-lazy')) != "undefined" || (image === null || image === void 0 ? void 0 : image.startsWith("data"))) {
        image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-splide-lazy');
    }
    if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src')) != "undefined" || (image === null || image === void 0 ? void 0 : image.startsWith("data"))) {
        image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src');
    }
    if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) != "undefined" || (image === null || image === void 0 ? void 0 : image.startsWith("data"))) {
        image = (_b = (_a = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) !== null && _b !== void 0 ? _b : '';
    }
    if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src')) != "undefined" || (image === null || image === void 0 ? void 0 : image.startsWith("data"))) {
        image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src');
    }
    return encodeURI(decodeURI(decodeHTMLEntity((_c = image === null || image === void 0 ? void 0 : image.trim()) !== null && _c !== void 0 ? _c : '')));
};
