  
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ContentSchema = new Schema({
    name: { type: String, required: true },
    criteria: { type: String },
    value: { type: Schema.Types.Mixed }
})

const PageCriteriaSchema = new Schema({
    page: { type: Schema.Types.ObjectId, ref: 'Page' },
    andOr: { type: String },
    criteriaLastMet: { type: Date },
    content: [ ContentSchema ]
})

const AlertSchema = new Schema({
    name: { required: true, type: String },
    emailAddress: { type: Object, required: true },
    phoneNumber: { type: Object },
    pageCriteria: [ PageCriteriaSchema ],
    correctPages: [{ type: Schema.Types.ObjectId, ref: 'Page' }]
})

module.exports = mongoose.model('Alert', AlertSchema)