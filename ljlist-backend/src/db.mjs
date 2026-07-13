import mongoose from 'mongoose'
import { config } from './config.mjs'

export async function connectDb() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(config.mongoUri)
  console.log(`✓ MongoDB connected: ${config.mongoUri}`)
}
