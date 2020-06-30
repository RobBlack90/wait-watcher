const PageScraper = require('../utilities/pageScraper')


module.exports = {
    async scrapePage(request) {        
        const { payload } = request
        return await PageScraper.scrape(payload)
    }
}