"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseTags = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c;
    const titles = [];
    titles.push($('h1.heading').first().text().trim());
    const altTitles = $('div.alt_name').text().split(";");
    for (const t of altTitles) {
        titles.push(t.trim());
    }
    const image = (_a = $('div.media div.cover img').attr('src')) !== null && _a !== void 0 ? _a : "";
    const author = $('.author').text().trim();
    const description = $('.summary > p').text().trim();
    let hentai = false;
    const arrayTags = [];
    for (const tag of $(".genres > a").toArray()) {
        const label = $(tag).text().trim();
        const id = (_c = (_b = $(tag).attr('href')) === null || _b === void 0 ? void 0 : _b.split("genre/")[1]) !== null && _c !== void 0 ? _c : "";
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $('.value.status').text().trim();
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
        artist: "",
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
    const chapterNumberRegex = new RegExp('c([0-9.]+)');
    for (const elem of $('tr:has(.chapter)').toArray()) {
        const title = $("a", elem).text();
        const date = new Date((_a = $('.update_time', elem).text()) !== null && _a !== void 0 ? _a : '');
        const chapterId = (_c = (_b = $('a', elem).attr('href')) === null || _b === void 0 ? void 0 : _b.split('/').pop()) !== null && _c !== void 0 ? _c : '';
        const chapterNumber = Number("0" + chapterId.match(chapterNumberRegex)[1]);
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
    const imageArrayRegex = RegExp('var ytaw=\\[([^\\[]*)]');
    for (const scriptObj of $('script').toArray()) {
        let script = (_a = scriptObj.children[0]) === null || _a === void 0 ? void 0 : _a.data;
        if (typeof script === 'undefined')
            continue;
        if (script.includes("var ytaw=")) {
            const array = script.match(imageArrayRegex)[1];
            const img = array.replace(/''?/g, '').split(",");
            for (const i of img) {
                if (i == '')
                    continue;
                pages.push(i);
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
    var _a, _b;
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] })];
    for (const p of $(".wrap_item").toArray()) {
        const label = $('a', p).first().text().trim();
        const id = (_b = (_a = $('a', p).attr("href")) === null || _a === void 0 ? void 0 : _a.split("genre/")[1]) !== null && _b !== void 0 ? _b : "";
        tagSections[0].tags.push(createTag({ id: id, label: label }));
    }
    return tagSections;
};
exports.parseTags = parseTags;
const parseUpdatedManga = ($, time, ids) => {
    var _a, _b;
    const updatedManga = [];
    let loadMore = true;
    for (const manga of $('div.item', 'div#book_list').toArray()) {
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
        const mangaDate = new Date($('.update_time', manga).first().text());
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    for (const section of sections)
        sectionCallback(section);
    //Hot Mango Update
    const hotMangaUpdate = [];
    for (const manga of $('div.item', 'div#hot_update').toArray()) {
        const title = $('.title', manga).text().trim();
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
        const image = (_c = $('img', manga).first().attr('src')) !== null && _c !== void 0 ? _c : "";
        const subtitle = $('.chapter', manga).first().text().trim();
        if (!id || !title)
            continue;
        hotMangaUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[0].items = hotMangaUpdate;
    sectionCallback(sections[0]);
    //Hot Mango
    const hotManga = [];
    for (const manga of $('div.item', 'div#hot_book').toArray()) {
        const title = $('.title', manga).text().trim();
        const id = (_e = (_d = $('a', manga).attr('href')) === null || _d === void 0 ? void 0 : _d.split('/').pop()) !== null && _e !== void 0 ? _e : '';
        const image = (_f = $("img", manga).attr('data-src')) !== null && _f !== void 0 ? _f : "";
        const subtitle = $('.chapter', manga).first().text().trim();
        if (!id || !title)
            continue;
        hotManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[1].items = hotManga;
    sectionCallback(sections[1]);
    //Latest Mango
    const latestManga = [];
    for (const manga of $('div.item', 'div#book_list').toArray()) {
        const title = $('.title', manga).text().trim();
        const id = (_h = (_g = $('a', manga).attr('href')) === null || _g === void 0 ? void 0 : _g.split('/').pop()) !== null && _h !== void 0 ? _h : '';
        const image = (_j = $('img', manga).first().attr('src')) !== null && _j !== void 0 ? _j : "";
        const subtitle = $('.chapter', manga).first().text().trim();
        if (!id || !title)
            continue;
        latestManga.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: title }),
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const mangas = [];
    const collectedIds = [];
    if ((_a = $('meta[property="og:url"]').attr('content')) === null || _a === void 0 ? void 0 : _a.includes("/manga/")) {
        const title = (_b = $('h1.heading').first().text().trim()) !== null && _b !== void 0 ? _b : "";
        const id = (_e = (_d = (_c = $('meta[property$=url]').attr('content')) === null || _c === void 0 ? void 0 : _c.split('/')) === null || _d === void 0 ? void 0 : _d.pop()) !== null && _e !== void 0 ? _e : "";
        const image = (_f = $('div.media div.cover img').attr('src')) !== null && _f !== void 0 ? _f : "";
        if (!collectedIds.includes(id) && id && title) {
            mangas.push(createMangaTile({
                id,
                image: image,
                title: createIconText({ text: title }),
            }));
            collectedIds.push(id);
        }
    }
    else {
        for (const manga of $("div.item", "#book_list").toArray()) {
            const title = $('.title a', manga).text().trim();
            const id = (_h = (_g = $('a', manga).attr('href')) === null || _g === void 0 ? void 0 : _g.split('/').pop()) !== null && _h !== void 0 ? _h : '';
            const image = (_j = $("img", manga).attr('src')) !== null && _j !== void 0 ? _j : "";
            const subtitle = $('.chapter', manga).first().text().trim();
            if (!collectedIds.includes(id) && id && title) {
                mangas.push(createMangaTile({
                    id,
                    image: image,
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: subtitle }),
                }));
                collectedIds.push(id);
            }
            ;
        }
    }
    return mangas;
};
exports.parseSearch = parseSearch;
const parseViewMore = ($, homepageSectionId) => {
    var _a, _b, _c;
    const manga = [];
    for (const p of $('div.item', 'div#book_list').toArray()) {
        const title = $('.title a', p).text().trim();
        const id = (_b = (_a = $('a', p).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
        const image = (_c = $("img", p).attr('src')) !== null && _c !== void 0 ? _c : "";
        const subtitle = $('.chapter', p).first().text().trim();
        if (!id || !title)
            continue;
        manga.push(createMangaTile({
            id,
            image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    return manga;
};
exports.parseViewMore = parseViewMore;
const isLastPage = ($) => {
    let isLast = true;
    let hasNext = Boolean($("a.next.page-numbers", 'ul.uk-pagination').text());
    if (hasNext)
        isLast = false;
    return isLast;
};
exports.isLastPage = isLastPage;
