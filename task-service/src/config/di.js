const { createContainer, asValue } = require('awilix')

function initDI({ serverSettings, dbSettings, database, models }, mediator) {
  mediator.once('init', () => {
    mediator.on('db.ready', db => {
      const container = createContainer()
      console.log('models', models)

      container.register({
        database: asValue(db),
        taskModel: asValue(models.Task),
        ObjectID: asValue(database.ObjectID),
        serverSettings: asValue(serverSettings)
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
