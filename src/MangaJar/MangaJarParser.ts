import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push(decodeHTMLEntity($("span.post-name", "div.card-body").text().trim())); //Main English Title
  titles.push(decodeHTMLEntity($("h2.post-name-jp.h5", "div.row").text().trim())); //Japanese Title
  titles.push(decodeHTMLEntity($("h2.h6", "div.row").text().trim())); //Kanji Title

  const image = $("img", "div.col-md-5.col-lg-4.text-center").attr('src') ?? "";
  const rating = $("b.ratingValue.ml-1", "div.post-info").text();
  const description = decodeHTMLEntity($("div.manga-description.entry").text().trim());

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("div.post-info > span > a[href*=genre]").toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($(tag).attr("href")?.trim()?.split("/genre/")[1] ?? "");
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $("span:contains(Status:)", "div.post-info").text().trim().split(":")[1];
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
    rating: Number(rating),
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

  for (const c of $("li.list-group-item.chapter-item").toArray()) {
    const title = decodeHTMLEntity($("span.chapter-title", c).text().trim());
    const id = String($("a", c).attr('href')?.split("chapter/")[1]);
    const date = parseDate($("span.chapter-date", c).text().trim());
    const chapterNumber = Number(title.split("Chapter")[1].trim() ?? 0);

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
  const mainPage = $("div.carousel-item", "div.carousel-inner").toArray();
  const img = $("img[data-page]", mainPage).toArray();

  for (const p of img) {
    pages.push($(p).attr("data-alternative") ?? "");
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

  for (const obj of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1] ?? "";
    const dateContext = $('.list-group-item ', $(obj));
    const date = $('span', dateContext).text();
    const mangaDate = parseDate(date);
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
  for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[0]).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.split("manga/")[1];
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    let image = $("img", $("div.poster-container", manga)).attr('data-src') ?? "";
    if (!image) image = $("img", $("div.poster-container", manga)).attr('src') ?? "";
    let subtitle: any = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0] ?? "";
    subtitle = "Chapter " + subtitle;
    if (!id || !title) continue;

    topMangaUpdate.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[0].items = topMangaUpdate;
  sectionCallback(sections[0]);

  //New Trending Manga
  const NewTrendingManga: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[1]).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.split("manga/")[1];
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    let image = $("img", $("div.poster-container", manga)).attr('data-src') ?? "";
    if (!image) image = $("img", $("div.poster-container", manga)).attr('src') ?? "";
    let subtitle: any = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0] ?? "";
    subtitle = "Chapter " + subtitle;
    if (!id || !title) continue;

    NewTrendingManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[1].items = NewTrendingManga;
  sectionCallback(sections[1]);

  //Hot Manga
  const HotManga: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[2]).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.split("manga/")[1];
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    let image = $("img", $("div.poster-container", manga)).attr('data-src') ?? "";
    if (!image) image = $("img", $("div.poster-container", manga)).attr('src') ?? "";
    let subtitle: any = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0] ?? "";
    subtitle = "Chapter " + subtitle;
    if (!id || !title) continue;

    HotManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[2].items = HotManga;
  sectionCallback(sections[2]);

  //New Manga
  const NewManga: MangaTile[] = [];
  for (const manga of $("article[class*=flex-item]", $("div.row.slider.slider-with-last-chapter")[3]).toArray()) {
    const id = $("a", $("div.poster-container", manga)).attr('href')?.split("manga/")[1];
    const title = $("a", $("div.poster-container", manga)).attr('title')?.trim();
    let image = $("img", $("div.poster-container", manga)).attr('data-src') ?? "";
    if (!image) image = $("img", $("div.poster-container", manga)).attr('src') ?? "";
    let subtitle: any = $("a", $("div.manga-mini-last-chapter", manga)).text().trim().replace(/\s\s+/g, ' ').split("Chapter")[0] ?? "";
    subtitle = "Chapter " + subtitle;
    if (!id || !title) continue;

    NewManga.push(createMangaTile({
      id: id,
      image: image,
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
  for (const obj of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1] ?? "";
    const title = $("a", obj).attr('title')?.trim();

    let image = $("img", obj).attr("data-src") ?? "";
    if (!image) image = $("img", obj).attr("src") ?? "";
    let subtitle: any = $("a", $("li.list-group-item", obj)).text().trim() ?? "";
    subtitle = "Chapter " + subtitle;
    if (id && title) {
      mangas.push(createMangaTile({
        id,
        image: image,
        title: createIconText({ text: decodeHTMLEntity(title) }),
        subtitleText: createIconText({ text: subtitle }),
      }));
    }
  }
  return mangas;
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
  const manga: MangaTile[] = [];
  for (const p of $("article[class*=flex-item]", $("div.flex-container.row")).toArray()) {
    const id = $("a", p).attr('href')?.split("manga/")[1];
    const title = $("a", p).attr('title')?.trim();
    let image = $("img", p).attr("data-src") ?? "";
    if (!image) image = $("img", p).attr("src") ?? "";
    let subtitle: any = $("a", $("li.list-group-item", p)).text().trim() ?? "";
    subtitle = "Chapter " + subtitle;
    if (!id || !title) continue;
    manga.push(createMangaTile({
      id,
      image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  return manga;
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const arrayTags: Tag[] = [];
  for (const tag of $("div.col-6.col-md-4.py-2", "div.card-body").toArray()) {
    const label = $("a", tag).text().trim();
    const id = $("a", tag).attr('href')?.split("genre/")[1] ?? "";
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
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
  return str.replace(/&#(\d+);/g, function (match, dec) {
    return String.fromCharCode(dec);
  })
}

