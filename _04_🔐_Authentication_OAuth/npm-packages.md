# NPM Packages - Authentication (OAuth) 🔐

### 1. Recommended Package: `passport` & `passport-google-oauth20`
The most flexible middleware for authentication in Node.js.

- **NPM Links:** [passport](https://www.npmjs.com/package/passport), [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20)
- **Install Command:** `npm install passport passport-google-oauth20 passport-github2`

#### Code Example (Express + MongoDB)
```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // Check MongoDB for existing user
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      });
    }
    return done(null, user);
  }
));
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `auth0` | [Link](https://www.npmjs.com/package/auth0) | Complete identity platform. |
| `firebase-admin` | [Link](https://www.npmjs.com/package/firebase-admin) | Firebase Auth for easy social logins. |
| `next-auth` | [Link](https://www.npmjs.com/package/next-auth) | Specifically for Next.js apps. |
