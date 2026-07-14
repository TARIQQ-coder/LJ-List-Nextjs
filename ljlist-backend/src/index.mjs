import { createApp } from './app.mjs'
import { connectDb } from './db.mjs'
import { config } from './config.mjs'

const app = createApp()

async function main() {
  if (process.env.SKIP_DB !== 'true') {
    await connectDb()
  } else {
    console.log('⚠ SKIP_DB=true — running without MongoDB (routes will fail on DB access)')
  }
  console.log('Cloudinary enabled:', Boolean(process.env.CLOUDINARY_URL))
  app.listen(config.port, () => {
    console.log(`✓ LJ-list API running on ${config.publicUrl} (port ${config.port})`)
  })
}

main().catch(err => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
