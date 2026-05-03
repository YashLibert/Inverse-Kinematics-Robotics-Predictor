import express from 'express'
import RobotConfig from '../models/RobotConfig.js'

const router = express.Router()

// GET /api/configs
router.get('/', async (req, res, next) => {
  try {
    const configs = await RobotConfig.find().sort({ createdAt: -1 })
    res.json({ success: true, count: configs.length, data: configs })
  } catch (err) {
    next(err)
  }
})

// POST /api/configs
router.post('/', async (req, res, next) => {
  try {
    const config = await RobotConfig.create(req.body)
    res.status(201).json({ success: true, data: config })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Config name already exists' })
    }
    next(err)
  }
})

// DELETE /api/configs/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const config = await RobotConfig.findByIdAndDelete(req.params.id)
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' })
    res.json({ success: true, message: 'Deleted' })
  } catch (err) {
    next(err)
  }
})

export default router