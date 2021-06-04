import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, SearchRequest, TagSection } from "paperback-extensions-common";

const MF_DOMAIN = 'https://mangafast.net'

export interface UpdatedManga {
  ids: string[];
}

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push($("td:contains(Comic Title)").next().text().trim()); //Main English title

  const author = $("td:contains(Author)").next().text().trim();
  const image = $("img.shadow", "div.text-center.ims").attr('src') ?? "";
  const description = $("p.desc").text().trim();

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("a", $("td:contains(Genre)").next()).toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($(tag).attr("href")?.replace("/genre/", "")?.replace(/\/$/, "") ?? "");
    if (!id || !label) continue;
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $("td:contains(Status)").next().text().trim();
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
    author: author,
    tags: tagSections,
    desc: description,
    //hentai: hentai
    hentai: false //MangaDex down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const chapter of $("a", "div.chapter-link-w").toArray()) {
    const title = $("span.left", chapter).text().trim();
    const id = $(chapter).attr('href')?.replace(`${MF_DOMAIN}/`, "") ?? ""; //Has entrailing slash, fix on 0.6
    if ($("span.left > i", chapter).text().trim().toLowerCase().includes("spoiler")) continue; //Latest chaper is usually an empty spoiler page.
    const date = new Date($("span.right", chapter).text().trim());
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

  for (const p of $("img", "div.content-comic").toArray()) {
    let image = $(p).attr("src") ?? "";
    if (!image) image = $(p).attr("data-src") ?? "";
    if (image.includes("adsense")) continue;
    if (!image) throw new Error(`Unable to parse image(s) from chapterID: ${chapterId}`);
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
//No real place to the updates besides the 12 tiles on the homescreen.
export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];

  for (const manga of $("div.ls4.last-updates-content", "div.ls4w").toArray()) {
    const id = $("a", manga).attr('href')?.replace(`${MF_DOMAIN}/read/`, "")?.replace(/\/$/, "") ?? ""
    const dateSection = $("span.ls4s", manga).text().trim();
    const dateRegex = dateSection.match(/[Ll]ast\s[Uu]pdate\s(.*)/);
    let date: any = null;
    if (dateRegex && dateRegex[1]) date = dateRegex[1];
    if (!id) continue;
    const mangaDate = parseDate(date);
    if (mangaDate > time) {
      if (ids.includes(id)) {
        updatedManga.push(id);
      }
    }
  }
  return {
    ids: updatedManga
  }
}

export const parseHomeSections = ($: CheerioSelector, section: HomeSection): MangaTile[] => {

  const mangaTiles: MangaTile[] = [];
  switch (section.id) {
    //Top Manga 
    case "top_manga":
      for (const manga of $("div.ls23", "div.ls123").toArray()) {
        const id = $("a", manga).attr('href')?.replace(`${MF_DOMAIN}/read/`, "")?.replace(/\/$/, "") ?? ""
        const title = $("a", manga).attr('title');
        const image = $("img", manga).attr('src')?.split("?")[0] ?? "";
        const lastChapter = $("span.ls23s", manga).text().trim();
        if (!id || !title) continue;
        mangaTiles.push(createMangaTile({
          id: id,
          image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: lastChapter }),
        }));
      }
      break;
    //Latest Manga Update 
    case "latest_manga_update":
      for (const manga of $("div.ls4,last-updates-content", "div.ls4w").toArray()) {
        const id = $("a", manga).attr('href')?.replace(`${MF_DOMAIN}/read/`, "")?.replace(/\/$/, "") ?? ""
        const title = $("a", manga).attr('title');
        const image = $("img", manga).attr('src')?.split("?")[0] ?? "";
        const lastChapter = $("a.ls24", manga).text().trim();
        if (!id || !title) continue;
        mangaTiles.push(createMangaTile({
          id: id,
          image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: lastChapter }),
        }));
      }
      break;
    //New Manga 
    case "new_manga":
      for (const manga of $("div.ls4,last-updates-content", "div.ls4w").toArray()) {
        const id = $("a", manga).attr('href')?.replace(`${MF_DOMAIN}/read/`, "")?.replace(/\/$/, "") ?? ""
        const title = $("a", manga).attr('title');
        const image = $("img", manga).attr('src')?.split("?")[0] ?? "";
        const lastChapter = $("a.ls24", manga).text().trim();
        if (!id || !title) continue;
        mangaTiles.push(createMangaTile({
          id: id,
          image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: lastChapter }),
        }));
      }
      break;
    //Latest Manhua Update
    case "latest_manhua_update":
      for (const manga of $("div.ls4,last-updates-content", "div.ls4w").toArray()) {
        const id = $("a", manga).attr('href')?.replace(`${MF_DOMAIN}/read/`, "")?.replace(/\/$/, "") ?? ""
        const title = $("a", manga).attr('title');
        const image = $("img", manga).attr('src')?.split("?")[0] ?? "";
        const lastChapter = $("a.ls24", manga).text().trim();
        if (!id || !title) continue;
        mangaTiles.push(createMangaTile({
          id: id,
          image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: lastChapter }),
        }));
      }
      break;
    //Popular Manga
    case "popular_manga":
      for (const manga of $("div.ls2", "div.ls12").toArray()) {
        const id = $("a", manga).attr('href')?.replace(`${MF_DOMAIN}/read/`, "")?.replace(/\/$/, "") ?? ""
        const title = $("a", manga).attr('title');
        const image = $("img", manga).attr('src')?.split("?")[0] ?? "";
        const lastChapter = $("a.ls2l", manga).text().trim();
        if (!id || !title) continue;
        mangaTiles.push(createMangaTile({
          id: id,
          image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: lastChapter }),
        }));
      }
      break;
    default:
      break;
  }
  return mangaTiles
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  const collectedIds: string[] = [];

  for (const manga of $(".list-content .ls4").toArray()) {
    const id = $("a", manga).attr('href')?.replace(`${MF_DOMAIN}/read/`, "")?.replace(/\/$/, "") ?? ""
    const title = $("a", manga).attr('title');
    const image = $("img", manga).attr('src')?.split("?")[0] ?? "";
    const chapterSection = $("a.ls24", manga).text();
    const chapRegex = chapterSection.match(/(\d+\.?\_?\d?)/);
    let chapterNumber: any = "N/A";
    if (chapRegex && chapRegex[1]) chapterNumber = chapRegex[1].replace(/\\/g, ".");
    const subtitle = `Chapter ${chapterNumber}`
    if (collectedIds.includes(id) || !id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
    collectedIds.push(id);

  }
  return mangas;
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const arrayTags: Tag[] = [];
  for (const tag of $("li", "ul.genre").toArray()) {
    const label = $("a", tag).text().trim();
    const id = encodeURI($("a", tag).attr("href")?.replace("/genre/", "")?.replace(/\/$/, "") ?? "");
    if (!id || !label) continue;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
  return tagSections;
}

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = false;
  if ($("a:contains(Next »)", "div.p-3.btn-w").length) isLast = true;
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
  } else if (date.includes("MINUTE") || date.includes("MIN")) {
    time = new Date(Date.now() - (number * 60000));
  } else if (date.includes("SECOND") || date.includes("SECONDS")) {
    time = new Date(Date.now() - (number * 1000));
  } else {
    time = new Date(date);
  }
  return time;
}