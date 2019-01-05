const amqp = require('amqplib')

export class Publisher {
  connection = null
  channel = null

  constructor(options) {
    const { exchange, url, type } = options

    this.exchange = exchange
    this.url = url
    this.type = type
  }

  start = async () => {
    if (this.channel) throw new Error('Channel already started!')

    this.connection = await amqp.connect(this.url)

    this.channel = await this.connection.createChannel()

    await this.channel.assertExchange(this.exchange, this.type, {
      durable: true
    })
  }

  stop = async () => {
    if (!this.channel) throw new Error('Channel is not started!')
    await this.channel.close()
    this.channel = undefined
  }

  publish = async (key, message) => {
    if (!this.channel) throw new Error('Channel is not started!')
    const buffer = Buffer.from(message)
    console.log('publish', this.exchange, key, message)
    return this.channel.publish(this.exchange, key, buffer)
  }

  close = async () => {
    if (!this.connection) throw new Error('Connection is not established!')
    await this.connection.close()
    this.channel = undefined
    this.connection = undefined
  }
}
