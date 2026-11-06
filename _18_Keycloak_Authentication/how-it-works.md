# How Keycloak Works 🗝️

Keycloak implements **OpenID Connect (OIDC)** and **OAuth 2.0** (plus SAML). Your Node.js app never sees the user's password — it only deals with tokens issued by Keycloak.

### 1. Key Terminology
- **Realm:** An isolated space of users, roles, clients, and settings (think "tenant"). Never use the `master` realm for your apps.
- **Client:** An application registered in a realm (e.g., `my-api`, `my-frontend`).
  - **Confidential client:** Has a client secret (server-side apps, backends).
  - **Public client:** No secret (SPAs, mobile apps) — must use PKCE.
- **User:** A person who logs in.
- **Realm Role / Client Role:** Permissions. Realm roles are global to the realm, client roles belong to one client.
- **Group:** A set of users that share roles.
- **Identity Provider:** An external login source (Google, GitHub, SAML, LDAP) brokered by Keycloak.

### 2. Important URLs (per realm)
```
Issuer:         {KEYCLOAK_URL}/realms/{realm}
Discovery:      {issuer}/.well-known/openid-configuration
Authorize:      {issuer}/protocol/openid-connect/auth
Token:          {issuer}/protocol/openid-connect/token
JWKS (keys):    {issuer}/protocol/openid-connect/certs
UserInfo:       {issuer}/protocol/openid-connect/userinfo
Logout:         {issuer}/protocol/openid-connect/logout
```

### 3. Flow A — User Login (Authorization Code + PKCE)
1. **Redirect:** Your app redirects the browser to Keycloak's `auth` endpoint with `client_id`, `redirect_uri`, `scope=openid`, `state`, and a PKCE `code_challenge`.
2. **Login:** User signs in on Keycloak's login page (or via a brokered provider).
3. **Code:** Keycloak redirects back to your `redirect_uri` with a short-lived `code`.
4. **Exchange:** Your server posts the `code` + `code_verifier` (+ client secret) to the `token` endpoint.
5. **Tokens:** Keycloak returns an **Access Token**, **ID Token**, and **Refresh Token**.

### 4. Flow B — Protecting an API (Bearer Token)
1. Client sends `Authorization: Bearer <access_token>`.
2. API fetches Keycloak's public keys once from the **JWKS** endpoint (and caches them).
3. API verifies the JWT locally: **signature**, `iss`, `exp`, and audience/`azp`.
4. API reads roles from the token and allows or rejects the request.

No call to Keycloak per request — that is why this scales.

### 5. Flow C — Service-to-Service (Client Credentials)
1. Service posts `grant_type=client_credentials` + its `client_id`/`client_secret` to the `token` endpoint.
2. Keycloak returns an access token for the client's **service account**.
3. Service calls the other API with that token.

### 6. What's Inside a Keycloak Access Token
```jsonc
{
  "iss": "http://localhost:8080/realms/myrealm",
  "sub": "f3c1e0a2-...",              // stable user id — use this as your foreign key
  "aud": "account",                    // add an Audience mapper to include your API's client id
  "azp": "my-frontend",                // client that requested the token
  "exp": 1730700000,
  "preferred_username": "john",
  "email": "john@example.com",
  "email_verified": true,
  "realm_access": { "roles": ["user", "admin"] },
  "resource_access": { "my-api": { "roles": ["orders:write"] } },
  "scope": "openid profile email"
}
```

### 7. Token Lifetimes (defaults, configurable per realm/client)
- **Access Token:** ~5 minutes. Short on purpose — revocation is just "wait for expiry".
- **Refresh Token:** Tied to the SSO session (~30 min idle). Used to get new access tokens.
- **ID Token:** Proves who logged in; for the client, not for calling APIs.

### 8. Local vs. Remote Validation
| Method | How | Pros | Cons |
|--------|-----|------|------|
| **Local JWT verify** | Verify signature with JWKS | Fast, no network per request | Revoked token valid until `exp` |
| **Token introspection** | POST token to `/token/introspect` | Real-time revocation | Network call per request |

Senior default: **local verify** + short access-token lifetime. Use introspection only for high-risk endpoints.
