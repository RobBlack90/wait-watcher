'use strict'

const mongoose = require('mongoose')
const alertRoutes = require('./app/routes/alerts.routes')
const pageRoutes = require('./app/routes/pages.routes')
const detectChanges = require('./app/utilities/changeDetector')
require('./app/utilities/cron')


const Hapi = require('@hapi/hapi')

const init = async () => {

    const mongoDbUri = 'mongodb://localhost:27017/waitWatcher'
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    })

    mongoose.connect(mongoDbUri, {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
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

    await server.start()
    console.log('Server running on %s', server.info.uri)

    // await detectChanges()
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()