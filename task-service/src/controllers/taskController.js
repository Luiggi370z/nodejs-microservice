const Boom = require('boom')
const HttpStatus = require('http-status')

const taskController = ({ repo }, app) => {
  app.post('/task', (req, res, next) => {
    // TODO: Task obj validation from request
    const { type, language, state } = req.body

    repo
      .pushTask({ type, language, state })
      .then(task => {
        res.status(HttpStatus.OK).json({ status: HttpStatus.OK, task })
        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Post Task', req.task)) && next(e)
      })
  })
}

module.exports = taskController
