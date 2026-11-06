# Payment Verification - Payment Gateways 💳

**Rule #1: never trust the frontend.** A "payment success" message from the browser can be faked with DevTools. Only mark an order paid after your **server** confirms it with the gateway.

> Flow diagrams: see "Payment Verification" and "Razorpay Signature" in [flowdiagram.html](flowdiagram.html).

### 1. Ways to verify

| Method | When | Trust |
|--------|------|-------|
| **Webhook with signature check** | Always (primary) | ✅ High |
| **Server-side fetch from gateway API** | On redirect / user returns | ✅ High |
| **Razorpay checkout signature** | Right after Razorpay checkout | ✅ High (HMAC) |
| Frontend success callback | Show UI only | ❌ Never for fulfilment |

### 2. What to check (not just "status = success")
1. **Signature** is valid (webhook / Razorpay HMAC).
2. **Status** is `succeeded` (Stripe) / `captured` (Razorpay).
3. **Amount** equals the order amount in your DB.
4. **Currency** equals the order currency.
5. **Order ID** in gateway metadata matches your order.
6. **Not already processed** (see [Idempotency.md](Idempotency.md)).

Skipping 3–5 lets an attacker pay ₹1 for one order and reuse that payment ID on a ₹10,000 order.

### 3. Stripe: verify webhook signature

```javascript
// Must use the RAW body. express.json() before this route breaks the signature.
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook signature failed: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await markOrderPaid(pi.metadata.orderId, pi.amount_received, pi.currency, pi.id);
  }
  res.json({ received: true });
});

async function markOrderPaid(orderId, amount, currency, gatewayPaymentId) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.amount !== amount || order.currency !== currency) {
    // Do not fulfil. Flag for manual review.
    await Order.updateOne({ _id: orderId }, { $set: { status: 'amount_mismatch' } });
    return;
  }
  await Order.updateOne(
    { _id: orderId, status: 'pending' },
    { $set: { status: 'paid', gatewayPaymentId, paidAt: new Date() } }
  );
}
```

### 4. Stripe: verify on redirect (server-side fetch)

```javascript
// GET /payments/confirm?payment_intent=pi_xxx  (Stripe adds this to return_url)
app.get('/payments/confirm', auth, async (req, res) => {
  const pi = await stripe.paymentIntents.retrieve(req.query.payment_intent);
  const order = await Order.findOne({ _id: pi.metadata.orderId, userId: req.user.id });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (pi.status === 'succeeded') {
    await markOrderPaid(order._id, pi.amount_received, pi.currency, pi.id);
  }
  res.json({ status: pi.status });
});
```

### 5. Razorpay: verify checkout signature
After checkout, Razorpay gives the frontend `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`. The frontend sends them to your server:

```javascript
const crypto = require('crypto');

app.post('/payments/razorpay/verify', auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  // timingSafeEqual avoids timing attacks; lengths must match first or it throws
  const valid =
    typeof razorpay_signature === 'string' &&
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

  if (!valid) return res.status(400).json({ error: 'Invalid signature' });

  // Signature proves authenticity; still check amount against your order
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, userId: req.user.id });
  if (!order || payment.amount !== order.amount || payment.status !== 'captured') {
    return res.status(400).json({ error: 'Payment does not match order' });
  }

  await Order.updateOne({ _id: order._id, status: 'pending' }, { $set: { status: 'paid', gatewayPaymentId: razorpay_payment_id } });
  res.json({ ok: true });
});
```

### 6. Razorpay: verify webhook signature

```javascript
app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET) // webhook secret, NOT key secret
    .update(req.body) // raw body buffer
    .digest('hex');
  const received = req.headers['x-razorpay-signature'] || '';

  if (expected.length !== received.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
    return res.status(400).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  if (event.event === 'payment.captured') {
    const p = event.payload.payment.entity;
    // look up order by p.order_id, check p.amount, mark paid (same as above)
  }
  res.json({ received: true });
});
```

### 7. Common mistakes
- Using `express.json()` globally, so the webhook gets a parsed object and the signature never matches.
- Using `===` to compare signatures instead of `crypto.timingSafeEqual`.
- Fulfilling on the browser redirect only. Users close tabs; always handle the webhook too.
- Not checking amount/currency against your own DB.
- Mixing up the Razorpay **key secret** (checkout signature) and **webhook secret** (webhook signature).
