const Mongoose = require('mongoose')

const getMongoURL = options => {
  return `mongodb://${options.servers}/${options.db}`
}

const connect = (options, mediator) => {
  mediator.once('boot.ready', () => {
    Mongoose.set('useCreateIndex', true)
    Mongoose.set('useFindAndModify', false)

    Mongoose.connect(
      getMongoURL(options),
      {
        useNewUrlParser: true,
        ...options.dbParameters(),
        ...options.serverParameters(),
        ...options.replsetParameters(options.repl)
      },
      err => {
        if (err) {
          mediator.emit('db.error', err)
        }

        mediator.emit('db.ready', Mongoose.connection)
      }
    )
  })
}

module.exports = Object.assign({}, { connect })
