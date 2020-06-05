const Page = require('../models/page.model')
const Boom = require('@hapi/boom')


module.exports = {
    async create(request) {        
        const { payload } = request

        const newPage = await Page.create(payload)
        if (!newPage) {
            return Boom.badRequest('There was an error creating the page.')
        }

        return newPage
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
        return await Page.findByIdAndUpdate(request.params.id, request.payload, { new: true }) || Boom.notFound()
    },
    async remove(request) {
        return await Page.findByIdAndRemove(request.params.id) || Boom.notFound()
    }
}