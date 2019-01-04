class Repository {
  constructor(container) {
    this.db = container.cradle.database
    this.taskModel = container.cradle.taskModel
  }

  pushTask = async payload => {
    const newTask = new this.taskModel({ createdOn: new Date(), payload })

    try {
      return await newTask.save()
    } catch (e) {
      throw e
    }
  }

  popTask = async () => {
    try {
      return await this.taskModel.findOneAndUpdate(
        { startTime: null },
        { $set: { startTime: new Date() } },
        {
          new: true,
          sort: {
            priority: -1,
            createdOn: 1
          }
        }
      )
    } catch (e) {
      throw e
    }
  }

  pendingTasks = async () => {
    try {
      return await this.taskModel
        .find({ startTime: null })
        .sort({ createdOn: 1 })
        .exec()
    } catch (e) {
      throw e
    }
  }

  completeTask = async id => {
    try {
      let completedTask = await this.taskModel.findByIdAndUpdate(id, {
        $set: { endTime: new Date() }
      })

      if (!completedTask) throw new Error(`Task with id '${id}' not found`)

      return completedTask
    } catch (e) {
      throw e
    }
  }

  disconnect = () => {
    this.db.close()
  }
}

const connect = async container => {
  if (!container) {
    throw new Error('Container not supplied!')
  }

  return new Repository(container)
}

module.exports = Object.assign({}, { connect })
