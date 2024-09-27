import * as cheerio from 'cheerio'
import { CreatorData } from './interface/Data'

export async function fetchCreatorData(source: any, id: string, service: string): Promise<CreatorData> {
    const getData = await source.stateManager.retrieve(id) ?? ''

    if (getData) {
        try {
            const parsedData: CreatorData = JSON.parse(getData)
            return parsedData
        } catch (error) {
            false
        }

    }

    const request = App.createRequest({
        url: `${source.baseURL}/${service}/user/${id}`,
        method: 'GET'
    })

    const response = await source.requestManager.schedule(request, 1)
    const $ = cheerio.load(response.data as string)

    const name = $('span[itemprop="name"]').text().trim() ?? ''

    let image = $('img', 'a.fancy-link.image-link.user-header__avatar').attr('src') ?? ''
    if (image.startsWith('//')) image = 'https:' + image

    if (name) {
        await source.stateManager.store(id, JSON.stringify({
            name: name,
            image: image
        }))
    }

    return {
        name: name,
        image: image
    }
}

export function daysAgo(date: Date | string): number {
    const now = new Date()
    const givenDate = new Date(date)

    const diffInMs = now.getTime() - givenDate.getTime()

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    return days
}

export function getFirstOfMonth(): string {
    const now = new Date()

    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')

    return `${year}-${month}-01`
}

export function parseURL(url: string) {
    const parts = url.split('/').filter(x => x !== '')

    return {
        service: parts[0],
        creator: parts[2]
    }
}