import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { config } from './config.mjs'
import { errorMiddleware, notFound } from './utils/respond.mjs'

import authRoutes from './routes/auth.mjs'
import profileRoutes from './routes/profile.mjs'
import productRoutes from './routes/products.mjs'
import packageRoutes from './routes/packages.mjs'
import applicationRoutes from './routes/applications.mjs'
import conversationRoutes from './routes/conversations.mjs'
import adminRoutes from './routes/admin/index.mjs'

export function createApp() {
  const app = express()

  app.use(cors({
    origin(origin, cb) {
      // Allow same-origin/no-origin (curl, admin behind vite proxy) and configured origins
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true)
      cb(null, false)
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: '7d' }))

  app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/profile', profileRoutes)
  app.use('/api/v1/products', productRoutes)
  app.use('/api/v1/packages', packageRoutes)
  app.use('/api/v1/applications', applicationRoutes)
  app.use('/api/v1/conversations', conversationRoutes)
  app.use('/api/v1/admin', adminRoutes)

  app.use((req, _res, next) => next(notFound(`No route: ${req.method} ${req.path}`)))
  app.use(errorMiddleware)

  return app
}
