import { allRoutingKeys } from '../config/constants'
import colors from 'colors'
const Boom = require('boom')
const HttpStatus = require('http-status')

export const AgentController = ({ repo, services }, app) => {
  const taskEventsHandler = (subscriber, name) => async message => {
    const data = JSON.parse(message.content.toString())

    switch (message.fields.routingKey) {
      case allRoutingKeys.task.new:
        console.log(`\n➡️  ${colors.yellow('OnNewTask Event received')}`)
        console.log('\t 💾  Data:\n', JSON.stringify(data, null, 2))
        console.log('\t 🔎  Searching available agents...')
        repo
          .getAgentFor(data.skills)
          .then(agent => {
            try {
              if (!agent) {
                publishAgentEvent(allRoutingKeys.agent.notFound, {
                  taskId: data.id
                })

                return console.log(
                  `\t 🙁  No available agents for: ${Object.keys(data.skills)
                    .map(key => `${key}: ${data.skills[key]}`)
                    .join(',')}`
                )
              }

              console.log(
                colors.green('\t 🙂  Agent found!\n'),
                JSON.stringify(agent, null, 2)
              )

              publishAgentEvent(allRoutingKeys.agent.found, {
                taskId: data.id,
                agentId: agent.agentId
              })
            } catch (e) {
              throw e
            }
          })
          .catch(e => {
            console.log('Error on Get Agent for:', data)
            throw e
          })
        break

      case allRoutingKeys.task.found:
        console.log(`\n➡️  ${colors.yellow('OnFoundTask Event received')}`)
        console.log(
          '\t 🙂  Task found for agent!\n',
          JSON.stringify(data, null, 2)
        )

        repo
          .assignAgent(data.agentId)
          .then(assignedAgent => {
            console.log(
              `\t ⏱  Agent '${
                assignedAgent.agentId
              }' was assigned and will be removed from db in 1 min.`
            )
          })
          .catch(err => {
            console.log(`Error on assign agent ${data.agentId}`)
            throw new Error(err)
          })
        // Not necessary to update agent since index will remove automatically after
        // 1min
        break

      case allRoutingKeys.task.notFound:
        console.log(`\n➡️  ${colors.yellow('OnNotFoundTask Event received')}`)
        console.log(
          '\t 🔁  Move back agent to queue\n',
          JSON.stringify(data, null, 2)
        )
        repo
          .requeueAgent(data.agentId)
          .then(updatedAgent => {
            console.log(
              `\t ⏱  Agent '${updatedAgent.agentId}' has been requeued.`
            )
          })
          .catch(err => {
            console.log(`Error on requeue agent ${data.agentId}`)
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

  services.publisher.start()

  services.subscriber.start(
    taskEventsHandler(services.subscriber, 'Listener Name')
  )

  app.get('/agent', (req, res, next) => {
    repo
      .getAvailableAgents()
      .then(agents => {
        res
          .status(HttpStatus.OK)
          .json({ status: HttpStatus.OK, total: agents.length, agents })
        next()
      })
      .catch(e => {
        res.json(
          Boom.internal('Error on Fetching Available Agents', req.agent)
        ) && next(e)
      })
  })
  app.post('/agent', async (req, res, next) => {
    // TODO: Task obj validation from request
    const { agentId, skills } = req.body

    console.log('/agent execution')

    try {
      const agent = await repo.pushAgent({ agentId, skills })

      publishAgentEvent(allRoutingKeys.agent.new, { agentId, skills })

      res.status(HttpStatus.OK).json({ status: HttpStatus.OK, agent })
      next()
    } catch (e) {
      res.json(Boom.internal('Error on Post Agent', e)) && next(e)
    }
  })

  app.post('/agent/ping', (req, res, next) => {
    res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'pong' })
    next()
  })

  app.post('/agent/for', (req, res, next) => {
    // TODO: Validate input task for required fields
    const { task } = req.body

    repo
      .getAgentFor(task.skills)
      .then(agent => {
        if (!agent) {
          try {
            publishAgentEvent(allRoutingKeys.agent.notFound, {
              taskId: task.id
            })
          } catch (e) {
            throw e
          }

          return res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: `No available agents for: ${Object.keys(task.skills)
              .map(key => `${key}: ${task.skills[key]}`)
              .join(',')}`
          })
        }

        try {
          publishAgentEvent(allRoutingKeys.agent.found, { taskId: task.id })
        } catch (e) {
          throw e
        }

        res.status(HttpStatus.OK).json({ status: HttpStatus.OK, agent })
        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Fetching Agent', task.skills)) &&
          next(e)
      })
  })

  const publishAgentEvent = async (routingKey, message) => {
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
}
