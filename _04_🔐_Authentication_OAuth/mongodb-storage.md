# MongoDB Storage & User Modeling for OAuth 🔐🍃

When integrating OAuth, how you structure your MongoDB models is critical for scalability and supporting multiple login methods.

### 1. The Unified User Schema
A senior developer approach is to create a single User model that can handle multiple OAuth providers. This allows a user to link their Google, GitHub, and Facebook accounts to the same profile.

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Info
  displayName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
  image: String,
  
  // Provider IDs (Stored separately)
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  
  // Role-based Access Control
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

### 2. The "Find or Create" Logic
When a user authenticates via OAuth, the flow in your backend should be:

1.  **Extract ID:** Get the provider-specific ID (e.g., `profile.id` from Google).
2.  **Search:** Check if a user with that `googleId` already exists.
3.  **Check Email (Optional but Recommended):** If no ID match, check if a user with the same `email` exists.
    *   If yes, link the `googleId` to that existing account (Account Linking).
    *   If no, create a brand new User record.

### 3. Handling Multiple Emails
Some providers (like GitHub) return an array of emails. Always prioritize the one marked as `primary` and `verified`.

```javascript
// Example GitHub Email Extraction
const primaryEmail = profile.emails.find(e => e.primary && e.verified) || profile.emails[0];
```

### 4. Account Linking Strategy
To prevent duplicate accounts for the same person:
- If a user logs in with Google and then later with GitHub (using the same email), you should ideally merge these into one document.
- **Security Warning:** Only link accounts based on email if the email is **verified** by the provider.

### 5. Storing Sensitive Data
- **Access Tokens:** Avoid storing these in the User document unless you need to perform background actions (like syncing Google Calendar).
- **Refresh Tokens:** If you store these, **encrypt them** before saving to MongoDB.
- **Passwords:** If you also support traditional Email/Password login, ensure passwords are hashed with `bcrypt` and stored in a `password` field that is `select: false` by default.

### 6. Indexing for Performance
Ensure you have unique indexes on all provider IDs and the email field:
```javascript
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });
```
Using `{ sparse: true }` is essential because not every user will have every provider ID.
