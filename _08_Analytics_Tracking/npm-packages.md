# NPM Packages - Analytics & Tracking 📊

### 1. Recommended Package: `mixpanel` & `@segment/analytics-node`
Mixpanel for product analytics, Segment for routing data.

- **NPM Links:** [mixpanel](https://www.npmjs.com/package/mixpanel), [@segment/analytics-node](https://www.npmjs.com/package/@segment/analytics-node)
- **Install Command:** `npm install mixpanel @segment/analytics-node`

#### Code Example (Express + MongoDB)
```javascript
const Mixpanel = require('mixpanel');
const User = require('../models/User');
const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

async function trackEvent(req, res) {
  const { eventName, properties } = req.body;
  const user = await User.findById(req.user.id);

  mixpanel.track(eventName, {
    distinct_id: user.id,
    $email: user.email,
    ...properties
  });

  // Optional: Sync event to MongoDB for internal audit
  await EventAudit.create({
    userId: user.id,
    eventName,
    timestamp: new Date()
  });

  res.send('Event Tracked');
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `amplitude` | [Link](https://www.npmjs.com/package/@amplitude/analytics-node) | Focuses on product intelligence. |
| `universal-analytics` | [Link](https://www.npmjs.com/package/universal-analytics) | For older Google Analytics versions. |
| `posthog-node` | [Link](https://www.npmjs.com/package/posthog-node) | Open-source alternative to Mixpanel. |
