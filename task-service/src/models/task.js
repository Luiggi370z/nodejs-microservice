const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    createdOn: {
        type: Date
    },
    priority: {
        type: Number,
        default: 0
    },
    processId: {
        type: Number
    },
    payload: {
        type: Object,
        required: [true, 'Task payload info is required.']
    }
})

module.exports = mongoose.model('Task', TaskSchema)
