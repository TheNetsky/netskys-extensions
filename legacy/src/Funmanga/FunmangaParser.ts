import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

const FM_DOMAIN = "https://www.funmanga.com"

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push($("h5.widget-heading", $("div.content-inner.inner-page")).first().text().trim());
  const altTitles = $('dt:contains("Alternative Name:")').next().text().split(";");
  for (const t of altTitles) {
    titles.push(t.trim());
  }

  const image = "https:" + $('div.col-md-4 img').attr('src') ?? "";
  const author = $('dt:contains("Author:")').next().text().trim();
  const artist = $('dt:contains("Artist:")').next().text().trim();
  const description = $("div.note.note-default.margin-top-15").text().trim();

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("a", $('dt:contains("Categories:")').next()).toArray()) {
    const label = $(tag).text().trim();
    const id = $(tag).attr('href')?.split("category/")[1] ?? "";
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true; //Funmanga doesn't have these tags, so it'll always be false!
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $('dt:contains("Status:")').next().text().trim();
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
    image: image,
    rating: 0,
    status: status,
    author: author,
    artist: artist,
    tags: tagSections,
    desc: description,
    hentai: hentai,
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const elem of $("li", "ul.chapter-list").toArray()) {
    const title = "Chapter " + $('a', elem).attr('href')?.split('/').pop() ?? '';
    const date = parseDate($("span.date", elem).text().trim());
    const chapterId = $('a', elem).attr('href')?.split('/').pop() ?? '';
    let chapterNumber: any = $('a', elem).attr('href')?.split('/').pop();
    chapterNumber = Number(chapterNumber?.includes("-") ? chapterNumber.split("-")[0] : chapterNumber);
    chapters.push(createChapter({
      id: chapterId,
      mangaId,
      name: title,
      langCode: LanguageCode.ENGLISH,
      chapNum: isNaN(chapterNumber) ? 0 : chapterNumber,
      time: date,
    }));
  }
  return chapters;
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
  const pages: string[] = [];

  const imageArrayRegex = RegExp('var images = \\[([^\\[]*)]');
  for (const scriptObj of $('script').toArray()) {
    let script = scriptObj.children[0]?.data;
    if (typeof script === 'undefined') continue;
    if (script.includes("var images =")) {
      const scriptVar = script.match(imageArrayRegex)![1];
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
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: [] })];
  for (const p of $("li", "ul.widget-text-list").toArray()) {
    const label = $('a', p).first().attr('title') ?? "";
    const id = $('a', p).attr("href")?.split("category/")[1] ?? "";
    tagSections[0].tags.push(createTag({ id: id, label: label }));
  }
  return tagSections;
}

export interface UpdatedManga {
  ids: string[];
  loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];
  let loadMore = true;

  for (const manga of $("dl", "div.manga_updates").toArray()) {
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const parseDate = $('span.time.hidden-xs', manga).text().trim().split("/");
    const mangaDate = new Date(Number(parseDate[2]), Number(parseDate[1]) - 1, Number(parseDate[0]));

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

  //Latest Mango
  const latestManga: MangaTile[] = [];
  for (const manga of $("dl", "div.manga_updates").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const chapterId = $('a', manga).attr('href')?.split('/').pop() ?? '';
    let image = $('img', manga).first().attr('src')?.split("funmanga.com")[1] ?? "";
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
  const hotMangaUpdate: MangaTile[] = [];
  for (const manga of $("div.item", "div.owl-carousel").toArray()) {
    const title = $('a', manga).first().attr('title')?.split(/- \d+/)[0] ?? "";
    const chapterId = $('a', manga).attr('href')?.match(/funmanga.com\/([^/]*)/)![1] ?? '';
    let image = $('img', manga).first().attr('src')?.split("funmanga.com")[1] ?? "";
    image = FM_DOMAIN + image;
    hotMangaUpdate.push(createMangaTile({
      id: chapterId,
      image: image,
      title: createIconText({ text: title }),
    }));
  }
  sections[1].items = hotMangaUpdate;
  sectionCallback(sections[1]);

  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
  const manga: MangaTile[] = [];
  for (const p of $("dl", "div.manga_updates").toArray()) {
    const title = $('img', p).first().attr('alt') ?? "";
    const id = $('a', p).attr('href')?.split('/').pop() ?? '';
    let image = $('img', p).first().attr('src')?.split("funmanga.com")[1] ?? "";
    image = FM_DOMAIN + image;
    manga.push(createMangaTile({
      id,
      image,
      title: createIconText({ text: title }),
    }));
  }
  return manga;
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