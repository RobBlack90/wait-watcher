const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('storage/db.json')
const db = low(adapter)
db.defaults({ alerts: [], pages: [] }).write()


module.exports = db