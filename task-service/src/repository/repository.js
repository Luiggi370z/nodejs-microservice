'use strict'
class Repository {
  constructor(container) {
    this.db = container.cradle.database
    this.taskModel = container.cradle.taskModel
    console.log('this.taskModel', this.taskModel)
  }

  pushTask = async payload => {
    const task = new this.taskModel({ createdOn: new Date(), payload })

    task.save((err, newTask) => {
      if (err) {
        throw new Error(err)
      }

      return newTask
    })
  }

  disconnect = () => {
    this.db.close()
  }
}

const connect = async container => {
  if (!container) {
    throw new Error('container not supplied!')
  }

  return new Repository(container)
}

module.exports = Object.assign({}, { connect })
