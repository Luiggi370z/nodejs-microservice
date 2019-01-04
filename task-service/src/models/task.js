const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null,
    index: { name: 'CompletedTasks', expires: '1m' }
  },
  createdOn: {
    type: Date,
    index: { name: 'CreatedOn' }
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
}).index({ startTime: 1, priority: -1, createdOn: 1 }, { name: 'NextTask' })

export const Task = mongoose.model('Task', TaskSchema)
