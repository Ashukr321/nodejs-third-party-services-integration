# Integration Guide - Secrets & Config Management 🔑

### 1. Local Development: `.env`

```env
# .env  (never committed)
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/app
STRIPE_SECRET_KEY=sk_test_xxx
JWT_SECRET=dev-only-secret
```

```gitignore
# .gitignore
.env
.env.*
!.env.example
```

Commit a `.env.example` with **keys only** (no values) so teammates know what to set.

Node.js 20.6+ can load `.env` without any package:

```bash
node --env-file=.env server.js
```

Or with `dotenv`: `require('dotenv').config()` as the first line of your entry file.

### 2. Validate Config at Startup (Fail Fast)

```javascript
// npm install zod
// config/index.js
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Print which keys are wrong — never print the values
  console.error('Invalid configuration:', parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
  process.exit(1);
}

module.exports = Object.freeze(parsed.data);
```

```javascript
// Everywhere else: import config, never read process.env directly
const config = require('./config');
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);
```

### 3. Production: AWS Secrets Manager

Store one JSON secret per service, e.g. `prod/payment-service`:
```json
{ "STRIPE_SECRET_KEY": "sk_live_...", "MONGO_URI": "mongodb+srv://..." }
```

```javascript
// npm install @aws-sdk/client-secrets-manager
// config/secrets.js
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Credentials come from the IAM role of the ECS task / EC2 / Lambda — no keys in code
const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

async function loadSecrets(secretId) {
  const res = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
  return JSON.parse(res.SecretString);
}

module.exports = { loadSecrets };
```

```javascript
// server.js — load secrets into process.env BEFORE requiring config
const { loadSecrets } = require('./config/secrets');

(async () => {
  if (process.env.SECRETS_ID) Object.assign(process.env, await loadSecrets(process.env.SECRETS_ID));
  const config = require('./config'); // validated after secrets are in place
  const app = require('./app');
  app.listen(config.PORT);
})().catch((err) => { console.error('Startup failed:', err.message); process.exit(1); });
```

IAM policy for the service's role (least privilege):
```json
{
  "Effect": "Allow",
  "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:ap-south-1:123456789012:secret:prod/payment-service-*"
}
```

### 4. Supporting Rotation Without Restart

```javascript
const TTL_MS = 5 * 60 * 1000;
let cache = { value: null, fetchedAt: 0 };

async function getSecret(secretId, { force = false } = {}) {
  if (!force && cache.value && Date.now() - cache.fetchedAt < TTL_MS) return cache.value;
  cache = { value: await loadSecrets(secretId), fetchedAt: Date.now() };
  return cache.value;
}

// On an auth error from the provider, force-refresh once and retry
async function callWithFreshKey(fn) {
  try {
    return await fn((await getSecret(process.env.SECRETS_ID)).STRIPE_SECRET_KEY);
  } catch (err) {
    if (err.statusCode !== 401) throw err;
    return fn((await getSecret(process.env.SECRETS_ID, { force: true })).STRIPE_SECRET_KEY);
  }
}
```

### 5. HashiCorp Vault (KV v2)

```javascript
// npm install node-vault
const vault = require('node-vault')({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,   // https://vault.internal:8200
  token: process.env.VAULT_TOKEN,     // in prod, get this via Kubernetes/AppRole auth instead
});

const { data } = await vault.read('secret/data/payment-service'); // KV v2 path includes /data/
const secrets = data.data; // { STRIPE_SECRET_KEY: '...', ... }
```

### 6. Never Log Secrets

```javascript
// With pino: redact sensitive paths automatically (winston from section 15 needs a custom format for this)
const logger = require('pino')({
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.apiKey', '*.secret'],
});
```

### 7. Block Leaks Before They Happen

```bash
# Scan the repo and full history for secrets
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest detect --source /repo
```

Add the same command to CI and as a pre-commit hook. Also turn on **GitHub Secret Scanning + Push Protection** in repo settings.

### 8. Best Practices
- **One secret per service per environment** — a leaked staging key must not unlock production.
- **Use cloud identity** (IAM roles, service accounts) instead of static access keys wherever possible.
- **Validate all config at startup** and exit on errors.
- **Read `process.env` in one place** (`config/index.js`), never scattered across the codebase.
- **Restrict API keys** at the provider: IP allowlists, minimal scopes, separate test/live keys.
- **Never put secrets in frontend env vars** (`VITE_*`, `NEXT_PUBLIC_*`, `REACT_APP_*` are public).
- **Never bake secrets into Docker images** — inject at runtime.
- **Rotate on a schedule** and immediately when someone with access leaves.
