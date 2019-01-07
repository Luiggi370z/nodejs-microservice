const amqp = require('amqplib')

const QUEUE_NOT_STARTED = 'Queue is not started!'

export class Subscriber {
  connection = null
  channel = null
  queue = null

  constructor(options) {
    const { exchange, url, type, queueName, routingKeys } = options

    if (!exchange) throw new Error('Exchange is missing!')
    if (!queueName) throw new Error('Queue name is missing!')

    this.exchange = exchange
    this.url = url
    this.type = type
    this.queueName = queueName
    this.routingKeys = routingKeys
  }

  start = async handler => {
    if (this.channel) throw new Error('Channel already started!')

    this.connection = await amqp.connect(this.url)

    this.channel = await this.connection.createChannel()

    this.channel.assertExchange(this.exchange, this.type, {
      durable: true
    })

    const result = await this.channel.assertQueue(this.queueName, {
      exclusive: false
    })

    this.queue = result.queue

    const rKeys = this.routingKeys || [this.queueName]

    rKeys.forEach(rKey => {
      this.channel.bindQueue(this.queue, this.exchange, rKey)
    })

    this.channel.prefetch(1)
    this.channel.consume(this.queue, handler)
  }

  stop = async () => {
    if (!this.channel) throw new Error(QUEUE_NOT_STARTED)
    await this.channel.close()
    this.channel = undefined
  }

  ack = message => {
    if (!this.channel) throw new Error(QUEUE_NOT_STARTED)
    this.channel.ack(message)
  }

  nack = message => {
    if (!this.channel) throw new Error(QUEUE_NOT_STARTED)
    this.channel.nack(message)
  }

  purgeQueue = async () => {
    if (!this.channel) throw new Error(QUEUE_NOT_STARTED)
    await this.channel.purgeQueue(this.queue)
  }

  close = async () => {
    if (!this.connection) throw new Error('Connection is not established!')
    await this.connection.close()
    this.channel = undefined
    this.connection = undefined
  }
}
