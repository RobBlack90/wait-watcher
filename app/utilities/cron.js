const cron = require('node-cron')
const changeDetector = require('./changeDetector')

cron.schedule(`*/10 * * * *`, () => {
  console.log(`Running Cron`)
  changeDetector.detectChanges()
})