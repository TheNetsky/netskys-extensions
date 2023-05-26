
// Chapters
export interface Chapters {
    title: string;
    long_title: string;
    permalink: string;
    tags: Tag[];
    pages: Page[];
    released_on: Date;
    added_on: Date;
}

export interface Page {
    name: string;
    url: string;
}

export interface Tag {
    type: string;
    name: string;
    permalink: string;
}

// Series
export interface Series {
    name: string;
    type: string;
    permalink: string;
    tags: Tag[];
    cover: string;
    link: string;
    description: string;
    aliases: string[];
    taggings: Tagging[];
}

export interface Tagging {
    title: string;
    permalink: string;
    released_on: Date;
    tags: Tag[];
}

// Doujin
export interface Doujin {
    name: string;
    type: string;
    permalink: string;
    tags: Tag[];
    cover: string;
    link: string;
    description: string;
    aliases: string[];
    taggings: Tagging[];
    current_page: number;
    total_pages: number;
}

// Recently Added
export interface RecentlyAdded {
    chapters: Chapter[];
    current_page: number;
    total_pages: number;
}

export interface Chapter {
    title: string;
    series: null | string;
    permalink: string;
    tags: Tag[];
}