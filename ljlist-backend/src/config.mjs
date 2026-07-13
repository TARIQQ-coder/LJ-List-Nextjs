import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ljlist',
  smsProvider: (process.env.SMS_PROVIDER || '').toLowerCase(),
  smsSenderId: process.env.SMS_SENDER_ID || 'LJ-list',
  arkeselApiKey: process.env.ARKESEL_API_KEY || '',
  hubtelClientId: process.env.HUBTEL_CLIENT_ID || '',
  hubtelClientSecret: process.env.HUBTEL_CLIENT_SECRET || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  publicUrl: process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 8080}`,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',').map(s => s.trim()).filter(Boolean),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  accessTtl: '15m',
  refreshTtlDays: 30,
  otpTtlMinutes: 10,
}
