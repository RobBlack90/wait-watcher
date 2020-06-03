'use strict'

const detectChanges = require('./app/utilities/changeDetector')
require('./app/utilities/cron')


const Hapi = require('@hapi/hapi')

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    })

    await server.start()
    console.log('Server running on %s', server.info.uri)

   await detectChanges()
}

process.on('unhandledRejection', (err) => {

    console.log(err)
    process.exit(1)
})

init()