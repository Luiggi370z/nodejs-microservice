const amqp = require('amqplib/callback_api')

export const PublishAgentAvailable = payload => {
  amqp.connect(
    process.env.RABBITMQ_URL,
    (err, conn) => {
      if (err) throw new Error(err)

      conn.createChannel((err, ch) => {
        if (err) throw new Error(err)

        const q = 'agent_queue'

        ch.assertQueue(q, { durable: true })
        ch.sendToQueue(q, Buffer.from(JSON.stringify(payload)), {
          persistent: true
        })
        console.log('[x] Sent', payload)
      })
      setTimeout(() => {
        conn.close()
      }, 500)
    }
  )
}
