import { Chapter, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, SearchRequest, TagSection } from "paperback-extensions-common";

const entities = require("entities");

export interface UpdatedManga {
  ids: string[];
}

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
  const titles = [];
  titles.push(decodeHTMLEntity($("h1._3xnDj").contents().first().text().trim()));
  for (const title of $("h1._3xnDj > small").text().trim().split(/\\|; /)) {
    if (title !== "") titles.push(decodeHTMLEntity(title.trim()));
  }

  const image = $("img.img-responsive")?.attr("src") ?? "";
  const author = decodeHTMLEntity($("._3QCtP > div:nth-child(2) > div:nth-child(1) > span:nth-child(2)").text().trim() ?? "");
  const artist = decodeHTMLEntity($("._3QCtP > div:nth-child(2) > div:nth-child(2) > span:nth-child(2)").text().trim() ?? "");
  const description = decodeHTMLEntity($("div#noanim-content-tab-pane-99 p.ZyMp7")?.first()?.text() ?? "No description available");

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("._3Czbn a").toArray()) {
    const label = $(tag).text().trim();
    const id = $(tag).attr('href')?.split("/genre/")[1] ?? "";
    if (!id || !label) continue;
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $("._3QCtP > div:nth-child(2) > div:nth-child(3) > span:nth-child(2)")?.first().text().trim();
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
    author: author == "" ? "Unknown" : author,
    artist: artist == "" ? "Unknown" : artist,
    tags: tagSections,
    desc: description,
    //hentai: hentai
    hentai: false //MangaDex down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];
  for (const chapter of $("ul.MWqeC,list-group").children("li").toArray()) {
    const id = $('a', chapter).attr('href')?.split(`/${mangaId}/`).pop() ?? "";
    const title = $("span.text-secondary._3D1SJ", chapter).text().replace("#", "Chapter ").trim();
    const chapterSection = $("span.text-secondary._3D1SJ", chapter).text().trim();
    const chapRegex = chapterSection.match(/(\d+\.?\d?)/)
    let chapterNumber: number = 0
    if (chapRegex && chapRegex[1]) chapterNumber = Number(chapRegex[1]);
    const date = parseDate($("small.UovLc", chapter)?.text() ?? "");
    if (!id) continue;
    chapters.push(createChapter({
      id,
      mangaId,
      name: title,
      langCode: LanguageCode.ENGLISH,
      chapNum: chapterNumber,
      time: date,
    }))
  }
  return chapters;
}
//Unable to get tags from site, might need to hardcode these?
export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: [] })];
  return tagSections;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];

  for (const manga of $("div.media", "div._21UU2").toArray()) {
    const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? "";
    const mangaDate = parseDate($('._3L1my', manga).first().text());
    if (!id) continue;
    if (mangaDate > time) {
      if (ids.includes(id)) {
        updatedManga.push(id);
      }
    }
  }
  return {
    ids: updatedManga,
  }
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section);

  //Popular Mango Updates
  const hotMangaUpdate: MangaTile[] = [];
  for (const manga of $("div.manga-slide", "div.manga-slider").toArray()) {
    const title = $("strong", manga).text().trim();
    const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? "";
    const imageSection = $("div.m-slide-background", manga).attr("style") ?? "";
    const imgRegex = imageSection.match(/(https?:\/\/.*\.(?:png|jpg))/)
    let image: string = "https://i.imgur.com/GYUxEX8.png";
    if (imgRegex && imgRegex[0]) image = imgRegex[0];
    const subtitle = $("em", manga).text().replace("#", "Chapter ").trim();
    if (!id || !title) continue;
    hotMangaUpdate.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[0].items = hotMangaUpdate;
  sectionCallback(sections[0]);

  //Hot Mango
  const hotManga: MangaTile[] = [];
  for (const manga of $("div.media", "._11E7v").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle = $("p > a.text-secondary", manga).text().replace("#", "Chapter ").trim();
    if (!id || !title) continue;
    hotManga.push(createMangaTile({
      id: id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[1].items = hotManga;
  sectionCallback(sections[1]);

  //Latest Mango
  const latestManga: MangaTile[] = [];
  const latestArray = $("div.media", "div._21UU2").toArray();
  for (const manga of latestArray.splice(0, 30)) { //Too many items! (Over 500!)
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle = $("span.text-secondary._3D1SJ", manga).text().replace("#", "Chapter ").trim();
    if (!id || !title) continue;
    latestManga.push(createMangaTile({
      id: id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }

  sections[2].items = latestManga;
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
  for (const manga of $("div.media-manga.media", "div#mangalist").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $("a", manga).attr('href')?.split("/manga/").pop() ?? "";
    const image = $("img", manga).attr('src') ?? "";
    const subtitle = $("p > a", manga).first().text().replace("#", "Chapter ").trim();
    if (collectedIds.includes(id) || !id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
    collectedIds.push(id);
  };
  return mangas
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
  const mangas: MangaTile[] = [];

  for (const manga of $("div#mangalist div.media-manga.media").toArray()) {
    const title = $('img', manga).first().attr('alt') ?? "";
    const id = $("a", manga).attr('href')?.split("/manga/").pop() ?? "";
    const image = $("img", manga).attr('src') ?? "";
    const subtitle = $("p > a", manga).first().text().replace("#", "Chapter ").trim();
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

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = true;

  let hasNext = Boolean($("a.btn.btn-primary").text());
  if (hasNext) isLast = false;
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
  return entities.decodeHTML(str);
}