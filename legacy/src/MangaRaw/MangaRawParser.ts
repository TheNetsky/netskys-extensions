import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

const url = "https://www.manga-raw.club"

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push(decodeHTMLEntity($("h1.novel-title.text2row", "div.main-head").text().trim())); //Main English title

  const altTitles = $("h2.alternative-title.text1row", "div.main-head").text().trim().split(",");
  for (const title of altTitles) {
    titles.push(decodeHTMLEntity(title));
  }

  const author = $("span", "div.author").next().text().trim();
  const image = url + $("img", "div.fixed-img").attr('data-src');
  const description = decodeHTMLEntity($("div.content", "div.summary").text().trim());

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("li", "div.categories").toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($("a", tag).attr("href")?.trim()?.split("genre=")[1] ?? "");
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

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const c of $("li", "ul.chapter-list").toArray()) {
    const number = $("strong.chapter-title", c).text().trim().replace(/[^0-9]/g, "") ?? "";
    if (!number) continue;
    const title = "Chapter " + number;
    const id = $("a", c).attr('href')?.split("/en/")[1].replace("/", "") ?? "";
    const date = parseDate($("time.chapter-update", c).text().trim().split(",")[0]);
    const chapterNumber = Number(number ?? 0);

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
  for (const p of $("img", 'div[style="font-size: 0;"]').toArray()) {
    let image = $(p).attr("src") ?? "";
    if (!image) image = $(p).attr("data-src") ?? "";
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

  for (const obj of $("li.novel-item", "ul.novel-list.grid").toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const mangaDate = parseDate($("span", $("div.novel-stats", obj)).text().trim().split(",")[0]);
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
    loadMore,
  }
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section);

  //Trending Manga
  const trendingManga: MangaTile[] = [];
  for (const manga of $("li.novel-item", "div#popular-novel-section").toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("img", manga).attr('alt') ?? "";
    const image = $("img", manga).attr('src') ?? "";
    if (!id || !title) continue;
    trendingManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[0].items = trendingManga;
  sectionCallback(sections[0]);

  const viewedManga: MangaTile[] = [];
  for (const manga of $("li.swiper-slide.novel-item", "div#recommend-novel-slider").toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("img", manga).attr('alt') ?? "";
    const image = $("img", manga).attr('src') ?? "";
    if (!id || !title) continue;
    viewedManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }

  sections[1].items = viewedManga;
  sectionCallback(sections[1]);
  const newManga: MangaTile[] = [];
  for (const manga of $("li.novel-item", "div#updated-novel-slider").toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("a", manga).attr('title');
    const image = $("img", manga).attr('data-src') ?? "";
    if (!id || !title) continue;
    newManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[2].items = newManga;
  sectionCallback(sections[2]);

  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  const collectedIds: string[] = [];

  for (const obj of $("li.novel-item", "ul.novel-list.grid").toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("a", obj).attr('title');
    const image = url + $("img", obj).attr('data-src');
    const subtitle = "Chapter " + $("strong", $("div.novel-stats", obj)).text().trim().replace(/[^0-9]/g, "") ?? 0;
    if (!collectedIds.includes(id) && id && title) {
      mangas.push(createMangaTile({
        id,
        image: image,
        title: createIconText({ text: decodeHTMLEntity(title) }),
        subtitleText: createIconText({ text: subtitle }),
      }));
      collectedIds.push(id);
    }
  }
  return mangas;
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
  const manga: MangaTile[] = [];
  const collectedIds: string[] = [];

  for (const obj of $("li.novel-item", "ul.novel-list.grid").toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("a", obj).attr('title');
    const image =  $("img", obj).attr('data-src') ?? "";
    const subtitle = "Chapter " + $("strong", $("div.novel-stats", obj)).text().trim().replace(/[^0-9]/g, "") ?? 0;
    if (!collectedIds.includes(id) && id && title) {
      manga.push(createMangaTile({
        id,
        image: image,
        title: createIconText({ text: decodeHTMLEntity(title) }),
        subtitleText: createIconText({ text: subtitle }),
      }));
      collectedIds.push(id);
    }
  }
  return manga;
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const arrayTags: Tag[] = [];
  for (const tag of $("li", "ul.proplist").toArray()) {
    const label = $("a", tag).text().trim();
    const id = encodeURI($("a", tag).attr('href')?.split("genre=")[1]?.split("&results")[0] ?? "");
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
  return tagSections;
}

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = false;
  const pages = [];

  for (const page of $("li", "ul.pagination").toArray()) {
    const p = Number($(page).text().trim());
    if (isNaN(p)) continue;
    pages.push(p);
  }
  const lastPage = Math.max(...pages);
  const currentPage = Number($("li.active").first().text());

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
    let split = date.split("-");
    time = new Date(Number(split[2]), Number(split[0]) - 1, Number(split[1]));
  }
  return time;
}

const decodeHTMLEntity = (str: string): string => {
  return str.replace(/&#(\d+);/g, function (match, dec) {
    return String.fromCharCode(dec);
  })
}