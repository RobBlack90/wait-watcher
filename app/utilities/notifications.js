
const nodemailer = require('nodemailer')
const Alert = require('../models/alert.model')
const _ = require('lodash')
const Nexmo = require('nexmo')


const conditionChecker = {
    "equals" : function (currentValue, desiredValue) { return desiredValue === currentValue},
    "includes" : function (wholeValue, includesValue) { return wholeValue.includes(includesValue)},
    "doesn't include" : function (wholeValue, includesValue) { return !wholeValue.includes(includesValue)},
    "greater than" : function (current, limit) { return Number(current) > Number(limit)},
    "less than" : function (current, limit) { return Number(limit) < Number(current)},
}

async function checkAlerts(sendAlertNotifications = true) {

    const alerts = await Alert.find().populate('pageCriteria.page').populate('correctPages')
    console.log('Checking alerts...')

    for (const alert of alerts) {
        const updatedAlert = await checkAlert(alert, true)
        if (sendAlertNotifications && updatedAlert) await sendNotifications(updatedAlert)
    }

    console.log('finished checking.')
}

async function checkAlert(alert, checkOnlyChanges = false) {
    const correctPages = []

    alert = await getProperlyInflatedAlert(alert)

    const changesExist = alert.pageCriteria.filter(criteria => _.get(criteria,'page.changes')).length ? true : false

    if (!changesExist && checkOnlyChanges) {
        return
    }

    for (const criteria of alert.pageCriteria) {
        const page = criteria.page
        let pageCriteriaMet = false

        if (_.isEmpty(criteria.content)) {
            if (page.changes) pageCriteriaMet = true
        } else {
            const acceptanceArray = []

            for (const c of criteria.content) {
                const pageContentValue = page.content[c.name]
                const criteriaMet = c.criteria ? conditionChecker[c.criteria](pageContentValue, c.value) : _.has(page.changes, c.name)
                acceptanceArray.push(criteriaMet)
            }

            const passed = (criteria.andOr === 'OR') ? acceptanceArray.some(v => v) : acceptanceArray.every(v => v)
            if (passed) pageCriteriaMet = true
        }

        if (pageCriteriaMet) {
            correctPages.push(page)
            criteria.criteriaLastMet = new Date()
        }
    }  

    alert.correctPages = correctPages
    await Alert.findByIdAndUpdate(alert._id, alert)

    return alert
}

async function sendNotifications(alert) {
    alert = await getProperlyInflatedAlert(alert)

    if (alert.pageCriteria.length === alert.correctPages.length) {
        if (alert.emailAddress) sendEmail(alert)
        if (alert.phoneNumber) sendText(alert)
        alert.lastAlerted = new Date()
    }

}

function sendEmail(alert) {
    let contentStr = ''

    alert.correctPages.forEach(page => {
        contentStr += `\n ${page.name}: ${page.url} \n`
        for (const contentName in page.content) {
            contentStr += `${contentName}: ${page.content[contentName]} \n`
        }
    })

    let transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
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

function sendText(alert) {
    console.log(`Sending a text to ${alert.phoneNumber} for ${alert.name}...`)

    if (process.env.NODE_ENV === 'production') { //texts aren't free, ya know.
        const nexmo = new Nexmo({
            apiKey: process.env.NEXMO_KEY,
            apiSecret: process.env.NEXMO_SECRET
        })

        const text = `All the criteria for "${alert.name}" has been met! Check your email for the full report.`

        console.log(`Sending a text to ${alert.phoneNumber} for ${alert.name}...`)
        nexmo.message.sendSms(process.env.NEXMO_NUMBER, alert.phoneNumber, text)
    }
}

async function getProperlyInflatedAlert(alert) {
    let correctAlert = alert
    const criteriaPage = _.get(alert, 'pageCriteria[0].page', false)
    const correctPage = _.get(alert, 'correctPages[0]', false)

    if ((criteriaPage && !criteriaPage.url) || (correctPage && !correctPage.url)) {
        console.log('populating')
        correctAlert = await Alert.findOne({ _id: alert._id }).populate('pageCriteria.page').populate('correctPages')
    }

    return correctAlert
}


module.exports = sendNotifications
module.exports = { 
    checkAlerts, 
    checkAlert, 
    sendNotifications 
}