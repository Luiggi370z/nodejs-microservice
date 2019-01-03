const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const Boom = require('boom')
const TaskController = require('../controllers/taskController')

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

  const api = TaskController.bind(null, { repo })
  api(app)

  const server = app.listen(port, () => server)

  return server
}

module.exports = Object.assign({}, { start })
