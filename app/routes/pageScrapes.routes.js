const controller = require('../controllers/pageScrapes.controller')

const ROOT = '/api/page-scrapes'

module.exports = [
    {
        path: `${ROOT}`,
        method: 'POST',
        handler: controller.scrapePage
    }
]