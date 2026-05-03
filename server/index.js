import express    from 'express'
import cors       from 'cors'
import dotenv     from 'dotenv'
import connectDB  from './config/db.js'
import predictRouter from './routes/predict.js'
import configsRouter from './routes/configs.js'
import errorHandler  from './middleware/errorHandler.js'

dotenv.config()
connectDB()

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/predict', predictRouter)
app.use('/api/configs', configsRouter)

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ik-predictor-server' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})