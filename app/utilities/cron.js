const cron = require('node-cron')
const detectChanges = require('./changeDetector')

cron.schedule(`*/10 * * * *`, () => {
  console.log(`Running Cron`)
  detectChanges()
})