# NPM Packages - Webhooks & Event Handling 🔄

### 1. Recommended Tools: `crypto` (Built-in) & `express`
Webhooks are mostly handled with standard Express routes and cryptographic verification.

- **NPM Link:** [https://www.npmjs.com/package/express](https://www.npmjs.com/package/express)
- **Install Command:** `npm install express body-parser`

#### Code Example (Express + MongoDB)
```javascript
const express = require('express');
const crypto = require('crypto');
const WebhookEvent = require('../models/WebhookEvent');

async function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // 1. Verify HMAC Signature
  const hash = crypto.createHmac('sha256', secret)
                     .update(JSON.stringify(req.body))
                     .digest('hex');

  if (signature !== hash) {
    return res.status(401).send('Invalid signature');
  }

  // 2. Prevent Duplicate Processing (Idempotency)
  const existing = await WebhookEvent.findOne({ eventId: req.body.id });
  if (existing) return res.status(200).send('Duplicate');

  // 3. Store and Process
  await WebhookEvent.create({
    eventId: req.body.id,
    type: req.body.type,
    payload: req.body
  });

  res.status(200).send('OK');
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `svix` | [Link](https://www.npmjs.com/package/svix) | Webhooks-as-a-service for sending/receiving. |
| `micro-webhooks` | [Link](https://www.npmjs.com/package/micro-webhooks) | Lightweight webhook handler for Micro. |
| `hookdeck` | [Link](https://www.npmjs.com/package/hookdeck) | Infrastructure to manage and monitor webhooks. |
| `standardwebhooks` | [Link](https://www.npmjs.com/package/standardwebhooks) | Implementation of the Standard Webhooks spec. |
