# Integration Guide - Webhooks (Generic Pattern) 🔄

### 1. The Webhook Receiver (Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Important: Webhook providers often require raw body for signature verification
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-provider-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // 1. Verify Signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid Signature');
  }

  // 2. Parse Body
  const event = JSON.parse(req.body);

  // 3. Respond Quickly (Acknowledge)
  res.status(200).send('Received');

  // 4. Process Asynchronously (Don't make the sender wait!)
  processEventInBackground(event);
});
```

### 2. Idempotency (Preventing Duplicate Processing)
Since webhooks can be retried, your server might receive the same event twice.

```javascript
async function processEventInBackground(event) {
  const eventId = event.id;
  
  // Check if we already processed this
  const alreadyProcessed = await db.processedEvents.findOne({ id: eventId });
  if (alreadyProcessed) return;

  // Process...
  
  // Mark as processed
  await db.processedEvents.insert({ id: eventId, processedAt: new Date() });
}
```

### 3. Best Practices
- **Use a Secret:** Never accept webhook data without verifying a signature.
- **Process in Background:** Use a queue (BullMQ/RabbitMQ) for long-running tasks triggered by webhooks.
- **Dedicated Endpoint:** Give each provider their own URL (e.g., `/webhooks/stripe`, `/webhooks/github`).
- **Monitoring:** Log every webhook attempt (success/failure) for troubleshooting.
- **Security:** Use HTTPS and consider IP whitelisting if the provider supports it.
