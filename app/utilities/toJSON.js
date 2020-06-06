const klona = require('klona')

function transform(obj) {
  if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = transform(obj[i])
      }
  } else {
      for (let prop in obj) {
          if (prop === '_id') {
            obj.id = obj._id
            delete obj._id
          } else if (prop === '__v') {
            delete obj.__v
          } else if (obj[prop] instanceof Array) {
            obj[prop] = transform(obj[prop])
          }
      }
  }
  return obj
}

module.exports = function() {
  let obj = klona(this.toObject())
  return transform(obj)
}