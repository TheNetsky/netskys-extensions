import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

const entities = require("entities");

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push(decodeHTMLEntity($("span.post-name", "div.card-body").text().trim())); //Main English Title
  titles.push(decodeHTMLEntity($("h2.post-name-jp.h5", "div.row").text().trim())); //Japanese Title
  titles.push(decodeHTMLEntity($("h2.h6", "div.row").text().trim())); //Kanji Title

  const image = getImageSrc($("img", "div.col-md-5.col-lg-4.text-center"));
  const description = decodeHTMLEntity($("div.manga-description.entry").text().trim());

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("div.post-info > span > a[href*=genre]").toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($(tag).attr("href")?.replace("/genre/", "") ?? "");
    if (!id || !label) continue;
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $("span:contains(Status:)", "div.post-info").text().split(":")[1].trim();
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
    author: "Unknown", //MangaJar doesn't display the author(s) on their website
    tags: tagSections,
    desc: description,
    //hentai: hentai
    hentai: false //MangaDex down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const chapter of $("li.list-group-item.chapter-item").toArray()) {
    const id = $("a", chapter).attr('href')?.replace(`/manga/${mangaId}/chapter/`, "") ?? "";
    const date = parseDate($("span.chapter-date", chapter).text().trim());
    const chapterRaw = $("span.chapter-title", chapter).text().trim();
    const chapRegex = chapterRaw.match(/(\d+\.?\_?\d?)/);
    let chapterNumber: number = 0;
    if (chapRegex && chapRegex[1]) chapterNumber = Number(chapRegex[1]);
    const chapterName = $("span.chapter-title", chapter).parent().contents().remove().last().text().trim();
    if (!id) continue;

    chapters.push(createChapter({
      id,
      mangaId,
      name: !chapterName ? "" : decodeHTMLEntity(chapterName),
      langCode: LanguageCode.ENGLISH,
      chapNum: chapterNumber,
      time: date,
    }));
  }
  return chapters;
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
  const pages: string[] = [];

  for (const img of $("img", "div.mt-1").toArray()) {
    let image = img.attribs["src"] ?? "";
    if (typeof image == "undefined" || image.startsWith("data")) image = img.attribs["data-src"];
    if (!image || image.startsWith("data")) throw new Error(`Unable to parse image(s) for chapterID: ${chapterId}`);
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

export interface UpdatedManga {
  ids: string[];
  loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];
  let loadMore = true;

  for (const manga of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
    const id = $("a", manga).attr('href')?.replace("/manga/", "") ?? "";
    const date = $('.list-group-item > span', manga).text().trim();
    const mangaDate = parseDate(date);
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
  //Top Manga Updates
  const topMangaUpdate: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(0)).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.replace("/manga/", "");
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    const image = getImageSrc($("img", $("div.poster-container", manga)));
    let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim()
    const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
    let subtitle = "";
    if (chapRegex && chapRegex[1]) subtitle = chapRegex[1];
    subtitle ? subtitle = "Chapter " + subtitle : "";
    if (!id || !title) continue;

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
  const NewTrendingManga: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(1)).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.replace("/manga/", "");
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    const image = getImageSrc($("img", $("div.poster-container", manga)));
    let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim()
    const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
    let subtitle = "";
    if (chapRegex && chapRegex[1]) subtitle = chapRegex[1];
    subtitle ? subtitle = "Chapter " + subtitle : "";
    if (!id || !title) continue;

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
  const HotManga: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(2)).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.replace("/manga/", "");
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    const image = getImageSrc($("img", $("div.poster-container", manga)));
    let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim()
    const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
    let subtitle = "";
    if (chapRegex && chapRegex[1]) subtitle = chapRegex[1];
    subtitle ? subtitle = "Chapter " + subtitle : "";
    if (!id || !title) continue;

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
  const NewManga: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.row.splider").get(3)).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.replace("/manga/", "");
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    const image = getImageSrc($("img", $("div.poster-container", manga)));
    let subtitleRaw = $("a", $("div.manga-mini-last-chapter", manga)).text().trim()
    const chapRegex = subtitleRaw.match(/(\d+\.?\_?\d?)/);
    let subtitle = "";
    if (chapRegex && chapRegex[1]) subtitle = chapRegex[1];
    subtitle ? subtitle = "Chapter " + subtitle : "";
    if (!id || !title) continue;

    NewManga.push(createMangaTile({
      id: id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[3].items = NewManga;
  sectionCallback(sections[3]);

  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
    const id = $("a", manga).attr('href')?.replace("/manga/", "") ?? "";
    const title = $("a", manga).attr('title')?.trim();
    const image = getImageSrc($("img", manga))
    let subtitle = $("a", $("li.list-group-item", manga)).text().trim() ?? "";
    subtitle ? subtitle = "Chapter " + subtitle : "";
    if (!id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  return mangas;
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
    const id = $("a", manga).attr('href')?.replace("/manga/", "") ?? "";
    const title = $("a", manga).attr('title')?.trim();
    const image = getImageSrc($("img", manga));
    let subtitle = $("a", $("li.list-group-item", manga)).text().trim() ?? "";
    subtitle ? subtitle = "Chapter " + subtitle : "";
    if (!id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  return mangas;
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const arrayTags: Tag[] = [];
  for (const tag of $("div.col-6.col-md-4.py-2").toArray()) {
    const label = $("a", tag).text().trim();
    const id = encodeURI($("a", tag).attr("href")?.replace("/genre/", "") ?? "");
    if (!id || !label) continue;
    arrayTags.push({ id: id, label: label });
  } const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
  return tagSections;
}

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = false;
  const pages = [];
  for (const page of $("li.page-item").toArray()) {
    const p = Number($(page).text().trim());
    if (isNaN(p)) continue;
    pages.push(p);
  }
  const lastPage = Math.max(...pages);
  const currentPage = Number($("li.page-item.active").text().trim());
  if (currentPage >= lastPage) isLast = true;
  return isLast;
}

const parseDate = (date: string): Date => {
  date = date.toUpperCase();
  let time: Date;
  let number: number = Number((/\d*/.exec(date) ?? [])[0]);
  if (date.includes("LESS THAN AN HOUR") || date.includes("JUST NOW")) {
    time = new Date(Date.now());
  } else if (date.includes("YEAR") || date.includes("YEARS")) {
    time = new Date(Date.now() - (number * 31556952000));
  } else if (date.includes("MONTH") || date.includes("MONTHS")) {
    time = new Date(Date.now() - (number * 2592000000));
  } else if (date.includes("WEEK") || date.includes("WEEKS")) {
    time = new Date(Date.now() - (number * 604800000));
  } else if (date.includes("YESTERDAY")) {
    time = new Date(Date.now() - 86400000);
  } else if (date.includes("DAY") || date.includes("DAYS")) {
    time = new Date(Date.now() - (number * 86400000));
  } else if (date.includes("HOUR") || date.includes("HOURS")) {
    time = new Date(Date.now() - (number * 3600000));
  } else if (date.includes("MINUTE") || date.includes("MINUTES")) {
    time = new Date(Date.now() - (number * 60000));
  } else if (date.includes("SECOND") || date.includes("SECONDS")) {
    time = new Date(Date.now() - (number * 1000));
  } else {
    time = new Date(date);
  }
  return time;
}

const decodeHTMLEntity = (str: string): string => {
  return entities.decodeHTML(str);
}

const getImageSrc = (imageObj: Cheerio | undefined): string => {
  let image: any = "";

  if (typeof imageObj?.attr('src') != "undefined" || image?.startsWith("data")) {
    image = imageObj?.attr('src');
  }
  if (typeof imageObj?.attr('srcset src') != "undefined" || image?.startsWith("data")) {
    image = imageObj?.attr('srcset src');
  }
  if (typeof imageObj?.attr('data-splide-lazy') != "undefined" || image?.startsWith("data")) {
    image = imageObj?.attr('data-splide-lazy');
  }
  if (typeof imageObj?.attr('data-lazy-src') != "undefined" || image?.startsWith("data")) {
    image = imageObj?.attr('data-lazy-src');
  }
  if (typeof imageObj?.attr('srcset') != "undefined" || image?.startsWith("data")) {
    image = imageObj?.attr('srcset')?.split(' ')[0] ?? '';
  }
  if (typeof imageObj?.attr('data-src') != "undefined" || image?.startsWith("data")) {
    image = imageObj?.attr('data-src');
  }
  return encodeURI(decodeURI(decodeHTMLEntity(image?.trim() ?? '')));
}