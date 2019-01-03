class Repository {
  constructor(container) {
    this.db = container.cradle.database
    this.taskModel = container.cradle.taskModel
  }

  pushTask = async payload => {
    const newTask = new this.taskModel({ createdOn: new Date(), payload })

    let result = null

    try {
      result = await newTask.save()
    } catch (e) {
      throw new Error('Error saving task', e)
    }

    return result
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
