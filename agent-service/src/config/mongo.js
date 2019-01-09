const Mongoose = require('mongoose')

const getMongoURL = options => {
  return `mongodb://${options.servers}/${options.db}`
}
const parseReplSettings = options => {
  return options.repl ? options.dbReplicaSettings(options.repl) : {}
}

const attachConnectionEvents = mediator => {
  let conn = Mongoose.connection
  conn.on('error', err => {
    mediator.emit('db.error', err)
  })
  mediator.emit('db.ready', conn)
}

const connect = (options, mediator) => {
  mediator.once('boot.ready', () => {
    Mongoose.disconnect()

    Mongoose.connect(
      getMongoURL(options),
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        ...parseReplSettings(options)
      },
      err => {
        if (err) return mediator.emit('db.connection.error', err)

        attachConnectionEvents(mediator)
      }
    )
  })
}

module.exports = Object.assign({}, { connect })
