// import models from '../models'
import models from '../models/index.js'
const { dbSettings, serverSettings } = require('./config')
const database = require('./mongo')
const { initDI } = require('./di')

console.log('models1', models)
// console.log('task', task)
const init = initDI.bind(null, { serverSettings, dbSettings, database, models })

module.exports = Object.assign({}, { init })``
