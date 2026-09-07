import mongoose from 'mongoose'
import { config } from './env.js'

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL)
    console.log('Base de datos conectada')
  } catch (error) {
    console.error('Error al conectar MongoDB:', error.message)
    process.exit(1)
  }
}