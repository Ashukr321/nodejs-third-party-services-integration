# Integration Guide - OAuth (Passport.js Example) 🔐

Passport.js is the most popular authentication middleware for Node.js.

### 1. Setup Strategies (Multi-Provider)

```javascript
// npm install passport passport-google-oauth20 passport-github2
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User'); // Mongoose Model

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or Create user in MongoDB
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.create({
          githubId: profile.id,
          displayName: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value,
          image: profile.photos?.[0]?.value
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));
```

### 2. Routes

```javascript
const express = require('express');
const router = express.Router();

// --- Google Auth ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => res.redirect('/'));

// --- GitHub Auth ---
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => res.redirect('/'));
```

### 3. Best Practices
- **Use HTTPS:** OAuth tokens are sensitive and must never be transmitted over plain HTTP.
- **State Parameter:** Always use a `state` parameter to prevent CSRF attacks (Passport handles this automatically in many strategies).
- **Secure Secret Storage:** Never commit `CLIENT_SECRET` to version control.
- **Handle Token Expiry:** Implement logic to use Refresh Tokens to maintain the user's session without re-prompting.
- **JWT for Sessions:** After OAuth, many developers issue a JSON Web Token (JWT) to manage the local session.
