import { allRoutingKeys } from '../config/constants'
import colors from 'colors'
const Boom = require('boom')
const HttpStatus = require('http-status')

export const TaskController = ({ repo, services }, app) => {
  const agentEventsHandler = (subscriber, name) => async message => {
    const data = JSON.parse(message.content.toString())

    switch (message.fields.routingKey) {
      case allRoutingKeys.agent.new:
        console.log(`\n➡️  ${colors.yellow('OnNewAgent Event received')}`)
        console.log('\t 💾  Data: \n', JSON.stringify(data, null, 2))
        console.log('\t 🔎  Searching available tasks...')

        repo
          .popTask(data.skills)
          .then(task => {
            try {
              if (!task) {
                publishTaskEvent(allRoutingKeys.task.notFound, {
                  agentId: data.agentId
                })

                return console.log(
                  `\t 🙁  No available tasks for skills -> ${Object.keys(
                    data.skills
                  )
                    .map(key => `${key}: ${data.skills[key]}`)
                    .join(', ')}`
                )
              }

              console.log(
                colors.green('\t 🙂  Task found!\n'),
                JSON.stringify(task, null, 2)
              )

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
        console.log(`\n➡️  ${colors.yellow('OnFoundAgent Event received')}`)
        console.log('\t 💾  Data: \n', JSON.stringify(data, null, 2))

        // TODO: Optional: agentId could be store in processId to save correlation between task and agent
        repo
          .completeTask(data.taskId)
          .then(updatedTask => {
            console.log(
              `\t ✔  ${colors.green('Task')} ${data.taskId} ${colors.green(
                ' assigned to '
              )} ${data.agentId}`
            )
          })
          .catch(err => {
            throw new Error(`Error on complete Task ${data.taskId}`, err)
          })

        break

      case allRoutingKeys.agent.notFound:
        console.log(`\n➡️  ${colors.yellow('OnNotFoundAgent Event received')}`)
        console.log('\t 💾  Data: \n', JSON.stringify(data, null, 2))
        console.log(
          '\t 🤷‍♂️  No available agent for task, promoting the priority of the task'
        )

        repo
          .upgradePriority(data.taskId)
          .then(updatedTask => {
            console.log(
              `\t ⬆  Task '${updatedTask._id}' has been promoted to priority: ${
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
    // await services.publisher.start()
    const isPublished = await services.publisher.publish(
      routingKey,
      JSON.stringify(message)
    )
    // if (isPublished)
    // setTimeout(async () => {
    //   await services.publisher.close()
    // }, 50)
  }

  services.publisher.start()

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
    // Optional we can do filters, or select other queues based on the type of the task
    const { type, skills } = req.body

    repo
      .pushTask({ type, payload: skills })
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

  app.post('/task/ping', (req, res, next) => {
    res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'pong' })
    next()
  })
}
