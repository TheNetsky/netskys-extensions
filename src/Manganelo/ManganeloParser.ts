import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

const entities = require("entities");

export interface UpdatedManga {
  ids: string[],
  loadMore: boolean;
}

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
  const panel = $("div.panel-story-info");

  const titles = [];
  titles.push(decodeHTMLEntity($(".img-loading", panel).attr("title") ?? "")); //Main English title

  if ($("i.info-alternative")?.parent()?.next().length) { //Check if .parent() and .next() aren't null
    const altTitles = $("i.info-alternative").parent().next().text()?.split(/,|;/);
    for (const title of altTitles) {
      if (title == "") continue;
      titles.push(decodeHTMLEntity(title.trim()));
    }
  }

  let author = "Unknown";
  if ($("i.info-author")?.parent()?.next().length) {
    author = $("i.info-author").parent().next().text().replace(/\s-\s/g, ", ").trim();
  }
  const image = $(".img-loading", panel).attr("src") ?? "";
  const description = decodeHTMLEntity($("div.panel-story-info-description", panel).contents().remove().last().text().trim());

  let hentai = false;

  const arrayTags: Tag[] = [];
  if ($("a", $("i.info-genres").parent().next()).length) {
    for (const tag of $("a", $("i.info-genres").parent().next()).toArray()) {
      const label = $(tag).text().trim();
      const id = encodeURI($(tag).attr("href")?.split('/').pop()?.replace(/\/$/, "") ?? "");
      if (!id || !label) continue;
      if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
      arrayTags.push({ id: id, label: label });
    }
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  let rawStatus = "ONGOING";
  if ($("i.info-status").parent().next().length) {
    rawStatus = $("i.info-status").parent().next().text().trim();
  }

  let status = MangaStatus.ONGOING;
  switch (rawStatus.toUpperCase()) {
    case 'ONGOING':
      status = MangaStatus.ONGOING;
      break;
    case 'COMPLETED':
      status = MangaStatus.COMPLETED;
      break;
    default:
      status = MangaStatus.ONGOING;
      break;
  }

  return createManga({
    id: mangaId,
    titles: titles,
    image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
    rating: 0,
    status: status,
    author: author ?? "",
    artist: author ?? "",
    tags: tagSections,
    desc: description ?? "",
    //hentai: hentai
    hentai: false //MangaDex down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const chapter of $("li", "ul.row-content-chapter").toArray()) {
    const title = decodeHTMLEntity($("a.chapter-name", chapter).text().trim());
    const id = $("a", chapter).attr('href')?.split('/').pop() ?? "";
    const date = new Date($('span.chapter-time', chapter).attr("title") ?? "");
    const chapRegex = title.match(/(\d+\.?\_?\d?)/);
    let chapterNumber: number = 0;
    if (chapRegex && chapRegex[1]) chapterNumber = Number(chapRegex[1].replace(/\\/g, "."));
    if (!id) continue;
    chapters.push(createChapter({
      id: id,
      mangaId,
      name: title,
      langCode: LanguageCode.ENGLISH,
      chapNum: chapterNumber,
      time: date,
    }));
  }
  return chapters;
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
  const pages: string[] = [];

  for (const p of $("img", "div.container-chapter-reader").toArray()) {
    let image = $(p).attr("src") ?? "";
    if (!image) image = $(p).attr("data-src") ?? "";
    if (!image) throw new Error(`Unable to parse image(s) for chapterID: ${chapterId}`);
    pages.push(image);
  }
  const chapterDetails = createChapterDetails({
    id: chapterId,
    mangaId: mangaId,
    pages: pages,
    longStrip: false
  });

  return chapterDetails;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];
  let loadMore = true;

  for (const manga of $("div.content-genres-item", "div.panel-content-genres").toArray()) {
    const id = $("a", manga).attr('href')?.split('/').pop()?.replace(/\/$/, "") ?? "";
    const mangaDate = new Date($("span.genres-item-time", manga).text().trim() ?? "");
    if (!id) continue;
    if (mangaDate > time) {
      if (ids.includes(id)) {
        updatedManga.push(id);
      }
    } else {
      loadMore = false;
    }
  }
  return {
    ids: updatedManga,
    loadMore
  }
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section);

  //Top Week
  const TopWeek: MangaTile[] = [];
  for (const manga of $("div.item", ".owl-carousel").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $('a.text-nowrap', manga).attr('href')?.split('/').pop();
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle = $("a.text-nowrap.a-h", manga).last().text().trim();
    if (!id || !title) continue;
    TopWeek.push(createMangaTile({
      id: id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[0].items = TopWeek;
  sectionCallback(sections[0]);

  //Latest Update
  const LatestUpdate: MangaTile[] = [];
  for (const manga of $("div.content-homepage-item", "div.panel-content-homepage").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $('a', manga).attr('href')?.split('/').pop();
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle = $("p.a-h.item-chapter > a.text-nowrap", manga).first().text().trim();
    if (!id || !title) continue;
    LatestUpdate.push(createMangaTile({
      id: id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[1].items = LatestUpdate;
  sectionCallback(sections[1]);

  //New Manga
  const NewManga: MangaTile[] = [];
  for (const manga of $("a.tooltip", "div.panel-newest-content").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $(manga).attr('href')?.split('/').pop();
    const image = $('img', manga).first().attr('src') ?? "";
    if (!id || !title) continue;
    NewManga.push(createMangaTile({
      id: id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[2].items = NewManga;
  sectionCallback(sections[2]);

  for (const section of sections) sectionCallback(section);
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  for (const manga of $("div.content-genres-item", "div.panel-content-genres").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $('a.genres-item-name', manga).attr('href')?.split('/').pop();
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle = $("a.genres-item-chap.text-nowrap", manga).last().text().trim();
    if (!id || !title) continue;
    mangas.push(createMangaTile({
      id: id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  return mangas;
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  search = search.replace(/ /g, "_");
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  const collectedIds: string[] = [];

  for (const manga of $("div.search-story-item", "div.panel-search-story").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $('a', manga).attr('href')?.split('/').pop() ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle = $("a.item-chapter", manga).first().text().trim();
    if (collectedIds.includes(id) || !id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
    collectedIds.push(id);

  }
  return mangas;
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const arrayTags: Tag[] = [];
  for (const tag of $("a.a-h.text-nowrap", "div.panel-category").toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($(tag).attr("href")?.split('/').pop()?.replace(/\/$/, "") ?? "");
    if (!id || !label) continue;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
  return tagSections;
}

export const isLastPage = ($: CheerioStatic): boolean => {
  const current = $('.page-select').text();
  let total = $('.page-last').text();

  if (current) {
    total = (/(\d+)/g.exec(total) ?? [''])[0];
    return (+total) === (+current);
  }
  return true;
}

const decodeHTMLEntity = (str: string): string => {
  return entities.decodeHTML(str);
}
