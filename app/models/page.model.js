  
const mongoose = require('mongoose')

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
    lastScraped: { type: Date },
    lastChanged: { type: Date }
})

module.exports = mongoose.model('Page', PageSchema)