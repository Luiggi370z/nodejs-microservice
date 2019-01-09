const getSkillsProjection = skills => {
  let projection = {
    startTime: null
  }

  Object.keys(skills).forEach(
    key =>
      (projection = {
        ...projection,
        [`payload.${key}`]: !Array.isArray(skills[key])
          ? skills[key]
          : { $in: skills[key] }
      })
  )
  return projection
}

class Repository {
  constructor(container) {
    this.db = container.cradle.database
    this.taskModel = container.cradle.taskModel
  }

  pushTask = async ({ type, payload }) => {
    const newTask = new this.taskModel({ createdOn: new Date(), type, payload })
    console.log('pushTask', newTask)

    try {
      return await newTask.save()
    } catch (e) {
      console.log('pushTask exception', e)
      throw e
    }
  }

  popTask = async agentSkills => {
    let projection = getSkillsProjection(agentSkills)
    console.log('popTask projection', projection)
    try {
      return await this.taskModel.findOneAndUpdate(
        projection,
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

  upgradePriority = async id => {
    try {
      let existingTask = await this.taskModel.findByIdAndUpdate(
        id,
        {
          $set: { startTime: null },
          $inc: { priority: 1 }
        },
        {
          new: true
        }
      )

      if (!existingTask)
        throw new Error(`Task with id '${id}' not found or already assigned!`)

      return existingTask
    } catch (e) {
      throw e
    }
  }

  completeTask = async id => {
    try {
      let completedTask = await this.taskModel.findByIdAndUpdate(
        id,
        {
          $set: { endTime: new Date() }
        },
        { new: true }
      )

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
