import * as models from '../models'
const { dbSettings, serverSettings } = require('./config')
const database = require('./mongo')
const { initDI } = require('./di')

const init = initDI.bind(null, { serverSettings, dbSettings, database, models })

module.exports = Object.assign({}, { init })
