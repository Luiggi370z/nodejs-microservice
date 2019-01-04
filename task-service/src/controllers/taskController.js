const Boom = require('boom')
const HttpStatus = require('http-status')
const { PublishNewTask } = require('../services/publish')

const taskController = ({ repo }, app) => {
  app.post('/task', (req, res, next) => {
    // TODO: Task obj validation from request
    const { type, language, state } = req.body

    repo
      .pushTask({ type, language, state })
      .then(task => {
        PublishNewTask({ id: task._id, skills: task.payload })
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
          .json({ status: HttpStatus.OK, total: tasks.length, tasks })
        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Fetching Pending Tasks', req.task)) &&
          next(e)
      })
  })

  app.post('/task/next', (req, res, next) => {
    repo
      .popTask()
      .then(task => {
        if (!task)
          return res
            .status(HttpStatus.OK)
            .json({ status: HttpStatus.OK, message: 'No pending tasks' })

        res.status(HttpStatus.OK).json({ status: HttpStatus.OK, task })
        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Post Task', req.task)) && next(e)
      })
  })

  app.post('/task/:id/complete', (req, res, next) => {
    // TODO: Validate if Id is a valid ObjectId for mongodb
    let id = req.params.id

    repo
      .completeTask(id)
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
