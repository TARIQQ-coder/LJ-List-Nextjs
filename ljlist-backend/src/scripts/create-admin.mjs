// Creates (or promotes) an admin user.
// Usage: node src/scripts/create-admin.mjs +233XXXXXXXXX "StrongPassword" "Display Name"

import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDb } from '../db.mjs'
import { User } from '../models/index.mjs'

const [phone, password, name] = process.argv.slice(2)
if (!phone || !password || password.length < 8) {
  console.error('Usage: node src/scripts/create-admin.mjs <phone> <password (min 8)> "<name>"')
  process.exit(1)
}

const normalized = /^0\d{9}$/.test(phone) ? `+233${phone.slice(1)}` : phone

await connectDb()
let user = await User.findOne({ phone_number: normalized })

if (user) {
  user.role = 'admin'
  user.password_hash = await bcrypt.hash(password, 10)
  user.token_version = (user.token_version || 0) + 1
  await user.save()
  console.log(`✓ Existing user ${normalized} promoted to admin, password set.`)
} else {
  user = await User.create({
    display_name: name || 'LJ-list Admin',
    phone_number: normalized,
    password_hash: await bcrypt.hash(password, 10),
    role: 'admin',
    phone_verified: true,
  })
  console.log(`✓ Admin created: ${normalized}`)
}
await mongoose.disconnect()