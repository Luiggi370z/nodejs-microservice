const express = require('express')
const {TaskController} = require('../controllers')

const router = express.Router()

router.post('/task', TaskController.postTask)

module.exports = router
