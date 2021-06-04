import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
  const tagRegexp = new RegExp('\\/directory\\/(.*)\\/');

  const details = $('.detail-info');
  const title = $('span.detail-info-right-title-font', details).text().trim();
  const image = $('.detail-info-cover-img', $('.detail-info-cover')).attr('src') ?? '';
  const rating = $('span.item-score', details).text().trim().replace(',', '.');
  const author = $('p.detail-info-right-say a', details).text().trim();
  const description = $('p.fullcontent').text().trim();

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $("a", ".detail-info-right-tag-list").toArray()) {
    const id = $(tag).attr('href')?.match(tagRegexp)![1] ?? "";
    const label = $(tag).text().trim();
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $('.detail-info-right-title-tip', details).text().trim();
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
    titles: [title],
    image,
    rating: Number(rating),
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
  const rawChapters = $('div#chapterlist ul li').children('a').toArray().reverse();
  const chapterIdRegex = new RegExp('\\/manga\\/[a-zA-Z0-9_]*\\/(.*)\\/');
  const chapterNumberRegex = new RegExp('c([0-9.]+)');

  for (const elem of rawChapters) {
    const title = $('p.title3', elem).html() ?? '';
    const date = parseDate($('p.title2', elem).html() ?? '');
    const chapterId: string = elem.attribs['href'].match(chapterIdRegex)![1];
    const chapterNumber = chapterId.match(chapterNumberRegex)![1] ?? 0;

    chapters.push(createChapter({
      id: chapterId,
      mangaId,
      name: title,
      langCode: LanguageCode.ENGLISH,
      chapNum: Number(chapterNumber),
      time: date,
    }));
  }
  return chapters;
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
  const pages: string[] = [];
  const rawPages = $('div#viewer').children('img').toArray();

  if (!$('div#viewer').length) pages.push("https://i.imgur.com/8WoVeWv.png"); //Fallback in case the manga is licensed
  for (let page of rawPages) {
    let url = page.attribs['data-original'];
    if (url.startsWith("//")) {
      url = "https:" + url;
    }
    pages.push(url);
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
  const idRegExp = new RegExp('\\/manga\\/(.*)\\/');

  const panel = $(".manga-list-4.mt15");
  for (let obj of $('.manga-list-4-list > li', panel).toArray()) {
    const id = $('a', obj).first().attr('href')?.match(idRegExp)![1] ?? "";
    const dateContext = $('.manga-list-4-item-subtitle', $(obj));
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
    loadMore,
  }
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section);

  const hotManga: MangaTile[] = [];
  const beingReadManga: MangaTile[] = [];
  const newManga: MangaTile[] = [];
  const latestManga: MangaTile[] = [];

  const idRegExp = new RegExp('\\/manga\\/(.*)\\/');
  const firstSection = $('div.main-large').first();
  const hotMangas = $('.manga-list-1', firstSection).first();
  const beingReadMangas = hotMangas.next();
  const newMangas = $('div.line-list');
  const latestMangas = $('ul.manga-list-4-list');

  for (const manga of $('li', hotMangas).toArray()) {
    const id = $('a', manga).first().attr('href')?.match(idRegExp)![1] ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const title: string = $('.manga-list-1-item-title', manga).text().trim();
    const subtitle: string = $('.manga-list-1-item-subtitle', manga).text().trim();
    if (!id || !title) continue;

    hotManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[0].items = hotManga;
  sectionCallback(sections[0]);

  for (const manga of $('li', beingReadMangas).toArray()) {
    const id = $('a', manga).first().attr('href')?.match(idRegExp)![1] ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const title: string = $('.manga-list-1-item-title', manga).text().trim();
    const subtitle: string = $('.manga-list-1-item-subtitle', manga).text().trim();
    if (!id || !title) continue;

    beingReadManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[1].items = beingReadManga;
  sectionCallback(sections[1]);

  for (const manga of $('li', newMangas).toArray()) {
    const id = $('a', manga).first().attr('href')?.match(idRegExp)![1] ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const title: string = $('.manga-list-1-item-title', manga).text().trim();
    const subtitle: string = $('.manga-list-1-item-subtitle', manga).text().trim();
    if (!id || !title) continue;

    newManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[2].items = newManga;
  sectionCallback(sections[2]);

  for (const manga of $('.manga-list-4-list > li', latestMangas).toArray()) {
    const id = $('a', manga).first().attr('href')?.match(idRegExp)![1] ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const title: string = $('.manga-list-4-item-title', manga).text().trim();
    const subtitle: string = $('.manga-list-4-item-subtitle', manga).text().trim();
    if (!id || !title) continue;

    latestManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[3].items = latestManga;
  sectionCallback(sections[3]);

  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  const collectedIds: string[] = [];

  const idRegExp = new RegExp('\\/manga\\/(.*)\\/');

  for (const manga of $("ul.manga-list-4-list").children("li").toArray()) {
    const id = $('a', manga).first().attr('href')?.match(idRegExp)![1] ?? "";
    const image = $('img', manga).first().attr('src') ?? "";
    const title = $('p.manga-list-4-item-title a', manga).first().text().trim();
    const tips = $('p.manga-list-4-item-tip', manga).toArray();
    const author = $('a', tips[0]).text().trim();
    const lastUpdate = $('a', tips[1]).text().trim();
    const shortDesc = $(tips[2]).text().trim();
    if (!id || !title) continue;

    if (!collectedIds.includes(id)) {
      mangas.push(createMangaTile({
        id,
        image: image,
        title: createIconText({ text: title ?? '' }),
        subtitleText: createIconText({ text: author ?? '' }),
        primaryText: createIconText({ text: shortDesc ?? '' }),
        secondaryText: createIconText({ text: lastUpdate ?? '' }),
      }));
      collectedIds.push(id);
    }
  }
  return mangas;
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
  const manga: MangaTile[] = [];
  const idRegExp = new RegExp('\\/manga\\/(.*)\\/');
  if (homepageSectionId === "latest_updates") {
    const collectedIds: string[] = [];
    const panel = $(".manga-list-4.mt15");
    for (let p of $('.manga-list-4-list > li', panel).toArray()) {
      const id = $('a', p).first().attr('href')?.match(idRegExp)![1] ?? "";
      const image = $('img', p).first().attr('src') ?? "";
      const title: string = $('.manga-list-4-item-title', p).text().trim();
      const subtitle: string = $('.manga-list-4-item-subtitle', p).text().trim();
      if (!id || !title) continue;

      if (!collectedIds.includes(id)) {
        manga.push(createMangaTile({
          id,
          image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: subtitle }),
        }));
        collectedIds.push(id);
      }
    }
    return manga;
  } else {
    const collectedIds: string[] = [];
    const panel = $('.manga-list-1')
    for (let p of $('li', panel).toArray()) {
      const id = $('a', p).first().attr('href')?.match(idRegExp)![1] ?? "";
      const image = $('img', p).first().attr('src') ?? '';
      const title: string = $('.manga-list-1-item-title', p).text().trim();
      const subtitle: string = $('.manga-list-1-item-subtitle', p).text().trim();
      if (!id || !title) continue;

      if (!collectedIds.includes(id)) {
        manga.push(createMangaTile({
          id,
          image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: subtitle }),
        }));
        collectedIds.push(id);
      }
    }
    return manga;
  }
}

export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: [] })];
  for (const p of $('a', $(".tag-box", `.browse-bar-filter-list-line-content`)).toArray()) {
    tagSections[0].tags.push(createTag({ id: $(p).text() ?? '', label: $(p).text() }));
  }
  return tagSections;
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

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = false;
  const pages = [];
  for (const page of $("a", ".pager-list-left").toArray()) {
    const p = Number($(page).text().trim());
    if (isNaN(p)) continue;
    pages.push(p);
  }
  const lastPage = Math.max(...pages);
  const currentPage = Number($("a.active", ".pager-list-left").text().trim());
  if (currentPage >= lastPage) isLast = true;
  return isLast;
}