import { config } from '../config.mjs'

// Multi-provider SMS sender. Set SMS_PROVIDER=arkesel or SMS_PROVIDER=hubtel
// in .env. With no provider configured, messages print to the console (dev mode).

async function sendViaArkesel(recipient, message) {
  const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: {
      'api-key': config.arkeselApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: config.smsSenderId,
      message,
      recipients: [recipient],
    }),
  })
  return { res, body: await res.json().catch(() => ({})) }
}

async function sendViaHubtel(recipient, message) {
  const basic = Buffer.from(
    `${config.hubtelClientId}:${config.hubtelClientSecret}`,
  ).toString('base64')

  const res = await fetch('https://smsc.hubtel.com/v1/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      From: config.smsSenderId,
      To: recipient,
      Content: message,
    }),
  })
  return { res, body: await res.json().catch(() => ({})) }
}

export async function sendSms(phoneNumber, message) {
  const provider = config.smsProvider

  if (!provider) {
    console.log(`\n📱 [DEV SMS → ${phoneNumber}] ${message}\n`)
    return { dev: true }
  }

  // Both providers want international format without the leading +
  const recipient = phoneNumber.replace(/^\+/, '')

  try {
    const { res, body } =
      provider === 'hubtel'
        ? await sendViaHubtel(recipient, message)
        : await sendViaArkesel(recipient, message)

    if (!res.ok || body.status === 'error') {
      // Never block signup because SMS failed — log and let resend-otp retry
      console.error(`${provider} SMS failed:`, res.status, JSON.stringify(body))
      return { error: true }
    }

    console.log(`✓ SMS sent via ${provider} to ${recipient}`)
    return body
  } catch (err) {
    console.error(`${provider} SMS network error:`, err.message)
    return { error: true }
  }
}