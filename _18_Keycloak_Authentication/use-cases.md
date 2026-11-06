# Use Cases - Keycloak Authentication 🗝️

Keycloak is an open-source Identity and Access Management (IAM) server. You self-host it and it handles login, SSO, users, roles, and tokens for all your apps.

### 1. Centralized Login for Microservices
One identity server issues tokens; every Node.js service only verifies them.
- **Example:** `orders-service`, `payments-service`, and `users-service` all trust tokens from the same Keycloak realm.

### 2. Single Sign-On (SSO) Across Apps
Log in once, access every app in the same realm.
- **Example:** An admin dashboard, a customer portal, and an internal reporting tool share one session.

### 3. Role-Based Access Control (RBAC)
Manage roles in the Keycloak admin console instead of in your database.
- **Example:** Only users with the `admin` realm role can call `DELETE /api/users/:id`.

### 4. Identity Brokering & Social Login
Keycloak sits in front of Google, GitHub, Microsoft, or a corporate SAML/LDAP directory. Your app integrates with Keycloak only.
- **Example:** Employees log in with Active Directory, customers log in with Google — same app code.

### 5. Machine-to-Machine (M2M) Auth
Backend services get tokens with the **Client Credentials** grant, no user involved.
- **Example:** A cron worker calls a protected reporting API with its own service-account token.

### 6. Multi-Tenant SaaS
One **realm** per tenant (or one realm with groups/organizations) to isolate users and settings.
- **Example:** `realm=acme` and `realm=globex` each have their own users, password policy, and branding.

### 7. When to Pick Keycloak (vs. Auth0 / Cognito / Firebase Auth)
- You need **self-hosting** (data residency, on-prem, no per-user pricing).
- You need **enterprise features** (LDAP/AD federation, SAML, fine-grained authorization) without vendor lock-in.
- **Trade-off:** you own the ops — upgrades, HA, database backups, and monitoring.
