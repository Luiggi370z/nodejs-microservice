const getSkillsProjection = skills => {
  let projection = {
    assignedAt: null
  }

  Object.keys(skills).forEach(
    key => (projection = { ...projection, [`skills.${key}`]: skills[key] })
  )
  return projection
}

class Repository {
  constructor(container) {
    this.db = container.cradle.database
    this.agentModel = container.cradle.agentModel
  }

  pushAgent = async ({ agentId, skills }) => {
    const availableAgent = new this.agentModel({
      agentId,
      skills,
      createdAt: new Date()
    })

    try {
      return await availableAgent.save()
    } catch (e) {
      throw e
    }
  }

  getAgentFor = async skills => {
    let projection = getSkillsProjection(skills)

    try {
      return await this.agentModel.findOneAndUpdate(
        projection,
        { $set: { assignedAt: new Date() } },
        {
          new: true,
          sort: {
            createdAt: 1
          }
        }
      )
    } catch (e) {
      throw e
    }
  }

  getAvailableAgents = async () => {
    try {
      return await this.agentModel
        .find({ assignedAt: null })
        .sort({ createdAt: 1 })
        .exec()
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
