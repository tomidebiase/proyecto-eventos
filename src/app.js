import express from 'express'
import mongoose from 'mongoose'

import { config } from './config/env.js'

import healthRouter from './routes/health.router.js'
import eventsRouter from './routes/events.router.js'
import sessionsRouter from './routes/sessions.router.js'

import { errorHandler } from './middlewares/error.middleware.js'

const app = express()

app.use(express.json())

try {
  await mongoose.connect(config.MONGO_URL)
  console.log('Base de datos conectada')
} catch (error) {
  console.error('Error al conectar MongoDB:', error.message)
}

app.use('/api/health', healthRouter)
app.use('/api/events', eventsRouter)
app.use('/api/sessions', sessionsRouter)

app.use(errorHandler)

export default app