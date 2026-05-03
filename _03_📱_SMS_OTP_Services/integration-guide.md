# Integration Guide - SMS (Twilio Example) 📱

### 1. Basic SMS Sending

```javascript
// npm install twilio
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, body) {
  try {
    const message = await client.messages.create({
      body: body,
      to: to, // Must be E.164 format (+1234567890)
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    console.log('Message SID:', message.sid);
  } catch (error) {
    console.error('Twilio Error:', error.message);
  }
}
```

### 2. OTP Verification (Using Twilio Verify)
Twilio Verify handles the generation, storage, and validation of OTPs for you.

```javascript
// Send Verification Code
async function sendOTP(phoneNumber) {
  return await client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
    .verifications
    .create({ to: phoneNumber, channel: 'sms' });
}

// Check Verification Code
async function checkOTP(phoneNumber, code) {
  const verificationCheck = await client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
    .verificationChecks
    .create({ to: phoneNumber, code: code });
  
  return verificationCheck.status === 'approved';
}
```

### 3. Best Practices
- **E.164 Formatting:** Always store and send phone numbers in the `+` followed by country code format.
- **Rate Limiting:** Protect your API from abuse. Don't allow a user to request 100 OTPs in a minute.
- **Failover:** If SMS fails, consider a fallback to WhatsApp or Email.
- **Privacy:** Mask phone numbers in logs and UI (e.g., `+1******890`).
- **Encoding:** Be aware of GSM-7 vs UCS-2 encoding. Non-English characters (emojis, accents) can double the cost per message.
