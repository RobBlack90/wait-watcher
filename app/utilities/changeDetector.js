const axios = require('axios')
const cheerio = require('cheerio')
const Page = require('../models/page.model')
const sendNotifications = require('./notifications')
const _ = require('lodash')

async function detect() {
    const pages = await Page.find()
    for (const page of pages) {
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
                        latestContent[element.name] = $(element.identifier).html() ? true : false
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

                console.log(`[${latest.lastScraped}]Task ${page.name} ran successfully.`)
            } else {
                throw new Error(`Response has status: ${response.status}`)
            }
        } catch (e) {
            console.log(`Error scraping page: ${page.name} `, e)
        }
    }

    await sendNotifications()
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


module.exports = detect