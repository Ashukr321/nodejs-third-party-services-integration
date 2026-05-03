# NPM Packages - Notifications & Push 🔔

### 1. Recommended Package: `firebase-admin`
The standard for cross-platform (iOS, Android, Web) push notifications.

- **NPM Link:** [https://www.npmjs.com/package/firebase-admin](https://www.npmjs.com/package/firebase-admin)
- **Install Command:** `npm install firebase-admin`

#### Code Example (Express + MongoDB)
```javascript
const admin = require('firebase-admin');
const User = require('../models/User');

async function notifyUser(userId, title, body) {
  const user = await User.findById(userId);
  
  if (!user.fcmToken) return;

  const message = {
    notification: { title, body },
    token: user.fcmToken
  };

  await admin.messaging().send(message);
  
  // Log notification in MongoDB
  await NotificationLog.create({
    userId,
    title,
    sentAt: new Date()
  });
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `onesignal-node` | [Link](https://www.npmjs.com/package/onesignal-node) | Easy-to-use notification service. |
| `web-push` | [Link](https://www.npmjs.com/package/web-push) | Direct implementation of Web Push protocol. |
| `push-notifications-node` | [Link](https://www.npmjs.com/package/@pusher/push-notifications-server) | Pusher's Beams service. |
