const { createContainer, asValue } = require('awilix')

function initDI(
  { serverSettings, dbSettings, dbReplicaSettings, database, models, services },
  mediator
) {
  mediator.once('init', () => {
    mediator.on('db.ready', db => {
      const container = createContainer()

      container.register({
        database: asValue(db),
        agentModel: asValue(models.Agent),
        ObjectID: asValue(database.ObjectID),
        serverSettings: asValue(serverSettings),
        publisherService: asValue(services.publisher),
        subscriberService: asValue(services.subscriber)
      })

      mediator.emit('di.ready', container)
    })

    mediator.on('db.connection.error', err => {
      mediator.emit('di.error', err)
    })

    database.connect(
      { ...dbSettings, dbReplicaSettings },
      mediator
    )

    mediator.emit('boot.ready')
  })
}

module.exports.initDI = initDI
