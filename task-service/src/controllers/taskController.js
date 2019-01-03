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

  app.get('/task/pending', (req, res, next) => {
    repo
      .pendingTasks()
      .then(tasks => {
        res
          .status(HttpStatus.OK)
          .json({ status: HttpStatus.OK, tasks, total: tasks.length })
        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Fetching Pending Tasks', req.task)) &&
          next(e)
      })
  })
}

module.exports = taskController
