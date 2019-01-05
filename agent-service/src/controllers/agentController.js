const Boom = require('boom')
const HttpStatus = require('http-status')

const handler = (subscriber, name) => async message => {
  const data = JSON.parse(message.content.toString())
  console.log('Meta Data', name, data, data.meta)
  // do service implementation.
  subscriber.ack(message)
}

export const AgentController = ({ repo, services }, app) => {
  services.subscriber.start(handler(services.subscriber, 'Listener Name'))

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
  app.post('/agent', (req, res, next) => {
    // TODO: Task obj validation from request
    const { agentId, skills } = req.body

    repo
      .pushAgent({ agentId, skills })
      .then(async agent => {
        try {
          await services.publisher.start()
          const isPublished = await services.publisher.publish(
            'agent_queue',
            JSON.stringify({ agentId, skills })
          )

          console.log('isPublished', isPublished)
          // await services.publisher.close()
        } catch (e) {
          throw e
        }

        // PublishAgentAvailable({ agentId, skills })
        res.status(HttpStatus.OK).json({ status: HttpStatus.OK, agent })

        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Post Agent', req.task)) && next(e)
      })
  })

  app.post('/agent/for', (req, res, next) => {
    const { skills } = req.body
    console.log('body', req.body)
    repo
      .getAgentFor(skills)
      .then(agent => {
        if (!agent)
          return res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: `No available agents for: ${Object.keys(skills)
              .map(key => `${key}: ${skills[key]}`)
              .join(',')}`
          })

        res.status(HttpStatus.OK).json({ status: HttpStatus.OK, agent })
        next()
      })
      .catch(e => {
        res.json(Boom.internal('Error on Fetching Agent', skills)) && next(e)
      })
  })
}
