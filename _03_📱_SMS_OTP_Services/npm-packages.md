# NPM Packages - SMS & OTP Services 📱

### 1. Recommended Package: `twilio`
The industry leader for SMS, Voice, and WhatsApp.

- **NPM Link:** [https://www.npmjs.com/package/twilio](https://www.npmjs.com/package/twilio)
- **Install Command:** `npm install twilio`

#### Code Example (Express + MongoDB)
```javascript
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const User = require('../models/User');

async function sendOTP(req, res) {
  const { phoneNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await client.messages.create({
    body: `Your verification code is ${otp}`,
    to: phoneNumber,
    from: process.env.TWILIO_NUMBER
  });

  // Store OTP in MongoDB with expiry
  await User.findOneAndUpdate(
    { phoneNumber },
    { otp, otpExpires: Date.now() + 300000 }, // 5 mins
    { upsert: true }
  );

  res.json({ message: 'OTP Sent' });
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `messagebird` | [Link](https://www.npmjs.com/package/messagebird) | Great global coverage. |
| `vonage` | [Link](https://www.npmjs.com/package/@vonage/server-sdk) | Formerly Nexmo, very reliable. |
