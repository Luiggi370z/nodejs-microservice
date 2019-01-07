import { allRoutingKeys } from '../config/constants'
const Boom = require('boom')
const HttpStatus = require('http-status')

export const TaskController = ({ repo, services }, app) => {
  const agentEventsHandler = (subscriber, name) => async message => {
    const data = JSON.parse(message.content.toString())

    switch (message.fields.routingKey) {
      case allRoutingKeys.agent.new:
        console.log('➡️  OnNewAgent Event received ', data)
        console.log('--- Searching available tasks 🔎 ...')

        repo
          .popTask(data.skills)
          .then(task => {
            try {
              if (!task) {
                publishTaskEvent(allRoutingKeys.task.notFound, {
                  agentId: data.agentId
                })

                return console.log(
                  `Task Service: No available tasks for: ${Object.keys(
                    data.skills
                  )
                    .map(key => `${key}: ${data.skills[key]}`)
                    .join(',')}`
                )
              }

              console.log('Task found!', task)

              publishTaskEvent(allRoutingKeys.task.found, {
                agentId: data.agentId,
                taskId: task._id
              })
            } catch (e) {
              throw e
            }
          })
          .catch(e => {
            console.log('Error on Get Task for:', data)
            throw e
          })

        break

      case allRoutingKeys.agent.found:
        console.log('Agent found for task !', data)

        // TODO: Optional: agentId could be store in processId to save correlation between task and agent
        repo
          .completeTask(data.taskId)
          .then(updatedTask => {
            console.log(`Task '${data.taskId}' assigned to '${data.agentId}.'`)
          })
          .catch(err => {
            throw new Error(`Error on complete Task ${data.taskId}`, err)
          })

        break

      case allRoutingKeys.agent.notFound:
        console.log(
          'No available agent for task, promoting the priority of the task',
          data
        )

        repo
          .upgradePriority(data.taskId)
          .then(updatedTask => {
            console.log(
              `Task '${updatedTask._id}' has been promoted to priority: ${
                updatedTask.priority
              }`
            )
          })
          .catch(err => {
            console.log(`Error on priority upgrade for task ${data.taskId}`)
            throw new Error(err)
          })

        break

      default:
        console.log(`Unknown routing key: ${message.fields.routingKey}`)
        break
    }

    // console.log('Meta Data', name, data, data.meta, message)
    subscriber.ack(message)
  }

  const publishTaskEvent = async (routingKey, message) => {
    await services.publisher.start()
    const isPublished = await services.publisher.publish(
      routingKey,
      JSON.stringify(message)
    )
    if (isPublished)
      setTimeout(async () => {
        await services.publisher.close()
      }, 500)
  }

  services.subscriber.start(
    agentEventsHandler(services.subscriber, 'Listener Name')
  )

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
  app.post('/task', (req, res, next) => {
    // TODO: Task obj validation from request
    const { type, language, state } = req.body

    repo
      .pushTask({ type, language, state })
      .then(task => {
        try {
          publishTaskEvent(allRoutingKeys.task.new, {
            id: task._id,
            skills: task.payload
          })
        } catch (e) {
          throw e
        }

        res.status(HttpStatus.OK).json({ status: HttpStatus.OK, task })
        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Post Task', req.task)) && next(e)
      })
  })

  app.post('/task/next', (req, res, next) => {
    // TODO: Validate input task for required fields
    const { agent } = req.body

    repo
      .popTask(agent.skills)
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
