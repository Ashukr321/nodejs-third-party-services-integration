# Refund Handling - Payment Gateways 💳

A refund sends money from a **captured** payment back to the customer. It is asynchronous: the API call starts it, the bank finishes it days later.

> Flow diagram: see "Refund" in [flowdiagram.html](flowdiagram.html).

### 1. Refund vs Cancel vs Chargeback

| Action | When | Who starts it |
|--------|------|---------------|
| **Cancel / Void** | Payment authorized but **not captured** | Merchant. No money moved, no fee. |
| **Refund** | Payment already captured | Merchant |
| **Chargeback / Dispute** | Customer complains to their bank | Customer's bank. Merchant must respond with evidence. |

### 2. Refund lifecycle
- **Stripe refund status:** `pending` → `succeeded` | `failed` | `canceled` (some methods go through `requires_action`).
- **Razorpay refund status:** `pending` → `processed` | `failed`.
- Bank settlement usually takes **5–10 business days** for cards; instant for some UPI/wallets.

### 3. Data model

```javascript
// models/Refund.js
const refundSchema = new mongoose.Schema({
  orderId: { type: mongoose.Types.ObjectId, ref: 'Order', required: true },
  gatewayRefundId: { type: String, unique: true, sparse: true },
  amount: { type: Number, required: true }, // smallest unit
  reason: String,
  status: { type: String, enum: ['requested', 'pending', 'succeeded', 'failed'], default: 'requested' },
  requestedBy: mongoose.Types.ObjectId,
}, { timestamps: true });

// Order has: amount, refundedAmount (default 0), status
```

### 4. Create a refund (Stripe)

```javascript
async function refundOrder(orderId, amount, reason, adminId) {
  // 1. Reserve the amount atomically so two admins can't over-refund the same order
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: { $in: ['paid', 'partially_refunded'] },
      $expr: { $lte: [{ $add: ['$refundedAmount', amount] }, '$amount'] },
    },
    { $inc: { refundedAmount: amount } },
    { new: true }
  );
  if (!order) throw new Error('Order not refundable or amount exceeds remaining balance');

  const refundDoc = await Refund.create({ orderId, amount, reason, requestedBy: adminId });

  try {
    // 2. Call gateway with idempotency key tied to our refund record
    const refund = await stripe.refunds.create(
      { payment_intent: order.gatewayPaymentId, amount, metadata: { orderId: String(orderId), refundId: String(refundDoc._id) } },
      { idempotencyKey: `refund-${refundDoc._id}` }
    );
    await Refund.updateOne({ _id: refundDoc._id }, { gatewayRefundId: refund.id, status: refund.status === 'succeeded' ? 'succeeded' : 'pending' });
    await Order.updateOne(
      { _id: orderId },
      { status: order.refundedAmount === order.amount ? 'refunded' : 'partially_refunded' }
    );
    return refund;
  } catch (err) {
    // 3. Gateway rejected it: release the reserved amount
    await Order.updateOne({ _id: orderId }, { $inc: { refundedAmount: -amount } });
    await Refund.updateOne({ _id: refundDoc._id }, { status: 'failed' });
    throw err;
  }
}
```

### 5. Create a refund (Razorpay)

```javascript
const Razorpay = require('razorpay');
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const refund = await razorpay.payments.refund(order.gatewayPaymentId, {
  amount,                       // paise; omit for full refund
  speed: 'normal',              // 'optimum' tries instant refund where supported
  receipt: `refund-${refundDoc._id}`,
  notes: { orderId: String(order._id) },
});
```

### 6. Track the final result via webhooks

| Gateway | Events |
|---------|--------|
| Stripe | `refund.updated`, `refund.failed`, `charge.refunded` |
| Razorpay | `refund.processed`, `refund.failed` |

```javascript
// inside verified Stripe webhook handler (see Payment verification.md)
case 'refund.updated':
case 'refund.failed': {
  const r = event.data.object;
  const refund = await Refund.findOneAndUpdate(
    { gatewayRefundId: r.id },
    { status: r.status === 'succeeded' ? 'succeeded' : r.status === 'failed' ? 'failed' : 'pending' },
    { new: true }
  );
  if (refund && r.status === 'failed') {
    // Money did not go back: release reserved amount and alert support
    await Order.updateOne({ _id: refund.orderId }, { $inc: { refundedAmount: -refund.amount } });
  }
  break;
}
```

### 7. Best practices
- **Refund only from your backend**, behind admin auth + audit log (`requestedBy`, `reason`).
- **Support partial refunds**; track `refundedAmount` and never let it exceed `amount`.
- **Idempotency key per refund record**, so a retry never refunds twice.
- **Cancel instead of refund** when the payment is only authorized (saves fees).
- **Reverse side effects**: restock inventory, revoke access, cancel subscription, send credit note.
- **Notify the customer** with the refund ID / ARN so they can track it with their bank.
- **Reconcile**: a daily job lists gateway refunds and compares them with your `Refund` collection.
