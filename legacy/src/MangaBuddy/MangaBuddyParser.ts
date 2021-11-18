import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push(decodeHTMLEntity($("h1.novel-title").text().trim())); //Main English Title
  const altTitles = $("span:contains(Alternative :)").next().text().split(";");

  for (const title of altTitles) {
    if (!title) continue;
    titles.push(decodeHTMLEntity(title.trim()));
  }

  const image = "https:" + $("img", "figure.cover").attr('data-src') ?? "";
  const description = decodeHTMLEntity($("div.content", "div.summary").text().trim());
  const author = decodeHTMLEntity($("span:contains(Authors:)").nextAll().text().trim().replace(/\n/, ",").replace(/\s+/g, " "));

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("li", "div.categories").toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($("a", tag).attr("href")?.trim()?.split("/genres/")[1] ?? "");
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $("small:contains(Status)", "div.header-stats").prev().text().trim();
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
    image,
    rating: 0,
    status: status,
    author: author,
    tags: tagSections,
    desc: description,
    //hentai: hentai
    hentai: false //MangaDex down
  });
}

export const parseChapters = (data: any, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const chapter of data) {
    const title = chapter.name;
    const id = chapter.slug;
    const date = new Date(chapter.updated_at);
    const chapterNumber = Number(/chapter-(\d+)/.test(id) ? id.match(/chapter-(\d+)/)![1] : 0);
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

  for (const p of $("div.chapter-image", "div#chapter__content").toArray()) {
    let image = $("img", p).attr("data-src");
    if (!image) image = $("img", p).attr("src");
    pages.push("https:" + image);
  }

  const chapterDetails = createChapterDetails({
    id: chapterId,
    mangaId: mangaId,
    pages: pages,
    longStrip: false
  });

  return chapterDetails;
}

export interface UpdatedManga {
  ids: string[];
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];

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
  }
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section);

  //Latest Updates
  const latestMangaUpdate: MangaTile[] = [];
  for (const manga of $("div.latest-item", "div.section.box.grid-items").toArray()) {
    const data = JSON.parse($("script", manga).get()[0].children[0].data);
    const id = data.slug;
    const title = data.name;
    const image = "https:" + data.cover ?? "";
    const subtitle = data.updated_at_text ?? "";
    if (!id || !title) continue;
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
  const popularManga: MangaTile[] = [];
  for (const manga of $("div.trending-item", "div.section-body.popular").toArray()) {
    const id = $("a", manga).attr('href')?.replace("/", "");
    const title = $("a", manga).attr('title');
    const image = "https:" + $("img", manga).attr('data-src') ?? "";
    if (!id || !title) continue;
    popularManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[1].items = popularManga;
  sectionCallback(sections[1]);

  //Top Monthly Manga
  const topMonthlyManga: MangaTile[] = [];
  for (const manga of $("div.inner", "div#monthly").toArray()) {
    const id = $("a", manga).attr('href')?.replace("/", "");
    const title = $("h3.title", manga).text().trim();
    const image = "https:" + $("img", manga).attr('data-src') ?? "";
    const subtitle = $("h4.chap-item", manga).text().trim();
    if (!id || !title) continue;
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
  const topWeeklyManga: MangaTile[] = [];
  for (const manga of $("div.inner", "div#weekly").toArray()) {
    const id = $("a", manga).attr('href')?.replace("/", "");
    const title = $("h3.title", manga).text().trim();
    const image = "https:" + $("img", manga).attr('data-src') ?? "";
    const subtitle = $("h4.chap-item", manga).text().trim();
    if (!id || !title) continue;
    topWeeklyManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: decodeHTMLEntity(subtitle) }),
    }));
  }
  sections[3].items = topWeeklyManga;
  sectionCallback(sections[3]);

  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  for (const manga of $("div.novel-detailed-item", "div.section-body").toArray()) {
    const id = $("a", manga).attr('href')?.replace("/", "");
    const title = $("a", manga).attr('title');
    const image = "https:" + $("img", manga).attr('data-src') ?? "";
    if (!id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  return mangas;
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  for (const manga of $("div.novel-detailed-item", "div.section-body").toArray()) {
    const id = $("a", manga).attr('href')?.replace("/", "");
    const title = $("a", manga).attr('title');
    const image = "https:" + $("img", manga).attr('data-src') ?? "";
    if (!id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  return mangas;
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const arrayTags: Tag[] = [];
  for (const tag of $("div.category-item-wrapper", "div.section__categories").toArray()) {
    const label = $("a", tag).text().trim();
    const id = $("a", tag).attr('href')?.split("genres/")[1] ?? "";
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
  return tagSections;
}

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = false;

  const selector = $("a:contains(❯)", "div.paginator").attr("href")
  if (!selector || selector == "") isLast = true;
  return isLast;
}

const decodeHTMLEntity = (str: string): string => {
  return str.replace(/&#(\d+);/g, function (match, dec) {
    return String.fromCharCode(dec);
  })
}

