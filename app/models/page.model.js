  
const mongoose = require('mongoose')
const toJSON = require('../utilities/toJSON')

const Schema = mongoose.Schema

const PageItemSchema = new Schema({
    name: String,
    identifier: String
})

const PageSchema = new Schema({
    name: { required: true, type: String },
    url: { required: true, type: String },
    elements: [PageItemSchema],
    texts: [PageItemSchema],
    content: { type: Object },
    changes: { type: Object },
    lastScraped: { type: Date, default: Date.now }
}, {collection: 'page'})

PageSchema.pre('save', function preSave(next) {
    this.lastScraped = Date.now() 
    next()
})

PageSchema.set('toObject', {
    getters: true
})
  
PageSchema.method('toJSON', toJSON)

module.exports = mongoose.model('Page', PageSchema)