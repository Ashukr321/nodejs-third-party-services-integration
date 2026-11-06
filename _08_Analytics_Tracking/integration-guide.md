# Integration Guide - Analytics (Mixpanel Example) 📊

### 1. Server-side Tracking (Node.js)

```javascript
// npm install mixpanel
const Mixpanel = require('mixpanel');
const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

// Track an event
function trackPurchase(userId, amount, items) {
  mixpanel.track('Purchase Completed', {
    distinct_id: userId,
    amount: amount,
    item_count: items.length,
  });
}

// Set user properties
function updateUserProfile(user) {
  mixpanel.people.set(user.id, {
    $email: user.email,
    $last_login: new Date(),
    plan: 'Premium'
  });
}
```

### 2. Using Segment (The "Middleware" for Analytics)
Segment allows you to send data to one place, and they route it to Google Analytics, Mixpanel, Slack, etc.

```javascript
// npm install @segment/analytics-node
const { Analytics } = require('@segment/analytics-node');
const analytics = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });

analytics.identify({
  userId: 'user_123',
  traits: { email: 'john@example.com' }
});

analytics.track({
  userId: 'user_123',
  event: 'Item Added',
  properties: { sku: 'p_456' }
});
```

### 3. Best Practices
- **Naming Conventions:** Use a consistent naming scheme (e.g., `Object Action` -> `Order Completed`).
- **Don't Track PII:** Never send passwords or sensitive personal info to analytics providers.
- **Batching:** If tracking many events, use batching to reduce network overhead.
- **Validation:** Use a tracking plan (spreadsheet) to ensure all developers use the same event names and properties.
- **Server-side is King:** For critical business metrics (revenue), always use server-side tracking to avoid data loss from AdBlockers.
