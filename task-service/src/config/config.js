import { allRoutingKeys } from './constants'

const dbSettings = {
  db: process.env.DB || 'tasks',
  // user: process.env.DB_USER || 'cristian', pass: process.env.DB_PASS ||
  // 'cristianPassword2017',
  repl: process.env.DB_REPLS || 'rs1',
  servers: process.env.DB_SERVERS
    ? process.env.DB_SERVERS.substr(1, process.env.DB_SERVERS.length - 2).split(
        ' '
      )
    : ['192.168.99.100:27017', '192.168.99.101:27017', '192.168.99.102:27017'],
  dbParameters: () => ({
    w: 'majority',
    wtimeout: 10000,
    j: true,
    readPreference: 'ReadPreference.SECONDARY_PREFERRED',
    native_parser: false
  }),
  serverParameters: () => ({
    autoReconnect: true,
    poolSize: 10,
    socketoptions: {
      keepAlive: 300,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    }
  }),
  replsetParameters: (replset = 'rs1') => ({
    replicaSet: replset,
    ha: true,
    haInterval: 10000,
    poolSize: 10,
    socketoptions: {
      keepAlive: 300,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    }
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
    queueName: process.env.RABBITMQ_TASK_QUEUE_NAME,
    exchange: process.env.RABBITMQ_TASK_EXCHANGE
  },
  sub: {
    ...aqmpCommon,
    queueName: process.env.RABBITMQ_AGENT_QUEUE_NAME,
    exchange: process.env.RABBITMQ_AGENT_EXCHANGE,
    routingKeys: Object.values(allRoutingKeys.agent)
  }
}

module.exports = Object.assign({}, { dbSettings, serverSettings, aqmpSettings })
