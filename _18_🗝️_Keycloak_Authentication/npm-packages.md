# NPM Packages - Keycloak Authentication 🗝️

### 1. Recommended Package: `jose` (verify tokens in APIs)
Zero-dependency JWT/JWKS library. Verifies Keycloak access tokens locally using the realm's public keys.

- **NPM Link:** [jose](https://www.npmjs.com/package/jose)
- **Install Command:** `npm install jose`

#### Code Example (Express + MongoDB)
```javascript
const { createRemoteJWKSet, jwtVerify } = require('jose');
const User = require('../models/User');

const issuer = process.env.KEYCLOAK_ISSUER; // http://localhost:8080/realms/myrealm
const JWKS = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    const { payload } = await jwtVerify(token, JWKS, { issuer, audience: process.env.KEYCLOAK_CLIENT_ID });

    // Keycloak owns identity; MongoDB keeps app-specific data keyed by `sub`
    req.user = await User.findOneAndUpdate(
      { keycloakId: payload.sub },
      { email: payload.email, displayName: payload.preferred_username },
      { upsert: true, new: true },
    );
    req.roles = payload.realm_access?.roles || [];
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  keycloakId: { type: String, required: true, unique: true }, // token `sub`
  email: String,
  displayName: String,
  // app data only — passwords and roles live in Keycloak
});
```

### 2. Recommended Package: `openid-client` (login, refresh, client credentials)
Certified OIDC client. Handles discovery, Authorization Code + PKCE, refresh, logout, and client credentials. v6 is ESM-only.

- **NPM Link:** [openid-client](https://www.npmjs.com/package/openid-client)
- **Install Command:** `npm install openid-client express-session`

```javascript
import * as client from 'openid-client';

const config = await client.discovery(
  new URL(process.env.KEYCLOAK_ISSUER),
  process.env.KEYCLOAK_CLIENT_ID,
  process.env.KEYCLOAK_CLIENT_SECRET,
);
const { access_token } = await client.clientCredentialsGrant(config);
```

### 3. Recommended Package: `@keycloak/keycloak-admin-client` (manage users from code)
Official client for the Keycloak Admin REST API — create users, assign roles, reset passwords. ESM-only.

- **NPM Link:** [@keycloak/keycloak-admin-client](https://www.npmjs.com/package/@keycloak/keycloak-admin-client)
- **Install Command:** `npm install @keycloak/keycloak-admin-client`

```javascript
import KcAdminClient from '@keycloak/keycloak-admin-client';

const kc = new KcAdminClient({ baseUrl: 'http://localhost:8080', realmName: 'myrealm' });
// Use a dedicated client with service-account roles from `realm-management` (e.g. manage-users)
await kc.auth({
  grantType: 'client_credentials',
  clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
});

await kc.users.create({
  username: 'jane',
  email: 'jane@example.com',
  enabled: true,
  emailVerified: true,
  credentials: [{ type: 'password', value: 'TempPass#123', temporary: true }],
});
```

### 4. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `keycloak-connect` | [Link](https://www.npmjs.com/package/keycloak-connect) | Official Express adapter — **deprecated** by Keycloak, avoid for new projects. |
| `passport-openidconnect` | [Link](https://www.npmjs.com/package/passport-openidconnect) | Use Keycloak as an OIDC strategy if your app already uses Passport. |
| `express-openid-connect` | [Link](https://www.npmjs.com/package/express-openid-connect) | Auth0's OIDC middleware; works with any OIDC provider including Keycloak. |
| `keycloak-js` | [Link](https://www.npmjs.com/package/keycloak-js) | Browser adapter for SPAs (React/Angular/Vue) — frontend only. |
