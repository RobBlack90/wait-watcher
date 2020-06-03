
const nodemailer = require('nodemailer')
const db = require('./db')
const _ = require('lodash')



const conditionChecker = {
    "equals" : function (currentValue, desiredValue) { return desiredValue === currentValue},
    "includes" : function (wholeValue, includesValue) { return wholeValue.includes(includesValue)},
    "greaterThan" : function (current, limit) { return Number(current) > Number(limit)},
    "greaterThan" : function (current, limit) { return Number(limit) > Number(current)},
}


async function sendNotifications() {
    const alerts = db.get('alerts').value()

    for (const alert of alerts) {
        const correctPages = []

        for (const criteria of alert.pageCriteria) {
            const page = db.get('pages')
            .find({ id: criteria.pageId })
            .value()

            if (!criteria.content) {
                if (page.changes) correctPages.push(page.id)
            } else {
                const acceptanceArray = []

                for (const c of criteria.content) {
                    const pageContentValue = page.content[c.name]
                    const criteriaMet = c.criteria ? conditionChecker[c.criteria](pageContentValue, c.value) : _.has(page.changes, c.name)
                    acceptanceArray.push(criteriaMet)
                }

                const passed = (criteria.andOr === 'OR') ? acceptanceArray.some(v => v) : acceptanceArray.every(v => v)
                if (passed) correctPages.push(page.id)
            }
        }  

        alert.correctPages = correctPages

        if (alert.pageCriteria.length === correctPages.length) {
            const pages = db.get('pages')
            .filter(page => alert.correctPages.includes(page.id))
            .value()

            if (alert.emailAddress) sendEmail(alert, pages)
            if (alert.phoneNumber) sendText(alert, pages)
        }
        
        db.get('alerts')
        .find({name: alert.name})
        .assign(alert)
        .write()
    }
}


function sendEmail(alert, pages) {
    let contentStr = ''

    pages.forEach(page => {
        contentStr += `${page.name}: ${page.id} \n`
    })

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    let mailOptions = {
        from: process.env.EMAIL,
        to: alert.emailAddress,
        subject: `${alert.name} Update!`,
        text: `All the criteria for "${alert.name}" has been met. Check it out!: \n ${contentStr}`
    }
    
    console.log(`Sending an email to ${alert.emailAddress} for ${alert.name}...`)
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            return console.log(`Error sending email: ${err}`)
        }
    })
}

function sendText(alert, pages) {
    console.log(`Here's where I'd send a text to ${alert.phoneNumber}`)
}


module.exports = sendNotifications