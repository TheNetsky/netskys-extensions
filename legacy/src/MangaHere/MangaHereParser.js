"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseTags = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c;
    const tagRegexp = new RegExp('\\/directory\\/(.*)\\/');
    const details = $('.detail-info');
    const title = $('span.detail-info-right-title-font', details).text().trim();
    const image = (_a = $('.detail-info-cover-img', $('.detail-info-cover')).attr('src')) !== null && _a !== void 0 ? _a : '';
    const rating = $('span.item-score', details).text().trim().replace(',', '.');
    const author = $('p.detail-info-right-say a', details).text().trim();
    const description = $('p.fullcontent').text().trim();
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("a", ".detail-info-right-tag-list").toArray()) {
        const id = (_c = (_b = $(tag).attr('href')) === null || _b === void 0 ? void 0 : _b.match(tagRegexp)[1]) !== null && _c !== void 0 ? _c : "";
        const label = $(tag).text().trim();
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $('.detail-info-right-title-tip', details).text().trim();
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
        titles: [title],
        image,
        rating: Number(rating),
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
    const rawChapters = $('div#chapterlist ul li').children('a').toArray().reverse();
    const chapterIdRegex = new RegExp('\\/manga\\/[a-zA-Z0-9_]*\\/(.*)\\/');
    const chapterNumberRegex = new RegExp('c([0-9.]+)');
    for (const elem of rawChapters) {
        const title = (_a = $('p.title3', elem).html()) !== null && _a !== void 0 ? _a : '';
        const date = parseDate((_b = $('p.title2', elem).html()) !== null && _b !== void 0 ? _b : '');
        const chapterId = elem.attribs['href'].match(chapterIdRegex)[1];
        const chapterNumber = (_c = chapterId.match(chapterNumberRegex)[1]) !== null && _c !== void 0 ? _c : 0;
        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: title,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            chapNum: Number(chapterNumber),
            time: date,
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    const pages = [];
    const rawPages = $('div#viewer').children('img').toArray();
    if (!$('div#viewer').length)
        pages.push("https://i.imgur.com/8WoVeWv.png"); //Fallback in case the manga is licensed
    for (const page of rawPages) {
        let url = page.attribs['data-original'];
        if (url.startsWith("//")) {
            url = "https:" + url;
        }
        pages.push(url);
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
    const idRegExp = new RegExp('\\/manga\\/(.*)\\/');
    const panel = $(".manga-list-4.mt15");
    for (const obj of $('.manga-list-4-list > li', panel).toArray()) {
        const id = (_b = (_a = $('a', obj).first().attr('href')) === null || _a === void 0 ? void 0 : _a.match(idRegExp)[1]) !== null && _b !== void 0 ? _b : "";
        const dateContext = $('.manga-list-4-item-subtitle', $(obj));
        const date = $('span', dateContext).text();
        const mangaDate = parseDate(date);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    for (const section of sections)
        sectionCallback(section);
    const hotManga = [];
    const beingReadManga = [];
    const newManga = [];
    const latestManga = [];
    const idRegExp = new RegExp('\\/manga\\/(.*)\\/');
    const firstSection = $('div.main-large').first();
    const hotMangas = $('.manga-list-1', firstSection).first();
    const beingReadMangas = hotMangas.next();
    const newMangas = $('ul.manga-list-1-list');
    const latestMangas = $('ul.manga-list-4-list');
    for (const manga of $('li', hotMangas).toArray()) {
        const id = (_b = (_a = $('a', manga).first().attr('href')) === null || _a === void 0 ? void 0 : _a.match(idRegExp)[1]) !== null && _b !== void 0 ? _b : "";
        const image = (_c = $('img', manga).first().attr('src')) !== null && _c !== void 0 ? _c : "";
        const title = $('.manga-list-1-item-title', manga).text().trim();
        const subtitle = $('.manga-list-1-item-subtitle', manga).text().trim();
        if (!id || !title)
            continue;
        hotManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[0].items = hotManga;
    sectionCallback(sections[0]);
    for (const manga of $('li', beingReadMangas).toArray()) {
        const id = (_e = (_d = $('a', manga).first().attr('href')) === null || _d === void 0 ? void 0 : _d.match(idRegExp)[1]) !== null && _e !== void 0 ? _e : "";
        const image = (_f = $('img', manga).first().attr('src')) !== null && _f !== void 0 ? _f : "";
        const title = $('.manga-list-1-item-title', manga).text().trim();
        const subtitle = $('.manga-list-1-item-subtitle', manga).text().trim();
        if (!id || !title)
            continue;
        beingReadManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[1].items = beingReadManga;
    sectionCallback(sections[1]);
    for (const manga of $('li', newMangas).toArray()) {
        const id = (_h = (_g = $('a', manga).first().attr('href')) === null || _g === void 0 ? void 0 : _g.match(idRegExp)[1]) !== null && _h !== void 0 ? _h : "";
        const image = (_j = $('img', manga).first().attr('src')) !== null && _j !== void 0 ? _j : "";
        const title = $('.manga-list-1-item-title', manga).text().trim();
        const subtitle = $('.manga-list-1-item-subtitle', manga).text().trim();
        if (!id || !title)
            continue;
        newManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[2].items = newManga;
    sectionCallback(sections[2]);
    for (const manga of $('.manga-list-4-list > li', latestMangas).toArray()) {
        const id = (_l = (_k = $('a', manga).first().attr('href')) === null || _k === void 0 ? void 0 : _k.match(idRegExp)[1]) !== null && _l !== void 0 ? _l : "";
        const image = (_m = $('img', manga).first().attr('src')) !== null && _m !== void 0 ? _m : "";
        const title = $('.manga-list-4-item-title', manga).text().trim();
        const subtitle = $('.manga-list-4-item-subtitle', manga).text().trim();
        if (!id || !title)
            continue;
        latestManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[3].items = latestManga;
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
    const mangas = [];
    const collectedIds = [];
    const idRegExp = new RegExp('\\/manga\\/(.*)\\/');
    $('ul.manga-list-4-list').children('li').each((index, manga) => {
        var _a, _b, _c;
        const id = (_b = (_a = $('a', manga).first().attr('href')) === null || _a === void 0 ? void 0 : _a.match(idRegExp)[1]) !== null && _b !== void 0 ? _b : "";
        const image = (_c = $('img', manga).first().attr('src')) !== null && _c !== void 0 ? _c : "";
        const title = $('p.manga-list-4-item-title a', manga).first().text().trim();
        const tips = $('p.manga-list-4-item-tip', manga).toArray();
        const author = $('a', tips[0]).text().trim();
        const lastUpdate = $('a', tips[1]).text().trim();
        const shortDesc = $(tips[2]).text().trim();
        if (!id || !title)
            return;
        if (!collectedIds.includes(id)) {
            mangas.push(createMangaTile({
                id,
                image: image,
                title: createIconText({ text: title !== null && title !== void 0 ? title : '' }),
                subtitleText: createIconText({ text: author !== null && author !== void 0 ? author : '' }),
                primaryText: createIconText({ text: shortDesc !== null && shortDesc !== void 0 ? shortDesc : '' }),
                secondaryText: createIconText({ text: lastUpdate !== null && lastUpdate !== void 0 ? lastUpdate : '' }),
            }));
            collectedIds.push(id);
        }
    });
    return mangas;
};
exports.parseSearch = parseSearch;
const parseViewMore = ($, homepageSectionId) => {
    var _a, _b, _c, _d, _e, _f;
    const manga = [];
    const idRegExp = new RegExp('\\/manga\\/(.*)\\/');
    if (homepageSectionId === "latest_updates") {
        const collectedIds = [];
        const panel = $(".manga-list-4.mt15");
        for (const p of $('.manga-list-4-list > li', panel).toArray()) {
            const id = (_b = (_a = $('a', p).first().attr('href')) === null || _a === void 0 ? void 0 : _a.match(idRegExp)[1]) !== null && _b !== void 0 ? _b : "";
            const image = (_c = $('img', p).first().attr('src')) !== null && _c !== void 0 ? _c : "";
            const title = $('.manga-list-4-item-title', p).text().trim();
            const subtitle = $('.manga-list-4-item-subtitle', p).text().trim();
            if (!id || !title)
                continue;
            if (!collectedIds.includes(id)) {
                manga.push(createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: subtitle }),
                }));
                collectedIds.push(id);
            }
        }
        return manga;
    }
    else {
        const collectedIds = [];
        const panel = $('.manga-list-1');
        for (const p of $('li', panel).toArray()) {
            const id = (_e = (_d = $('a', p).first().attr('href')) === null || _d === void 0 ? void 0 : _d.match(idRegExp)[1]) !== null && _e !== void 0 ? _e : "";
            const image = (_f = $('img', p).first().attr('src')) !== null && _f !== void 0 ? _f : '';
            const title = $('.manga-list-1-item-title', p).text().trim();
            const subtitle = $('.manga-list-1-item-subtitle', p).text().trim();
            if (!id || !title)
                continue;
            if (!collectedIds.includes(id)) {
                manga.push(createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: subtitle }),
                }));
                collectedIds.push(id);
            }
        }
        return manga;
    }
};
exports.parseViewMore = parseViewMore;
const parseTags = ($) => {
    var _a;
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] })];
    for (const p of $('a', $(".tag-box", `.browse-bar-filter-list-line-content`)).toArray()) {
        tagSections[0].tags.push(createTag({ id: (_a = $(p).text()) !== null && _a !== void 0 ? _a : '', label: $(p).text() }));
    }
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
const isLastPage = ($) => {
    let isLast = false;
    const pages = [];
    for (const page of $("a", ".pager-list-left").toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p))
            continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($("a.active", ".pager-list-left").text().trim());
    if (currentPage >= lastPage)
        isLast = true;
    return isLast;
};
exports.isLastPage = isLastPage;
