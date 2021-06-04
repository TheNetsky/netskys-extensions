import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

const RM_DOMAIN = 'https://readm.org'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push($("h1.page-title").text().trim());

  const altTitles = $("div.sub-title.pt-sm").text().split(",");
  for (const t of altTitles) {
    titles.push(t.trim());
  }

  const image = RM_DOMAIN + $("img.series-profile-thumb")?.attr("src") ?? "https://i.imgur.com/GYUxEX8.png";
  const author = $("small", "span#first_episode").text().trim() ?? "";
  const artist = $("small", "span#last_episode").text().trim() ?? "";
  const description = $("p", "div.series-summary-wrapper").text().trim() ?? "No description available";
  const rating = $("div.color-imdb").text().trim() ?? "";
  const views = Number($('div:contains("Views")', "div.media-meta").next().text().replace(/,/g, "") ?? 0);

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("a", $("div.ui.list", "div.item")).toArray()) {
    const label = $(tag).text().trim();
    const id = $(tag).attr('href')?.replace("/category/", "") ?? "";
    if (!id || !label) continue;
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true; //These tags don't exist on Readm, but they may be added in the future!
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $("div.series-genres").text().trim();
  let status = MangaStatus.ONGOING;
  switch (rawStatus.toLocaleUpperCase()) {
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
    author: author,
    artist: artist,
    tags: tagSections,
    desc: description,
    views: views,
    //hentai: hentai,
    hentai: false //Due to MangaDex being down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const c of $("div.season_start").toArray()) {
    const title = $("h6.truncate", c).first().text().trim() ?? "";
    const rawChapterId = $('a', c).attr('href') ?? "";
    const chapterId = /\/manga\/[A-z0-9]+\/(.*?)\//.test(rawChapterId) ? rawChapterId.match(/\/manga\/[A-z0-9]+\/(.*?)\//)![1] : null;
    if (!chapterId) continue;
    const chapterNumber = Number(/(\d+)/.test(title) ? title.match(/(\d+)/)![0] : 0);
    const date = parseDate($("td.episode-date", c)?.text() ?? "");
    chapters.push(createChapter({
      id: chapterId,
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

  for (const p of $("div.ch-images img").toArray()) {
    let rawPage = $(p).attr("src");
    rawPage = RM_DOMAIN + rawPage;
    pages.push(rawPage);
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
  const arrayTags: Tag[] = [];
  for (const tag of $("li", "ul.trending-thisweek.categories").toArray()) {
    const label = $("a", tag).text().trim();
    const id = $("a", tag).attr('href')?.replace("/category/", "") ?? "";
    if (!id || !label) continue;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
  return tagSections;
}

export interface UpdatedManga {
  ids: string[],
  loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];
  let loadMore = true;

  for (const m of $("div.poster.poster-xs", $("ul.clearfix.latest-updates").first()).toArray()) {
    const id = $('a', m).attr('href')?.replace("/manga/", "") ?? "";
    const mangaDate = parseDate($("span.date", m).text().trim() ?? "");
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

  //Hot Mango Update
  const hotMangaUpdate: MangaTile[] = [];
  for (const m of $("div.item", "div#manga-hot-updates").toArray()) {
    const title: string = $("strong", m).text().trim();
    const rawId = $('a', m).attr('href') ?? "";
    const id = /\/manga\/(.*?)\//.test(rawId) ? rawId.match(/\/manga\/(.*?)\//)![1] : null;
    const image = RM_DOMAIN + $("img", m)?.attr("src") ?? ""
    if (!id || !title) continue;
    hotMangaUpdate.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
    }));
  }
  sections[0].items = hotMangaUpdate;
  sectionCallback(sections[0]);

  //Hot Mango
  const hotManga: MangaTile[] = [];
  for (const m of $("ul#latest_trailers li").toArray()) {
    const title: string = $("h6", m).text().trim();
    const id = $('a', m).attr('href')?.replace("/manga/", "") ?? "";
    const image = RM_DOMAIN + $("img", m)?.attr("data-src") ?? "";
    const subtitle: string = $("small", m).first().text().trim() ?? "";
    if (!id || !title) continue;
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
  const latestManga: MangaTile[] = [];
  for (const m of $("div.poster.poster-xs", $("ul.clearfix.latest-updates").first()).toArray()) {
    const title: string = $("h2", m).first().text().trim();
    const id = $('a', m).attr('href')?.replace("/manga/", "") ?? "";
    const image = RM_DOMAIN + $("img", m)?.attr("data-src") ?? "";
    if (!id || !title) continue;
    latestManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
    }));
  }
  sections[2].items = latestManga;
  sectionCallback(sections[2]);

  //New Mango
  const newManga: MangaTile[] = [];
  for (const m of $("li", "ul.clearfix.mb-0").toArray()) {
    const title: string = $("h2", m).first().text().trim();
    const id = $('a', m).attr('href')?.replace("/manga/", "") ?? "";
    const image = RM_DOMAIN + $("img", m)?.attr("data-src");
    if (!id || !title) continue;
    newManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
    }));
  }
  sections[3].items = newManga;
  sectionCallback(sections[3]);

  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
  const manga: MangaTile[] = [];

  if (homepageSectionId === "hot_manga") {
    for (const m of $("li.mb-lg", "ul.filter-results").toArray()) {
      const title: string = $("h2", m).first().text().trim();
      const id = $('a', m).attr('href')?.replace("/manga/", "") ?? "";
      const image = RM_DOMAIN + $("img", m)?.attr("src") ?? "";
      if (!id || !title) continue;
      manga.push(createMangaTile({
        id,
        image,
        title: createIconText({ text: title }),
      }));
    }
  } else {
    for (const m of $("div.poster.poster-xs", $("ul.clearfix.latest-updates").first()).toArray()) {
      const title: string = $("h2", m).first().text().trim();
      const id = $('a', m).attr('href')?.replace("/manga/", "") ?? "";
      const image = RM_DOMAIN + $("img", m)?.attr("data-src") ?? "";
      if (!id || !title) continue;
      manga.push(createMangaTile({
        id,
        image,
        title: createIconText({ text: title }),
      }));
    }
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

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = true;
  let hasNext = Boolean($("a:contains(»)", "div.ui.pagination.menu")[0]);
  if (hasNext) isLast = false;
  return isLast;
}