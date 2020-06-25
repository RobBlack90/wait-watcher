const Page = require('../models/page.model')
const changeDetector = require('../utilities/changeDetector')
const Boom = require('@hapi/boom')


module.exports = {
    async create(request) {        
        const { payload } = request

        const newPage = await Page.create(payload)
        if (!newPage) {
            return Boom.badRequest('There was an error creating the page.')
        }

        return await changeDetector.detectChange(newPage)
    },
    async find(request) {
        const pages = await Page.find(request.query)
        return pages
    },
    async show(request) {
        const page = await Page.findById(request.params.id)
        if (!page) throw Boom.notFound(`Page not found for ${request.params.id}`)

        return page
    },
    async update(request) {
        const { payload } = request
        delete payload.content
        delete payload.changes
        delete payload.lastScraped

        try {
            const updatedPage = await Page.findByIdAndUpdate(request.params.id, payload, { new: true }) 
            return await changeDetector.detectChange(updatedPage)
        } catch (e) {
            console.log(e)
            return Boom.badRequest(`There was an error upating page ${request.params.id}`, e)
        }
    },
    async remove(request) {
        return await Page.findByIdAndRemove(request.params.id) || Boom.notFound()
    }
}