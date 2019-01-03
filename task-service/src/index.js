const { EventEmitter } = require('events')
const server = require('./server/server')
const repository = require('./repository')
const { asValue } = require('awilix')
const di = require('./config')
const mediator = new EventEmitter()

console.log('--- Tasks Service ---')
console.log('Connecting to tasks repository...')

process.on('uncaughtException', err => {
  console.error('Unhandled Exception', err)
})

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err)
})

mediator.on('di.ready', container => {
  repository
    .connect(container)
    .then(repo => {
      console.log('Connected. Starting Server 👍 ')
      container.register({ repo: asValue(repo) })
      return server.start(container)
    })
    .then(app => {
      console.log(
        `Server started successfully, running on port: ${
          container.cradle.serverSettings.port
        }.`
      )
      app.on('close', () => {
        container.resolve('repo').disconnect()
      })
    })
})

di.init(mediator)

mediator.emit('init')
