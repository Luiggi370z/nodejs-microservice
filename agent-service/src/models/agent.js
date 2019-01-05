const mongoose = require('mongoose')

const AgentSchema = new mongoose.Schema({
  // TODO: A flag like priority can be added for better agents according to the incoming task/skills

  agentId: {
    type: String,
    required: [true, 'Agent id is required.'],
    unique: true
  },
  createdAt: {
    type: Date,
    default: null,
    index: { name: 'CreatedAt' }
  },
  assignedAt: {
    type: Date,
    default: null,
    index: { name: 'AssignedAgents', expires: '3m' }
  },
  skills: {
    type: Object,
    required: [true, 'Agent skills are required.']
  }
}).index({ assignedAt: 1, createdAt: 1 }, { name: 'AvailableAgents' })

export const Agent = mongoose.model('Agent', AgentSchema)
