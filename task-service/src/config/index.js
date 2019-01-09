import * as models from '../models'
import * as services from '../services'
const {
  dbSettings,
  serverSettings,
  dbReplicaSettings,
  aqmpSettings
} = require('./config')
const database = require('./mongo')
const { initDI } = require('./di')

const init = initDI.bind(null, {
  serverSettings,
  dbSettings,
  dbReplicaSettings,
  database,
  models,
  services: {
    publisher: new services.Publisher(aqmpSettings.pub),
    subscriber: new services.Subscriber(aqmpSettings.sub)
  }
})

module.exports = Object.assign({}, { init })
