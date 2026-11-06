# Idempotency - Payment Gateways 💳

An operation is **idempotent** if running it once or ten times gives the same result. In payments this is what stops a user from being charged twice.

> Flow diagram: see "Idempotency" in [flowdiagram.html](flowdiagram.html).

### 1. Why it matters
- User double-clicks **Pay**.
- Network times out after the gateway charged the card, so your server retries.
- Gateway delivers the same webhook more than once (this is normal: delivery is *at least once*).

Without idempotency, each of these can create a second charge, a second order, or a second email.

### 2. Three layers of idempotency

| Layer | Problem | Fix |
|-------|---------|-----|
| Client → Your API | Double click, client retry | `Idempotency-Key` header, stored in Redis/DB |
| Your API → Gateway | Retry after timeout | Gateway idempotency key (Stripe `idempotencyKey`, Razorpay `receipt`) |
| Gateway → Your Webhook | Duplicate events | Store processed `event.id` with a unique index |

### 3. Your API → Gateway (Stripe)
Stripe stores the result for a key for 24 hours. Same key + same params = same response, no new charge.

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(order) {
  return stripe.paymentIntents.create(
    {
      amount: order.amount, // already in smallest unit (cents/paise)
      currency: order.currency,
      metadata: { orderId: String(order._id) },
    },
    { idempotencyKey: `pi-create-${order._id}` } // derived from the order, so a retry reuses it
  );
}
```

> Derive the key from something stable (order ID), not `uuid()` per call. A fresh UUID on retry defeats the purpose.

### 4. Client → Your API (Express middleware with Redis)

```javascript
const { createClient } = require('redis');
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();

async function idempotency(req, res, next) {
  const key = req.get('Idempotency-Key');
  if (!key) return res.status(400).json({ error: 'Idempotency-Key header required' });

  const redisKey = `idem:${req.user.id}:${key}`; // scope per user so keys can't collide across users

  // NX = only set if missing. Atomic, so two parallel requests can't both win.
  const acquired = await redis.set(redisKey, JSON.stringify({ status: 'processing' }), { NX: true, EX: 86400 });

  if (!acquired) {
    const saved = JSON.parse(await redis.get(redisKey));
    if (saved.status === 'processing') return res.status(409).json({ error: 'Request already in progress' });
    return res.status(saved.code).json(saved.body); // replay the stored response
  }

  // Capture the response so the next retry gets the same answer
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 500) redis.del(redisKey); // server error: allow a real retry
    else redis.set(redisKey, JSON.stringify({ status: 'done', code: res.statusCode, body }), { EX: 86400 });
    return originalJson(body);
  };
  next();
}

app.post('/orders', auth, idempotency, createOrderHandler);
```

Frontend side: generate the key **once per checkout attempt** and reuse it on retries.

```javascript
const idemKey = crypto.randomUUID(); // created when checkout page loads, not per click
await fetch('/orders', { method: 'POST', headers: { 'Idempotency-Key': idemKey }, body });
```

### 5. Gateway → Your Webhook (dedupe events)

```javascript
// models/ProcessedEvent.js
const schema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true }, // unique index does the dedupe
  type: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // TTL 30 days
});

// in webhook handler, after signature verification
try {
  await ProcessedEvent.create({ eventId: event.id, type: event.type });
} catch (err) {
  if (err.code === 11000) return res.json({ received: true, duplicate: true }); // already handled
  throw err;
}
await handleEvent(event);
```

> Better: do the `ProcessedEvent.create` and the order update in one **MongoDB transaction**, so a crash between the two doesn't mark an event done that never got applied.

### 6. Make the state change itself idempotent
Even with dedupe, write updates that are safe to repeat:

```javascript
// Only moves pending -> paid. Running it again matches nothing and changes nothing.
await Order.updateOne({ _id: orderId, status: 'pending' }, { $set: { status: 'paid', paidAt: new Date() } });
```

### 7. Checklist
- [ ] Every gateway write call has an idempotency key derived from a stable ID.
- [ ] Checkout endpoint requires `Idempotency-Key` header.
- [ ] Webhook events deduped by `event.id` with a unique index.
- [ ] DB updates are conditional (`status: 'pending'`), not blind overwrites.
- [ ] Pay button is disabled after the first click (UX, not a security control).
