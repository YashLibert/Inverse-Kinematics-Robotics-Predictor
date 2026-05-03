import express from 'express'
import axios from 'axios'
import Prediction from '../models/Prediction.js'

const router = express.Router()

// POST /api/predict
router.post('/', async (req, res, next) => {
  try {
    const {
      x, y, z, yaw, pitch, roll,
      q1_in, q2_in, q3_in, q4_in, q5_in, q6_in
    } = req.body

    // Validate all fields present
    const required = ['x','y','z','yaw','pitch','roll','q1_in','q2_in','q3_in','q4_in','q5_in','q6_in']
    const missing  = required.filter(k => req.body[k] === undefined)
    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` })
    }

    // Call ML service
    const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      x, y, z, yaw, pitch, roll,
      q1_in, q2_in, q3_in, q4_in, q5_in, q6_in
    })

    const { q1, q2, q3, q4, q5, q6, model_info } = mlRes.data

    // Save to MongoDB
    const prediction = await Prediction.create({
      input:      { x, y, z, yaw, pitch, roll, q1_in, q2_in, q3_in, q4_in, q5_in, q6_in },
      output:     { q1, q2, q3, q4, q5, q6 },
      model_info
    })

    res.status(201).json({
      success: true,
      data: {
        id:         prediction._id,
        output:     { q1, q2, q3, q4, q5, q6 },
        model_info,
        createdAt:  prediction.createdAt
      }
    })

  } catch (err) {
    // ML service down
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'ML service unavailable' })
    }
    next(err)
  }
})

// GET /api/predict/history
router.get('/history', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const predictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('input output createdAt model_info')

    res.json({ success: true, count: predictions.length, data: predictions })
  } catch (err) {
    next(err)
  }
})

export default router