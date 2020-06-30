const Page = require('../models/page.model')
const sendNotifications = require('./notifications')
const PageScraper = require('./pageScraper')
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
        let latest = {
            content: await PageScraper.scrape(page),
            lastScraped: new Date()
        }

        if (page.content) {
            latest.changes = getChanges(latest.content, page.content)
            latest.lastChanged = latest.changes ? latest.lastScraped : page.lastChanged
        }
        
        latest = await Page.findByIdAndUpdate(page._id, latest, { new : true})

        console.log(`[${latest.lastScraped}] Page ${page.name} scraped successfully.`)

        return latest
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