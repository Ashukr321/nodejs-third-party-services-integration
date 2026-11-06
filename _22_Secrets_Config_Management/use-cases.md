# Use Cases - Secrets & Config Management 🔑

Every integration in this repo needs a key: Stripe, Twilio, SendGrid, OpenAI, database URLs. How you store, load, and rotate them decides whether a leak is a non-event or a disaster.

### 1. Keeping Secrets Out of Git
- **Example:** `STRIPE_SECRET_KEY` lives in a secret manager, not in `config.js` or a committed `.env`.

### 2. Per-Environment Configuration
Same code, different settings in dev / staging / production.
- **Example:** Stripe test key in staging, live key in production; different DB per environment.

### 3. Secret Rotation
Change a key without redeploying or downtime.
- **Example:** Rotate the database password every 30 days; the app picks up the new one automatically.

### 4. Access Control & Audit
Only the services that need a secret can read it, and every read is logged.
- **Example:** `payment-service` can read the Stripe key; `email-service` cannot.

### 5. Fail-Fast Config Validation
Crash at startup with a clear error instead of failing at 3am when the first payment runs.
- **Example:** `Missing env var: RAZORPAY_KEY_SECRET` at boot.

### 6. Dynamic / Short-Lived Credentials
The secret manager generates a credential on demand that expires automatically.
- **Example:** HashiCorp Vault issues a database user valid for 1 hour.

### 7. Leak Detection
- **Example:** A pre-commit hook or CI step blocks a push that contains an AWS key.

### 8. Choosing a Tool
| Tool | Type | Best for |
|------|------|----------|
| `.env` + `dotenv` | Local file | Local development only |
| Platform env vars | Render, Railway, Vercel, Heroku, Kubernetes Secrets | Small apps on a PaaS |
| **AWS Secrets Manager** | Managed | AWS apps, built-in rotation |
| **AWS SSM Parameter Store** | Managed | Cheaper config + secrets on AWS |
| **Google Secret Manager / Azure Key Vault** | Managed | GCP / Azure apps |
| **HashiCorp Vault** | Self-hosted / HCP | Multi-cloud, dynamic secrets |
| **Doppler / Infisical** | SaaS | Team-friendly sync to every environment |
