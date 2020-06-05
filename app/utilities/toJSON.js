const klona = require('klona')
const _ = require('lodash')

module.exports = function() {
  // run toObject function on the model and make a copy of it
  let obj = klona(this.toObject())

  // make _id  'id', but only if there isn't already an idea
  if (!_.has(obj, 'id')) {
    obj.id = obj._id
  }

  // return object without _id, __v
  return _.omit(obj, ['_id', '__v'])
}