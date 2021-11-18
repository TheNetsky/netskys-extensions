"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseViewMore = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseTags = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const FM_DOMAIN = "https://www.funmanga.com";
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c;
    const titles = [];
    titles.push($("h5.widget-heading", $("div.content-inner.inner-page")).first().text().trim());
    const altTitles = $('dt:contains("Alternative Name:")').next().text().split(";");
    for (const t of altTitles) {
        titles.push(t.trim());
    }
    const image = (_a = "https:" + $('div.col-md-4 img').attr('src')) !== null && _a !== void 0 ? _a : "";
    const author = $('dt:contains("Author:")').next().text().trim();
    const artist = $('dt:contains("Artist:")').next().text().trim();
    const description = $("div.note.note-default.margin-top-15").text().trim();
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("a", $('dt:contains("Categories:")').next()).toArray()) {
        const label = $(tag).text().trim();
        const id = (_c = (_b = $(tag).attr('href')) === null || _b === void 0 ? void 0 : _b.split("category/")[1]) !== null && _c !== void 0 ? _c : "";
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true; //Funmanga doesn't have these tags, so it'll always be false!
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $('dt:contains("Status:")').next().text().trim();
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
        image: image,
        rating: 0,
        status: status,
        author: author,
        artist: artist,
        tags: tagSections,
        desc: description,
        hentai: hentai,
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($, mangaId) => {
    var _a, _b, _c, _d, _e;
    const chapters = [];
    for (const elem of $("li", "ul.chapter-list").toArray()) {
        const title = (_b = "Chapter " + ((_a = $('a', elem).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop())) !== null && _b !== void 0 ? _b : '';
        const date = parseDate($("span.date", elem).text().trim());
        const chapterId = (_d = (_c = $('a', elem).attr('href')) === null || _c === void 0 ? void 0 : _c.split('/').pop()) !== null && _d !== void 0 ? _d : '';
        let chapterNumber = (_e = $('a', elem).attr('href')) === null || _e === void 0 ? void 0 : _e.split('/').pop();
        chapterNumber = Number((chapterNumber === null || chapterNumber === void 0 ? void 0 : chapterNumber.includes("-")) ? chapterNumber.split("-")[0] : chapterNumber);
        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: title,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            chapNum: isNaN(chapterNumber) ? 0 : chapterNumber,
            time: date,
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    var _a;
    const pages = [];
    const imageArrayRegex = RegExp('var images = \\[([^\\[]*)]');
    for (const scriptObj of $('script').toArray()) {
        let script = (_a = scriptObj.children[0]) === null || _a === void 0 ? void 0 : _a.data;
        if (typeof script === 'undefined')
            continue;
        if (script.includes("var images =")) {
            const scriptVar = script.match(imageArrayRegex)[1];
            const imgArray = JSON.parse(`[${scriptVar}]`); //kekw
            for (const img of imgArray) {
                pages.push("https:" + img.url);
            }
        }
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
const parseTags = ($) => {
    var _a, _b, _c;
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] })];
    for (const p of $("li", "ul.widget-text-list").toArray()) {
        const label = (_a = $('a', p).first().attr('title')) !== null && _a !== void 0 ? _a : "";
        const id = (_c = (_b = $('a', p).attr("href")) === null || _b === void 0 ? void 0 : _b.split("category/")[1]) !== null && _c !== void 0 ? _c : "";
        tagSections[0].tags.push(createTag({ id: id, label: label }));
    }
    return tagSections;
};
exports.parseTags = parseTags;
const parseUpdatedManga = ($, time, ids) => {
    var _a, _b;
    const updatedManga = [];
    let loadMore = true;
    for (const manga of $("dl", "div.manga_updates").toArray()) {
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
        const parseDate = $('span.time.hidden-xs', manga).text().trim().split("/");
        const mangaDate = new Date(Number(parseDate[2]), Number(parseDate[1]) - 1, Number(parseDate[0]));
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
    //Latest Mango
    const latestManga = [];
    for (const manga of $("dl", "div.manga_updates").toArray()) {
        const title = (_a = $('img', manga).first().attr('alt')) !== null && _a !== void 0 ? _a : "";
        const chapterId = (_c = (_b = $('a', manga).attr('href')) === null || _b === void 0 ? void 0 : _b.split('/').pop()) !== null && _c !== void 0 ? _c : '';
        let image = (_e = (_d = $('img', manga).first().attr('src')) === null || _d === void 0 ? void 0 : _d.split("funmanga.com")[1]) !== null && _e !== void 0 ? _e : "";
        image = FM_DOMAIN + image;
        latestManga.push(createMangaTile({
            id: chapterId,
            image: image,
            title: createIconText({ text: title }),
        }));
    }
    sections[0].items = latestManga;
    sectionCallback(sections[0]);
    //Hot Mango Update
    const hotMangaUpdate = [];
    for (const manga of $("div.item", "div.owl-carousel").toArray()) {
        const title = (_g = (_f = $('a', manga).first().attr('title')) === null || _f === void 0 ? void 0 : _f.split(/- \d+/)[0]) !== null && _g !== void 0 ? _g : "";
        const chapterId = (_j = (_h = $('a', manga).attr('href')) === null || _h === void 0 ? void 0 : _h.match(/funmanga.com\/([^/]*)/)[1]) !== null && _j !== void 0 ? _j : '';
        let image = (_l = (_k = $('img', manga).first().attr('src')) === null || _k === void 0 ? void 0 : _k.split("funmanga.com")[1]) !== null && _l !== void 0 ? _l : "";
        image = FM_DOMAIN + image;
        hotMangaUpdate.push(createMangaTile({
            id: chapterId,
            image: image,
            title: createIconText({ text: title }),
        }));
    }
    sections[1].items = hotMangaUpdate;
    sectionCallback(sections[1]);
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
const parseViewMore = ($, homepageSectionId) => {
    var _a, _b, _c, _d, _e;
    const manga = [];
    for (const p of $("dl", "div.manga_updates").toArray()) {
        const title = (_a = $('img', p).first().attr('alt')) !== null && _a !== void 0 ? _a : "";
        const id = (_c = (_b = $('a', p).attr('href')) === null || _b === void 0 ? void 0 : _b.split('/').pop()) !== null && _c !== void 0 ? _c : '';
        let image = (_e = (_d = $('img', p).first().attr('src')) === null || _d === void 0 ? void 0 : _d.split("funmanga.com")[1]) !== null && _e !== void 0 ? _e : "";
        image = FM_DOMAIN + image;
        manga.push(createMangaTile({
            id,
            image,
            title: createIconText({ text: title }),
        }));
    }
    return manga;
};
exports.parseViewMore = parseViewMore;
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
