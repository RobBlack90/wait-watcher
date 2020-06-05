
const controller = require('../controllers/alert.controller')

const ROOT = '/api/alerts'

module.exports = [
    {
        path: `${ROOT}`,
        method: 'POST',
        handler: controller.create
    },
    {
        path: `${ROOT}`,
        method: 'GET',
        handler: controller.find
    },
    {
        path: `${ROOT}/{id}`,
        method: 'GET',
        handler: controller.show
    },
    {
        path: `${ROOT}/{id}`,
        method: 'DELETE',
        handler: controller.remove
    },
    {
        path: `${ROOT}/{id}`,
        method: 'PUT',
        handler: controller.update
    }
];