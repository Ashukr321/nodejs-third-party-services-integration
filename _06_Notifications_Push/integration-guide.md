# Integration Guide - Notifications (FCM Example) 🔔

### 1. Sending a Notification (Node.js Admin SDK)

```javascript
// npm install firebase-admin
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
});

async function sendPushNotification(deviceToken, title, body, data = {}) {
  const message = {
    notification: { title, body },
    data: data, // Optional custom data
    token: deviceToken
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

### 2. Multi-device Sending (Topics)
You can subscribe users to "topics" (e.g., `news`, `weather`) and send one message to all subscribers.

```javascript
async function sendToTopic(topic, title, body) {
  const message = {
    notification: { title, body },
    topic: topic
  };
  await admin.messaging().send(message);
}
```

### 3. Best Practices
- **Token Management:** Device tokens change (e.g., user reinstalls app). Delete old/invalid tokens from your DB when FCM returns an error.
- **Personalization:** Use the user's name and relevant context to increase click-through rates.
- **Don't Spam:** Too many notifications lead to users disabling permissions or uninstalling the app.
- **Timing:** Respect time zones. Don't send marketing push at 3 AM.
- **Batching:** Use `sendEach()` for sending multiple individual messages efficiently.
- **Fallback:** If push fails, consider falling back to Email or SMS for critical alerts.
