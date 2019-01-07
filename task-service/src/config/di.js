const { createContainer, asValue } = require('awilix')

function initDI(
  { serverSettings, dbSettings, database, models, services },
  mediator
) {
  mediator.once('init', () => {
    mediator.on('db.ready', db => {
      const container = createContainer()

      container.register({
        database: asValue(db),
        taskModel: asValue(models.Task),
        ObjectID: asValue(database.ObjectID),
        serverSettings: asValue(serverSettings),
        publisherService: asValue(services.publisher),
        subscriberService: asValue(services.subscriber)
      })

      mediator.emit('di.ready', container)
    })

    mediator.on('db.error', err => {
      mediator.emit('di.error', err)
    })

    database.connect(
      dbSettings,
      mediator
    )

    mediator.emit('boot.ready')
  })
}

module.exports.initDI = initDI
