const Mongoose = require('mongoose')

const getMongoURL = options => {
  return `mongodb://${options.servers}/${options.db}`
}

const connect = (options, mediator) => {
  mediator.once('boot.ready', () => {
    Mongoose.disconnect()

    Mongoose.set('useCreateIndex', true)
    Mongoose.set('useFindAndModify', false)
    const url = getMongoURL(options)
    console.log('mongo db url22222', url)
    Mongoose.connect(
      url,
      {
        useNewUrlParser: true
        // ...options.dbParameters(),
        // ...options.serverParameters(),
        // ...options.replsetParameters(options.repl)
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
