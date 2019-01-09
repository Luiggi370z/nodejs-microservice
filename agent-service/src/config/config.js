import { allRoutingKeys } from './constants'

const dbSettings = {
  db: process.env.DB || 'agents',
  // user: process.env.DB_USER || 'username',
  // pass: process.env.DB_PASS || 'password',
  repl: process.env.DB_REPLS || 'rs1',
  servers: process.env.DB_SERVERS || 'localhost:27017',
  dbParameters: () => ({
    w: 'majority',
    wtimeout: 10000,
    j: true,
    readPreference: 'ReadPreference.SECONDARY_PREFERRED',
    native_parser: true
  }),
  serverParameters: () => ({
    autoReconnect: true,
    poolSize: 10
  }),
  replsetParameters: (replset = 'rs1') => ({
    replicaSet: replset,
    ha: true,
    haInterval: 10000,
    poolSize: 10,
    keepAlive: 300,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000
  })
}

const serverSettings = {
  port: process.env.PORT || 3000
  // ssl: require('./ssl')
}

const aqmpCommon = {
  url: process.env.RABBITMQ_URL,
  type: process.env.RABBITMQ_TYPE || 'topic'
}

const aqmpSettings = {
  pub: {
    ...aqmpCommon,
    queueName: process.env.RABBITMQ_AGENT_QUEUE_NAME,
    exchange: process.env.RABBITMQ_AGENT_EXCHANGE
  },
  sub: {
    ...aqmpCommon,
    queueName: process.env.RABBITMQ_TASK_QUEUE_NAME,
    exchange: process.env.RABBITMQ_TASK_EXCHANGE,
    routingKeys: Object.values(allRoutingKeys.task)
  }
}

module.exports = Object.assign({}, { dbSettings, serverSettings, aqmpSettings })
