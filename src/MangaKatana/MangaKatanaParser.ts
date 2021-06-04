import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  titles.push($('h1.heading').first().text().trim());
  const altTitles = $('div.alt_name').text().split(";");
  for (const t of altTitles) {
    titles.push(t.trim());
  }

  const image = $('div.media div.cover img').attr('src') ?? "";
  const author = $('.author').text().trim();
  const description = $('.summary > p').text().trim();

  let hentai = false;

  const arrayTags: Tag[] = [];
  for (const tag of $(".genres > a").toArray()) {
    const label = $(tag).text().trim();
    const id = $(tag).attr('href')?.split("genre/")[1] ?? "";
    if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase())) hentai = true;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const rawStatus = $('.value.status').text().trim();
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
    artist: "",
    tags: tagSections,
    desc: description,
    //hentai: hentai
    hentai: false //MangaDex down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];
  const chapterNumberRegex = new RegExp('c([0-9.]+)');

  for (const elem of $('tr:has(.chapter)').toArray()) {
    const title = $("a", elem).text();
    const date = new Date($('.update_time', elem).text() ?? '');
    const chapterId = $('a', elem).attr('href')?.split('/').pop() ?? ''
    const chapterNumber = Number("0" + chapterId.match(chapterNumberRegex)![1]);

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

  const imageArrayRegex = RegExp('var ytaw=\\[([^\\[]*)]');
  for (const scriptObj of $('script').toArray()) {
    let script = scriptObj.children[0]?.data;
    if (typeof script === 'undefined') continue
    if (script.includes("var ytaw=")) {
      const array = script.match(imageArrayRegex)![1];
      const img = array.replace(/''?/g, '').split(",");
      for (const i of img) {
        if (i == '') continue;
        pages.push(i);
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

  for (const p of $(".wrap_item").toArray()) {
    const label = $('a', p).first().text().trim();
    const id = $('a', p).attr("href")?.split("genre/")[1] ?? "";
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

  for (const manga of $('div.item', 'div#book_list').toArray()) {
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const mangaDate = new Date($('.update_time', manga).first().text());
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

  //Hot Mango Update
  const hotMangaUpdate: MangaTile[] = [];
  for (const manga of $('div.item', 'div#hot_update').toArray()) {
    const title: string = $('.title', manga).text().trim();
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle: string = $('.chapter', manga).first().text().trim();
    if (!id || !title) continue;
    hotMangaUpdate.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[0].items = hotMangaUpdate;
  sectionCallback(sections[0]);

  //Hot Mango
  const hotManga: MangaTile[] = [];
  for (const manga of $('div.item', 'div#hot_book').toArray()) {
    const title: string = $('.title', manga).text().trim();
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const image = $("img", manga).attr('data-src') ?? "";
    const subtitle: string = $('.chapter', manga).first().text().trim();
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
  for (const manga of $('div.item', 'div#book_list').toArray()) {
    const title: string = $('.title', manga).text().trim();
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle: string = $('.chapter', manga).first().text().trim();
    if (!id || !title) continue;
    latestManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
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

  if ($('meta[property="og:url"]').attr('content')?.includes("/manga/")) {
    const title = $('h1.heading').first().text().trim() ?? "";
    const id = $('meta[property$=url]').attr('content')?.split('/')?.pop() ?? "";
    const image = $('div.media div.cover img').attr('src') ?? "";
    if (!collectedIds.includes(id) && id && title) {
      mangas.push(createMangaTile({
        id,
        image: image,
        title: createIconText({ text: title }),
      }));
      collectedIds.push(id);
    }
  } else {

    for (const manga of $("div.item", "#book_list").toArray()) {
      const title: string = $('.title a', manga).text().trim();
      const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
      const image = $("img", manga).attr('src') ?? "";
      const subtitle: string = $('.chapter', manga).first().text().trim();
      if (!collectedIds.includes(id) && id && title) {
        mangas.push(createMangaTile({
          id,
          image: image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: subtitle }),
        }));
        collectedIds.push(id);
      };
    }
  }
  return mangas;
}

export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
  const manga: MangaTile[] = [];
  for (const p of $('div.item', 'div#book_list').toArray()) {
    const title: string = $('.title a', p).text().trim();
    const id = $('a', p).attr('href')?.split('/').pop() ?? '';
    const image = $("img", p).attr('src') ?? "";
    const subtitle: string = $('.chapter', p).first().text().trim();
    if (!id || !title) continue;
    manga.push(createMangaTile({
      id,
      image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  return manga;
}

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = true;

  let hasNext = Boolean($("a.next.page-numbers", 'ul.uk-pagination').text());
  if (hasNext) isLast = false;
  return isLast;
}