import { Chapter } from "paperback-extensions-common";

export interface PagedSearchResults {
    chapters: Chapter[]
    pagnationId?: string // We need to ensure that a correct URL slug is provided for next-page calls
    titleId?: string
    hasNextPage?: number // Either the next page URL, or an undefined if it doesn't exist
}