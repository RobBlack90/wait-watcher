const Alert = require('../models/alert.model')
const notifications = require('../utilities/notifications')
const Boom = require('@hapi/boom')


module.exports = {
    async create(request) {        
        const { payload } = request
        
        const newAlert = await Alert.create(payload)
        if (!newAlert) {
            return Boom.badRequest('There was an error creating the alert.')
        }

        return await notifications.checkAlert(newAlert)
    },
    async find(request) {
        const query = request.query.hideInactive? {isActive: {$ne: false}} : {}
        const querySelect = {}
        const queryOptions = {}

        if (request.query.select) {
            const selectKeys = request.query.select.split(',')
            selectKeys.forEach(key => {
              querySelect[key] = 1
            })
        }

        if (request.query.populate) queryOptions.populate = request.query.populate.split(',')

        if (request.query.sortBy) queryOptions.sort = request.query.sortBy

        const alerts = await Alert.find(query, querySelect, queryOptions)
        return alerts
    },
    async show(request) {
        const alert = await Alert.findById(request.params.id)
        if (!alert) throw Boom.notFound(`Alert not found for ${request.params.id}`)

        return alert
    },
    async update(request) {
        const updatedAlert = await Alert.findByIdAndUpdate(request.params.id, request.payload, { new: true }) || Boom.notFound()
        return await notifications.checkAlert(updatedAlert) 
    },
    async remove(request) {
        return await Alert.findByIdAndRemove(request.params.id) || Boom.notFound()
    }
}