import cheerio from 'cheerio'
import {
    APIWrapper,
    SearchRequest,
    Source
} from 'paperback-extensions-common'
import { MangaFox } from '../MangaFox/MangaFox'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

describe('MangaFox Tests', () => {

    const wrapper: APIWrapper = new APIWrapper()
    const source: Source = new MangaFox(cheerio)
    const expect = chai.expect
    chai.use(chaiAsPromised)

    /**
   * The Manga ID which this unit test uses to base it's details off of.
   * Try to choose a manga which is updated frequently, so that the historical checking test can
   * return proper results, as it is limited to searching 30 days back due to extremely long processing times otherwise.
   */
    const mangaId = 'the_heavenly_demon_destroys_the_lich_king_s_murim' // he_heavenly_demon_destroys_the_lich_king_s_murim

    it('Retrieve Manga Details', async () => {
        const details = await wrapper.getMangaDetails(source, mangaId)
        expect(details, 'No results found with test-defined ID [' + mangaId + ']')
            .to.exist

        // Validate that the fields are filled
        const data = details
        expect(data.image, 'Missing Image').to.be.not.empty
        expect(data.status, 'Missing Status').to.exist
        expect(data.desc, 'Missing Description').to.be.not.empty
        expect(data.titles, 'Missing Titles').to.be.not.empty
        //expect(data.rating, 'Missing Rating').to.exist
    })

    it('Get Chapters', async () => {
        const data = await wrapper.getChapters(source, mangaId)

        expect(data, 'No chapters present for: [' + mangaId + ']').to.not.be.empty

        const entry = data[0]
        expect(entry?.id, 'No ID present').to.not.be.empty
        expect(entry?.name, 'No title available').to.not.be.empty
        expect(entry?.chapNum, 'No chapter number present').to.not.be.null
    })

    it('Get Chapter Details', async () => {
        const chapters = await wrapper.getChapters(source, mangaId)
        //      const chapter = chapters[0]
        //        console.log(chapter)

        const data = await wrapper.getChapterDetails(source, mangaId, chapters[0]?.id ?? 'unknown')
        expect(data, 'No server response').to.exist
        expect(data, 'Empty server response').to.not.be.empty

        expect(data.id, 'Missing ID').to.be.not.empty
        expect(data.mangaId, 'Missing MangaID').to.be.not.empty
        expect(data.pages, 'No pages present').to.be.not.empty
    })

    it('Get tags', async () => {
        const tags = await wrapper.getTags(source)
        expect(tags, 'No server response').to.exist
        expect(tags, 'Empty server response').to.not.be.empty
    })

    it('Testing home page results for popular titles', async () => {
        const results = await wrapper.getViewMoreItems(source, 'hot_release', {}, 1)

        expect(results, 'This section does not exist').to.exist
        expect(results, 'No results whatsoever for this section').to.be.not.empty

        //console.log(results)
        //  const data = results![0]
        //  expect(data?.id, 'No ID present').to.exist
        //   expect(data?.image, 'No image present').to.exist
        // expect(data?.title.text, 'No title present').to.exist
    })


    it('Testing search', async () => {
        const testSearch: SearchRequest = {
            title: 'love',
            parameters: {
                includedTags: ['action']
            }
        }

        const search = await wrapper.searchRequest(source, testSearch, 1)
        const result = search.results[0]

        expect(result, 'No response from server').to.exist

        expect(result?.id, 'No ID found for search query').to.be.not.empty
        expect(result?.image, 'No image found for search').to.be.not.empty
        expect(result?.title, 'No title').to.be.not.null
        expect(result?.subtitleText, 'No subtitle text').to.be.not.null
    })

    it('Testing Home-Page aquisition', async () => {
        const homePages = await wrapper.getHomePageSections(source)
        expect(homePages, 'No response from server').to.exist
        expect(homePages[0]?.items, 'No items present').to.exist
    })

    it('Testing Notifications', async () => {
        const updates = await wrapper.filterUpdatedManga(source, new Date('2021-9-10'), [mangaId])
        expect(updates, 'No server response').to.exist
        expect(updates, 'Empty server response').to.not.be.empty
        expect(updates[0], 'No updates').to.not.be.empty
    })



})
