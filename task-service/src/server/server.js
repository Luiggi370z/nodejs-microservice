import { TaskController } from '../controllers'
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const Boom = require('boom')

const start = async container => {
  const { port } = container.resolve('serverSettings')
  const repo = container.resolve('repo')

  if (!repo) {
    throw new Error('The server must be started with a connected repository')
  }
  if (!port) {
    throw new Error('The server must be started with an available port')
  }

  const app = express()
  app.use(morgan('dev'))

  // Just for Postman
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  )

  app.use(bodyParser.json())
  // app.use(cors())
  app.use(helmet())
  app.use((err, req, res, next) => {
    res.json(Boom.internal('Something went wrong!'))
    next()
    throw new Error('Something went wrong!, err:' + err)
  })
  app.use((req, res, next) => {
    req.container = container.createScope()
    next()
  })

  const services = {
    publisher: container.resolve('publisherService'),
    subscriber: container.resolve('subscriberService')
  }

  const api = TaskController.bind(null, { repo, services })
  api(app)

  const server = app.listen(port, () => server)

  return server
}

module.exports = Object.assign({}, { start })
