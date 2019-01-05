import * as models from '../models'
import * as services from '../services'
const { dbSettings, serverSettings, aqmpSettings } = require('./config')
const database = require('./mongo')

const { initDI } = require('./di')

const init = initDI.bind(null, {
  serverSettings,
  dbSettings,
  database,
  models,
  services: {
    publisher: new services.Publisher(aqmpSettings),
    subscriber: new services.Subscriber(aqmpSettings)
  }
})

module.exports = Object.assign({}, { init })
