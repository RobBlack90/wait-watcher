const cron = require('node-cron')
const changeDetector = require('./changeDetector')

cron.schedule(`*/5 * * * *`, () => {
  console.log(`Running Cron...`)
  changeDetector.detectChanges()
})