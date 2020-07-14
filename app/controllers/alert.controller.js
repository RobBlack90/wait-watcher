const Alert = require('../models/alert.model')
const Boom = require('@hapi/boom')


module.exports = {
    async create(request) {        
        const { payload } = request
        
        const newAlert = await Alert.create(payload)
        if (!newAlert) {
            return Boom.badRequest('There was an error creating the alert.')
        }

        return newAlert
    },
    async find(request) {
        const querySelect = {}
        const queryOptions = {sort: {}}

        if (request.query.select) {
            const selectKeys = request.query.select.split(',')
            selectKeys.forEach(key => {
              querySelect[key] = 1
            })
        }

        if (request.query.populate) {
            queryOptions.populate = request.query.populate.split(',')
        }

        if (request.query.sortBy) {
            const direction = request.query.sort === 'desc' ? -1 : 1
            const sortKeys = request.query.sortBy.split(',')
            sortKeys.forEach(key => {
                queryOptions.sort[key] = direction
            })
        }

        const alerts = await Alert.find({}, querySelect, queryOptions)
        return alerts
    },
    async show(request) {
        const alert = await Alert.findById(request.params.id)
        if (!alert) throw Boom.notFound(`Alert not found for ${request.params.id}`)

        return alert
    },
    async update(request) {
        return await Alert.findByIdAndUpdate(request.params.id, request.payload, { new: true }) || Boom.notFound()
    },
    async remove(request) {
        return await Alert.findByIdAndRemove(request.params.id) || Boom.notFound()
    }
}