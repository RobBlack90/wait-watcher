const axios = require('axios')
const cheerio = require('cheerio')


async function scrape(page) {
    const response = await axios.get(page.url)

    if (response.status === 200) {
        const html = response.data
        const $ = cheerio.load(html)

        const latestContent = {}

        if (page.texts) {
            page.texts.forEach(text => {
                latestContent[text.name] = $(text.identifier).text()
            })
        }

        if (page.elements) {
            page.elements.forEach(element => {
                latestContent[element.name] = $(element.identifier).length
            })
        }

        return latestContent
    } else {
        throw new Error(`Response has status: ${response.status}`)
    }
}


module.exports = { scrape }