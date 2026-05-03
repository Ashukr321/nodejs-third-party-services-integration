# How Push Notifications Work 🔔

Push notifications are delivered even when the user is not actively using your app.

### 1. The Ecosystem
- **FCM (Firebase Cloud Messaging):** The industry standard for Android, iOS, and Web.
- **APNs (Apple Push Notification service):** Required for iOS (FCM acts as a wrapper for APNs).
- **VAPID:** Voluntary Application Server Identification for Web Push.

### 2. The Flow
1. **Permission:** The frontend asks the user for permission to send notifications.
2. **Registration:** The browser/device registers with the Push Service (e.g., FCM) and receives a unique **Device Token**.
3. **Storage:** The frontend sends this token to your backend, which stores it against the user's ID.
4. **Trigger:** Your backend wants to send a message. It calls the FCM API with the Device Token and Payload.
5. **Delivery:** FCM routes the message to the specific device.

### 3. Payloads
- **Display Messages:** Handled by the OS (System Tray).
- **Data Messages:** Handled by your app (even in background). Useful for silent updates or custom handling.

### 4. Service Workers (Web Only)
A script that runs in the background of the browser, listening for `push` events and displaying the notification.
