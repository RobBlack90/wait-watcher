const axios = require('axios')
const cheerio = require('cheerio')
const nodemailer = require('nodemailer')
const db = require('./db')
const sendNotifications = require('./notifications')
const _ = require('lodash')

require('dotenv').config()


async function detect() {
    const pages = db.get('pages').value()

    for (const page of pages) {
        const response = await axios.get(page.id)
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

            const latest = {
                content: latestContent,
                lastUpdated: new Date()
            }

            if (page.content) {
                latest.changes = getChanges(latest.content, page.content)
            }
            
            db.get('pages')
            .find({id: page.id})
            .assign(latest)
            .write()

            console.log(`[${latest.lastUpdated}]Task ${page.name} ran successfully.`)
        } else {
            console.log(`Error scraping ${page.name}`)
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