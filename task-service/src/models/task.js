const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  createdOn: {
    type: Date
  },
  priority: {
    type: Number,
    default: 0
  },
  processId: {
    type: Number,
    default: null
  },
  payload: {
    type: Object,
    required: [true, 'Task payload info is required.']
  }
})

export default mongoose.model('Task', TaskSchema)
