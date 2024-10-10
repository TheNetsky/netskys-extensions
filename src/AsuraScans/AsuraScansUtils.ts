import { Filters } from './interface/Filters'

export async function setFilters(source: any, data: Filters) {
    for (const genre of data.genres) {
        await source.stateManager.store(genre.name.toUpperCase(), genre.id)
    }
}

export async function getFilter(source: any, filter: string): Promise<string> {
    const genre = await source.stateManager.retrieve(filter.toUpperCase()) as string ?? ''
    return genre.toString()
}

export async function getMangaId(source: any, slug: string): Promise<string> {
    const id = idCleaner(slug)

    const gotSlug = await source.stateManager.retrieve(id) as string ?? ''
    if (!gotSlug) {
        await source.stateManager.store(id, slug)
        return slug
    }

    return gotSlug
}

function idCleaner(str: string): string {
    let cleanId: string | null = str
    cleanId = cleanId.replace(/\/$/, '')
    cleanId = cleanId.split('/').pop() ?? null
    // Remove randomised slug part
    cleanId = cleanId?.substring(0, cleanId?.lastIndexOf('-')) ?? null

    if (!cleanId) {
        throw new Error(`Unable to parse id for ${str}`)
    }

    return cleanId
}