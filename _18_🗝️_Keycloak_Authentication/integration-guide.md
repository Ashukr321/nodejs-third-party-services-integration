# Integration Guide - Keycloak (Express + jose + openid-client) 🗝️

The official `keycloak-connect` adapter is deprecated by the Keycloak team. The recommended approach is generic, standards-based OIDC libraries:
- **`jose`** → verify access tokens in your APIs.
- **`openid-client`** → login / logout / refresh / client-credentials flows.

### 1. Run Keycloak Locally (Docker)

```bash
docker run -d --name keycloak -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.0 start-dev
```

Then in the admin console (`http://localhost:8080`):
1. Create a realm, e.g. `myrealm`.
2. Create a client `my-api` → **Client authentication: ON** (confidential), Standard flow ON, set **Valid redirect URIs** to `http://localhost:3000/auth/callback`.
3. Create realm roles `user` and `admin`, create a user, assign roles, set a password.
4. (Recommended) Add an **Audience** mapper on the client scope so tokens include `aud: "my-api"`.

### 2. Environment Variables

```env
KEYCLOAK_ISSUER=http://localhost:8080/realms/myrealm
KEYCLOAK_CLIENT_ID=my-api
KEYCLOAK_CLIENT_SECRET=change-me
APP_URL=http://localhost:3000
SESSION_SECRET=change-me-too
```

### 3. Protect API Routes (Bearer Token Verification)

```javascript
// npm install jose
// middleware/keycloakAuth.js
const { createRemoteJWKSet, jwtVerify } = require('jose');

const issuer = process.env.KEYCLOAK_ISSUER;
// Fetched once, cached, and auto-refreshed when Keycloak rotates keys
const JWKS = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing bearer token' });

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience: process.env.KEYCLOAK_CLIENT_ID, // requires the Audience mapper from step 1
    });
    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.preferred_username,
      realmRoles: payload.realm_access?.roles || [],
      clientRoles: payload.resource_access?.[process.env.KEYCLOAK_CLIENT_ID]?.roles || [],
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Usage: requireRole('admin') or requireRole('orders:write', { client: true })
const requireRole = (role, { client = false } = {}) => (req, res, next) => {
  const roles = client ? req.user.clientRoles : req.user.realmRoles;
  return roles.includes(role) ? next() : res.status(403).json({ error: 'Forbidden' });
};

module.exports = { requireAuth, requireRole };
```

```javascript
// app.js
const express = require('express');
const { requireAuth, requireRole } = require('./middleware/keycloakAuth');

const app = express();
app.get('/api/profile', requireAuth, (req, res) => res.json(req.user));
app.delete('/api/users/:id', requireAuth, requireRole('admin'), (req, res) => res.sendStatus(204));
app.listen(3000);
```

### 4. Browser Login Flow (Authorization Code + PKCE)

`openid-client` v6 is ESM-only, so this file uses `import`.

```javascript
// npm install openid-client express-session
// auth.mjs
import express from 'express';
import session from 'express-session';
import * as client from 'openid-client';

const config = await client.discovery(
  new URL(process.env.KEYCLOAK_ISSUER),
  process.env.KEYCLOAK_CLIENT_ID,
  process.env.KEYCLOAK_CLIENT_SECRET,
);
const redirect_uri = `${process.env.APP_URL}/auth/callback`;

const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },
}));

app.get('/auth/login', async (req, res) => {
  const code_verifier = client.randomPKCECodeVerifier();
  const state = client.randomState();
  req.session.oidc = { code_verifier, state };

  const url = client.buildAuthorizationUrl(config, {
    redirect_uri,
    scope: 'openid profile email',
    code_challenge: await client.calculatePKCECodeChallenge(code_verifier),
    code_challenge_method: 'S256',
    state,
  });
  res.redirect(url.href);
});

app.get('/auth/callback', async (req, res, next) => {
  try {
    const { code_verifier, state } = req.session.oidc || {};
    const tokens = await client.authorizationCodeGrant(
      config,
      new URL(req.originalUrl, process.env.APP_URL),
      { pkceCodeVerifier: code_verifier, expectedState: state },
    );
    delete req.session.oidc;

    req.session.regenerate((err) => { // prevent session fixation
      if (err) return next(err);
      req.session.user = tokens.claims(); // sub, email, preferred_username...
      req.session.tokens = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
      };
      res.redirect('/');
    });
  } catch (err) {
    next(err);
  }
});

app.get('/auth/logout', (req, res) => {
  const id_token_hint = req.session.tokens?.id_token;
  req.session.destroy(() => {
    // Ends the Keycloak SSO session too, not just the local one
    const url = client.buildEndSessionUrl(config, {
      post_logout_redirect_uri: process.env.APP_URL,
      ...(id_token_hint && { id_token_hint }),
    });
    res.redirect(url.href);
  });
});

app.listen(3000);
```

### 5. Refreshing Tokens

```javascript
async function getFreshAccessToken(req) {
  const tokens = await client.refreshTokenGrant(config, req.session.tokens.refresh_token);
  req.session.tokens.access_token = tokens.access_token;
  req.session.tokens.refresh_token = tokens.refresh_token ?? req.session.tokens.refresh_token;
  return tokens.access_token;
}
```

### 6. Service-to-Service (Client Credentials)

Enable **Service accounts roles** on the client, then:

```javascript
let cached = { token: null, expiresAt: 0 };

async function getServiceToken() {
  if (cached.token && Date.now() < cached.expiresAt - 30_000) return cached.token; // 30s safety margin
  const tokens = await client.clientCredentialsGrant(config);
  cached = { token: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
  return cached.token;
}

const res = await fetch('http://reports-service/api/reports', {
  headers: { Authorization: `Bearer ${await getServiceToken()}` },
});
```

### 7. Best Practices
- **Never use the `master` realm** for applications — it's for administering Keycloak.
- **Verify `iss` and `aud`** on every token. Without an audience check, a token issued to another client in the same realm would be accepted.
- **Cache JWKS** (`createRemoteJWKSet` does this) — never fetch keys per request.
- **Keep access tokens short** (5–15 min) and rely on refresh tokens for long sessions.
- **Use PKCE** for every login flow, including confidential clients.
- **Store tokens server-side** (session store like Redis), not in `localStorage`.
- **Map users by `sub`**, not by email — emails can change, `sub` doesn't.
- **Run Keycloak in production mode** (`start`, not `start-dev`) behind HTTPS with a real database (PostgreSQL).
- **Set exact redirect URIs** — no wildcards like `*` in production.
