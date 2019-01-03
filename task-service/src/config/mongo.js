const Mongoose = require('mongoose')

const getMongoURL = options => {
  return `mongodb://localhost:27017/${options.db}`
  // const url = options.servers.reduce(   (prev, cur) => prev + cur + ',',
  // 'mongodb://' ) return `${url.substr(0, url.length - 1)}/${options.db}`
}

const connect = (options, mediator) => {
  mediator.once('boot.ready', () => {
    Mongoose.connect(
      getMongoURL(options),
      {
        // db: options.dbParameters(), server: options.serverParameters(), replset:
        // options.replsetParameters(options.repl)
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
