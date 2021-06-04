import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push(decodeHTMLEntity($("h1.entry-title", "div.infox").text().trim())); //Main English title

  const altTitles = $("b:contains(Alternative Titles)").next().text().split(",");
  for (const title of altTitles) {
    titles.push(decodeHTMLEntity(title.trim()));
  }
  const author = $("b:contains(Author)").next().text().trim();
  const image = $("img", "div.thumb").attr('src') ?? "";
  const description = decodeHTMLEntity($("p", "div.wd-full").text().trim());
  const rating = $("div.num").text();

  const arrayTags: Tag[] = [];
  for (const tag of $("a", "span.mgen").toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($(tag).attr("href")?.trim()?.split("/genres/")[1].replace("/", "") ?? "");
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $("i", "div.imptdt").text().trim();
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
    rating: Number(rating ?? 0),
    status: status,
    author: author,
    tags: tagSections,
    desc: description,
    //hentai: true
    hentai: false //MangaDex down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  let langCode = LanguageCode.ENGLISH;
  if (mangaId.toUpperCase().includes("-RAW")) langCode = LanguageCode.KOREAN;
  for (const c of $("ul", "div#chapterlist.eplister").children("li").toArray()) {
    const title = $("span.chapternum", c).text().trim();
    const id = $("a", c).attr('href')?.split("https://mangagenki.com/")[1].replace("/", "") ?? "";
    const date = new Date($("span.chapterdate", c).text().trim());
    const chapterNumber = title.split("Chapter ")[1];

    chapters.push(createChapter({
      id: id,
      mangaId,
      name: title,
      langCode: langCode,
      chapNum: Number(chapterNumber ?? 0),
      time: date,
    }));
  }
  return chapters;
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
  const pages: string[] = [];

  for (const p of $("img", "div#readerarea").toArray()) {
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

  for (const obj of $("div.utao", "div.bixbox").toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    function getDate(obj: any) {
      for (const i of $("span", obj).toArray()) {
        if (["N", "H"].includes($(i).text())) continue;
        return parseDate($(i).text())
      }
    }
    const mangaDate = getDate(obj) ?? new Date();

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

  //New Manga
  const newManga: MangaTile[] = [];
  for (const manga of $("li", $("div.section")[4]).toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("h2", manga).text().trim();
    const image = $("img", manga).attr('src')?.split("?resize")[0] ?? "";
    if (!id || !title) continue;
    newManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[0].items = newManga;
  sectionCallback(sections[0]);

  //Latest Update
  const latestUpdate: MangaTile[] = [];
  for (const manga of $("div.utao", "div.bixbox").toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("a", manga).attr('title');
    const image = $("img", manga).attr('src')?.split("?resize")[0] ?? "";
    if (!id || !title) continue;
    latestUpdate.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[1].items = latestUpdate;
  sectionCallback(sections[1]);

  //Top All Time
  const TopAllTime: MangaTile[] = [];
  for (const manga of $("li", "div.serieslist.pop.wpop.wpop-alltime").toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("h2", manga).text().trim();
    const image = $("img", manga).attr('src')?.split("?resize")[0] ?? "";
    if (!id || !title) continue;
    TopAllTime.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[2].items = TopAllTime;
  sectionCallback(sections[2]);

  //Top Monthly
  const TopMonthly: MangaTile[] = [];
  for (const manga of $("li", "div.serieslist.pop.wpop.wpop-monthly").toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("h2", manga).text().trim();
    const image = $("img", manga).attr('src')?.split("?resize")[0] ?? "";
    if (!id || !title) continue;
    TopMonthly.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[3].items = TopMonthly;
  sectionCallback(sections[3]);

  //Top Weekly
  const TopWeekly: MangaTile[] = [];
  for (const manga of $("li", "div.serieslist.pop.wpop.wpop-weekly").toArray()) {
    const id = $("a", manga).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("h2", manga).text().trim();
    const image = $("img", manga).attr('src')?.split("?resize")[0] ?? "";
    if (!id || !title) continue;
    TopWeekly.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[4].items = TopWeekly;
  sectionCallback(sections[4]);
  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  const collectedIds: string[] = [];

  for (const obj of $("div.bs", "div.listupd").toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("a", obj).attr('title');
    const image = $("img", obj).attr('src')?.split("?resize")[0] ?? "";
    const subtitle = $("div.epxs", obj).text().trim()
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

  for (const obj of $("div.bs", "div.listupd").toArray()) {
    const id = $("a", obj).attr('href')?.split("manga/")[1].replace("/", "") ?? "";
    const title = $("a", obj).attr('title');
    const image = $("img", obj).attr('src')?.split("?resize")[0] ?? "";
    const subtitle = $("div.epxs", obj).text().trim()
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
  for (const tag of $("li", "ul.genre").toArray()) {
    const label = $("a", tag).text().trim();
    const id = encodeURI($("a", tag).attr("href")?.trim()?.split("/genres/")[1].replace("/", "") ?? "");

    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
  return tagSections;
}

export const isLastPage = ($: CheerioStatic, id: String): boolean => {
  let isLast = true;
  if (id == "view_more") {
    let hasNext = Boolean($("a.r")[0]);
    if (hasNext) isLast = false;
  }

  if (id == "search_request") {
    let hasNext = Boolean($("a.next.page-numbers")[0]);
    if (hasNext) isLast = false;
  }
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