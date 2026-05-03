# Integration Guide - Payment Gateways (Stripe Example) 💳

A senior developer's approach to integrating a payment gateway in Node.js.

### 1. Prerequisites
- Create a developer account (Stripe, Razorpay, etc.).
- Obtain your **Publishable Key** (Frontend) and **Secret Key** (Backend).

### 2. Backend Implementation (Node.js)

```javascript
// npm install stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Payment Intent
async function createPaymentIntent(amount, currency = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });
    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Stripe Error:', error.message);
    throw error;
  }
}
```

### 3. Handling Webhooks (Critical)

```javascript
const express = require('express');
const app = express();

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Fulfill the purchase (e.g., update database)
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

### 4. Best Practices
- **Never store raw card details.** Use tokenization.
- **Use Environment Variables** for API keys.
- **Implement Idempotency Keys** to prevent double-charging on network retries.
- **Always verify Webhook signatures.**
- **Log transaction IDs** for debugging and auditing.
- **Handle Edge Cases:** Card declines, insufficient funds, expired cards.
