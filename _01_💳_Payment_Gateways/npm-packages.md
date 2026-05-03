# NPM Packages - Payment Gateways 💳

### 1. Recommended Package: `stripe`
The gold standard for payments.

- **NPM Link:** [https://www.npmjs.com/package/stripe](https://www.npmjs.com/package/stripe)
- **Install Command:** `npm install stripe`

#### Code Example (Express + MongoDB)
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction'); // Mongoose Model

async function createCheckout(req, res) {
  const { amount, userId } = req.body;

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Order' }, unit_amount: amount }, quantity: 1 }],
    mode: 'payment',
    success_url: 'https://example.com/success',
  });

  // Store in MongoDB
  await Transaction.create({
    userId,
    stripeSessionId: session.id,
    amount,
    status: 'pending'
  });

  res.json({ url: session.url });
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `razorpay` | [Link](https://www.npmjs.com/package/razorpay) | Best for Indian market. |
| `paypal-rest-sdk` | [Link](https://www.npmjs.com/package/paypal-rest-sdk) | Official PayPal SDK. |
| `braintree` | [Link](https://www.npmjs.com/package/braintree) | PayPal-owned, great for multi-method. |
