const axios = require('axios')
const cheerio = require('cheerio')
const Page = require('../models/page.model')
const sendNotifications = require('./notifications')
const _ = require('lodash')

async function detectChanges() {
    const pages = await Page.find()

    for (const page of pages) {
        await detectChange(page)
    }

    await sendNotifications()
}

async function detectChange(page) {
    try {
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

            let latest = {
                content: latestContent,
                lastScraped: new Date()
            }

            if (page.content) {
                latest.changes = getChanges(latest.content, page.content)
            }
            
            latest = await Page.findByIdAndUpdate(page._id, latest, { new : true})

            console.log(`[${latest.lastScraped}] Page ${page.name} scraped successfully.`)

            return latest
        } else {
            throw new Error(`Response has status: ${response.status}`)
        }
    } catch (e) {
        console.log(`Error scraping page: ${page.name} `, e)
    }
}

function getChanges(latest, previous) {
    const changes = {}
    const names = Object.keys(latest)

    names.forEach(name => {
        if (!_.isEqual(latest[name], previous[name])) {
            changes[name] = latest[name]
        }
    })

   return  _.isEmpty(changes) ? null : changes
}


module.exports = { detectChanges, detectChange }