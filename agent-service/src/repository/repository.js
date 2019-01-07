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
    try {
      let existingAgent = await this.agentModel.findOneAndUpdate(
        { agentId },
        { $set: { assignedAt: null, createdAt: new Date() } },
        { new: true }
      )

      if (existingAgent && existingAgent.agentId === agentId)
        return existingAgent

      let newAgent = new this.agentModel({
        agentId,
        skills,
        createdAt: new Date()
      })

      return await newAgent.save()
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

  requeueAgent = async agentId => {
    try {
      return await this.agentModel.findOneAndUpdate(
        { agentId },
        { $set: { assignedAt: null, createdAt: new Date() } },
        { new: true }
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

  resetAgent = async agentId => {
    return this.agentModel.findOneAndUpdate(
      agentId,
      { $set: { assignedAt: null, createdAt: new Date() } },
      { new: true }
    )
  }
}

const connect = async container => {
  if (!container) {
    throw new Error('Container not supplied!')
  }

  return new Repository(container)
}

module.exports = Object.assign({}, { connect })
