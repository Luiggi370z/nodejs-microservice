const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const boom = require('boom')
const routes = require('../routes')
const app = express()

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(helmet())
app.use((err, req, res, next) => {})

app.use('/api', routes)
