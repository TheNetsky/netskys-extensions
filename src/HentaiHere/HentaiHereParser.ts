import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, MangaUpdates, PagedResults, SearchRequest, TagSection } from "paperback-extensions-common";

const entities = require("entities"); //Import package for decoding HTML entities

const HH_DOMAIN = 'https://hentaihere.com'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

  const titles = [];
  const title = $("h4 > a").first().text().trim()
  if (!title) throw new Error("Unable to parse title!"); //If not title is present, throw error!

  titles.push(decodeHTMLEntity(title));

  const artist = $("span:contains(Artist:)").next().text().trim(); //Only displays first artist, can't find any hentai that had multiple artists lol
  const image = $("img", "div#cover").attr('src') ?? "https://i.imgur.com/GYUxEX8.png"; //Super cool fallback image, since the app doesn't have one yet.

  //Content Tags
  const arrayTags: Tag[] = [];
  for (const tag of $("a.tagbutton", $("span:contains(Content:)").parent()).toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($(tag).attr("href")?.replace(`/search/`, "").trim() ?? "");
    if (!id || !label) continue;
    arrayTags.push({ id: id, label: label });
  }
  //Category Tags
  for (const tag of $("a.tagbutton", $("span:contains(Catergory:)").parent()).toArray()) {
    const label = $(tag).text().trim();
    const id = encodeURI($(tag).attr("href")?.replace(`/search/`, "").trim() ?? "");
    if (!id || !label) continue;
    arrayTags.push({ id: id, label: label });
  }
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  const description = decodeHTMLEntity($("span:contains(Brief Summary:)").parent().text().replace($("span:contains(Brief Summary:)").text(), "").trim());
  const customDescription = `Description \n${description == "" ? "No description available!" : description}\n\nTags \n${arrayTags.map(t => t.label).join(", ")}`

  const rawStatus = $("span:contains(Status:)").next().text().trim();
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
    author: artist,
    artist: artist,
    tags: tagSections,
    desc: customDescription,
    //hentai: true
    hentai: false //MangaDex down
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];

  for (const c of $("li.sub-chp", "ul.arf-list").toArray()) {
    const title = decodeHTMLEntity($("span.pull-left", c).text().replace($("span.pull-left i.text-muted", c).text(), "").trim());
    const rawID = $("a", c).attr('href') ?? "";
    const id = /m\/[A-z0-9]+\/(\d+)/.test(rawID) ? rawID.match(/m\/[A-z0-9]+\/(\d+)/)![1] : "";
    if (id == "") continue;
    const date = new Date(Date.now() - 2208986640000); // *Lennyface* 
    const chapterNumber = isNaN(Number(id)) ? 0 : id;

    chapters.push(createChapter({
      id: id,
      mangaId,
      name: title,
      langCode: LanguageCode.ENGLISH,
      chapNum: Number(chapterNumber),
      time: date,
    }));
  }
  return chapters;
}

export const parseChapterDetails = (data: any, mangaId: string, chapterId: string): ChapterDetails => {
  const pages: string[] = [];
  let obj = /var rff_imageList = (.*);/.exec(data)?.[1] ?? ""; //Get the data else return null.

  if (obj == "") throw new Error("Unable to parse chapter details!"); //If null, throw error, else parse data to json.
  obj = JSON.parse(obj);

  for (const i of obj) {
    const page = "https://hentaicdn.com/hentai" + i;
    pages.push(page);
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

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section);

  //Staff Pick
  const staffPick: MangaTile[] = [];
  for (const manga of $("div.item", "div#staffpick").toArray()) {
    const id = $("a", manga).attr('href')?.replace(`${HH_DOMAIN}/m/`, "").trim();
    const image = $("img", manga).attr('src') ?? "";
    const title = decodeHTMLEntity(String($("img", manga).attr('alt')?.trim()) ?? "");
    const subtitle = $("b.text-danger", manga).text();
    if (!id || !title) continue;
    staffPick.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[0].items = staffPick;
  sectionCallback(sections[0]);

  //Recently Added
  const recentlyAdded: MangaTile[] = [];
  for (const manga of $($("div.row.row-sm")[1]).children("div").toArray()) {
    const id = $("a", manga).attr('href')?.replace(`${HH_DOMAIN}/m/`, "").trim();
    const image = $("img", manga).attr('src') ?? "";
    const title = decodeHTMLEntity(String($("img", manga).attr('alt')?.trim() ?? ""));
    if (!id || !title) continue;
    recentlyAdded.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[1].items = recentlyAdded;
  sectionCallback(sections[1]);

  //Trending
  const Trending: MangaTile[] = [];
  for (const manga of $("li.list-group-item", "ul.list-group").toArray()) {
    const id = $("a", manga).attr('href')?.split(`/m/`)![1]; //Method required since authors pages are included in the list, but don't use /m/
    const image = $("img", manga).attr('src') ?? "";
    const title = decodeHTMLEntity(String($("img", manga).attr('alt')?.trim()) ?? "");
    if (!id || !title) continue;
    Trending.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
    }));
  }
  sections[2].items = Trending;
  sectionCallback(sections[2]);

  for (const section of sections) sectionCallback(section);
}

export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title ?? "";
  return encodeURI(search);
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  for (const obj of $("div.item", "div.row.row-sm").toArray()) {
    const id = $("a", obj).attr('href')?.replace(`${HH_DOMAIN}/m/`, "").trim();
    const image = $("img", obj).attr('src') ?? "";
    const title = decodeHTMLEntity(String($("img", obj).attr('alt')?.trim()));
    const subtitle = $("b.text-danger", obj).text();
    if (!id || !title) continue;
    mangas.push(createMangaTile({
      id,
      image: image,
      title: createIconText({ text: decodeHTMLEntity(title) }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  return mangas;
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
  const manga: MangaTile[] = [];
  const collectedIds: string[] = [];

  for (const obj of $("div.item", "div.row.row-sm").toArray()) {
    const id = $("a", obj).attr('href')?.replace(`${HH_DOMAIN}/m/`, "").trim();
    const image = $("img", obj).attr('src') ?? "";
    const title = decodeHTMLEntity(String($("img", obj).attr('alt')?.trim()));
    const subtitle = $("b.text-danger", obj).text();
    if (!id || !title) continue;
    if (!collectedIds.includes(id)) {
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
  for (const tag of $("div.list-group", "div.col-xs-12").toArray()) {
    const label = $("span.clear > span", tag).text().trim();
    const id = $("a.list-group-item", tag).attr('href')?.replace(`${HH_DOMAIN}/search/`, "").trim() ?? "";
    if (!id || !label) continue;
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
  const currentPage = Number($("li.active").text().trim());
  if (currentPage >= lastPage) isLast = true;
  return isLast;
}

const decodeHTMLEntity = (str: string): string => {
  return entities.decodeHTML(str);
}

