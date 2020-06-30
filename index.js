'use strict'

const mongoose = require('mongoose')
const alertRoutes = require('./app/routes/alerts.routes')
const pageRoutes = require('./app/routes/pages.routes')
const pageScrapeRoutes = require('./app/routes/pageScrapes.routes')
const changeDetector = require('./app/utilities/changeDetector')
require('dotenv').config({ path: `${__dirname}/.env` })
require('./app/utilities/cron')


const Hapi = require('@hapi/hapi')

const init = async () => {
    
    const mongoDbUri = process.env.NODE_ENV === 'production' ? process.env.DB_URI : 'mongodb://localhost:27017/waitWatcher'
    const server = Hapi.server({
        port: process.env.PORT || 3000    
    })

    mongoose.connect(mongoDbUri, {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
    })

    mongoose.connection.on('connected', () => {
        console.log(`app is connected to ${mongoDbUri}`)
    })
    mongoose.connection.on('error', err => {
        console.log('error while connecting to mongodb', err)
    })

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Yo yo yo'
        }
    })

    server.route(alertRoutes)
    server.route(pageRoutes)
    server.route(pageScrapeRoutes)

    await server.start()
    console.log('Server running on %s', server.info.uri)

    await changeDetector.detectChanges()
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()