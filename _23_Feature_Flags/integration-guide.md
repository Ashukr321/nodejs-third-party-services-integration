# Integration Guide - Feature Flags (Unleash + OpenFeature) 🚩

### 1. Run Unleash Locally

```bash
git clone https://github.com/Unleash/unleash.git && cd unleash
docker compose up -d
# UI: http://localhost:4242  (default login: admin / unleash4all)
```

In the UI: create a flag `new-checkout`, add a **Gradual rollout** strategy (e.g., 20%, stickiness `userId`), and create a **backend API token**.

```env
UNLEASH_URL=http://localhost:4242/api/
UNLEASH_API_TOKEN=default:development.xxxxx
```

### 2. Initialize the SDK Once

```javascript
// npm install unleash-client
// lib/flags.js
const { initialize } = require('unleash-client');

const unleash = initialize({
  url: process.env.UNLEASH_URL,
  appName: 'shop-api',
  customHeaders: { Authorization: process.env.UNLEASH_API_TOKEN },
  refreshInterval: 15_000, // poll for rule changes every 15s
});

unleash.on('error', (err) => console.error('[flags]', err.message)); // keep serving last known rules
unleash.on('synchronized', () => console.log('[flags] ready'));

const contextFor = (req) => ({
  userId: req.user?.id,
  sessionId: req.sessionID,
  remoteAddress: req.ip,
  properties: { plan: req.user?.plan, country: req.headers['cf-ipcountry'] },
});

module.exports = { unleash, contextFor };
```

Before `synchronized` fires, `isEnabled` returns `false` (or your fallback). If a flag must be correct from the first request, use `startUnleash()` (async, resolves when ready) instead of `initialize()`.

### 3. Use Flags in Routes

```javascript
const { unleash, contextFor } = require('./lib/flags');

app.post('/api/checkout', requireAuth, async (req, res) => {
  if (unleash.isEnabled('new-checkout', contextFor(req))) {
    return newCheckout(req, res);
  }
  return legacyCheckout(req, res);
});
```

### 4. Kill Switch for a Third-Party Provider

```javascript
// Flag 'payments-provider' with variants: razorpay | stripe
const providers = {
  razorpay: require('./payments/razorpay'),
  stripe: require('./payments/stripe'),
};

function getPaymentProvider(ctx) {
  const variant = unleash.getVariant('payments-provider', ctx);
  return providers[variant.enabled ? variant.name : 'razorpay']; // safe default
}

app.post('/api/payments', requireAuth, async (req, res) => {
  const provider = getPaymentProvider(contextFor(req));
  res.json(await provider.createOrder(req.body));
});
```

### 5. Expose Flags to the Frontend (Safely)

```javascript
// Only send evaluated values for the current user — never the rules
const CLIENT_FLAGS = ['new-checkout', 'ai-summary', 'dark-mode'];

app.get('/api/flags', requireAuth, (req, res) => {
  const ctx = contextFor(req);
  res.json(Object.fromEntries(CLIENT_FLAGS.map((name) => [name, unleash.isEnabled(name, ctx)])));
});
```

### 6. Vendor-Neutral with OpenFeature

```javascript
// npm install @openfeature/server-sdk  + the provider package for your vendor (see openfeature.dev/ecosystem)
const { OpenFeature } = require('@openfeature/server-sdk');

await OpenFeature.setProviderAndWait(myProvider); // Unleash, LaunchDarkly, Flagsmith, flagd...
const flags = OpenFeature.getClient();

const enabled = await flags.getBooleanValue('new-checkout', false, { targetingKey: req.user.id, plan: req.user.plan });
```

Switching vendors later only changes the `setProviderAndWait` line.

### 7. DIY Flags (MongoDB + In-Memory Cache)
Enough for a handful of kill switches before adopting a real tool.

```javascript
// models/Flag.js → { name: String (unique), enabled: Boolean, rolloutPercent: Number, allowUserIds: [String] }
const crypto = require('crypto');
const Flag = require('./models/Flag');

let flags = new Map();
async function refresh() {
  const docs = await Flag.find().lean();
  flags = new Map(docs.map((f) => [f.name, f]));
}
refresh();
setInterval(() => refresh().catch(console.error), 30_000);

function bucket(flagName, userId) {
  // Sticky: same user + flag always lands in the same 0–99 bucket
  return crypto.createHash('sha1').update(`${flagName}:${userId}`).digest().readUInt32BE(0) % 100;
}

function isEnabled(name, userId) {
  const f = flags.get(name);
  if (!f || !f.enabled) return false;
  if (f.allowUserIds?.includes(userId)) return true;
  return userId != null && bucket(name, userId) < (f.rolloutPercent ?? 100);
}
// shortcut: no audit log, UI, or streaming updates; move to Unleash/Flagsmith when flags multiply
```

### 8. Testing Code Behind Flags

```javascript
// Jest: force flag values instead of calling the flag service
jest.mock('./lib/flags', () => ({
  unleash: { isEnabled: jest.fn(), getVariant: jest.fn() },
  contextFor: () => ({}),
}));
const { unleash } = require('./lib/flags');

test('uses new checkout when flag is on', async () => {
  unleash.isEnabled.mockReturnValue(true);
  // ...call the route with supertest and assert new behavior
});
```

Test both the **on** and **off** paths for every active flag.

### 9. Best Practices
- **Evaluate on the server.** Never ship targeting rules to browsers.
- **Always pass a safe default** — the old, proven behavior.
- **Use a stable stickiness key** (`userId`, or `sessionId` for anonymous users) for rollouts.
- **Name flags clearly** with intent: `release-new-checkout`, `ops-disable-ai-summary`.
- **Give every flag an owner and a removal date**; delete release flags once at 100%.
- **Flags are not authorization** — still check permissions on the API.
- **Log flag decisions** with analytics events so experiment results can be measured.
- **Wrap the SDK** (like `lib/flags.js`) so the rest of the code doesn't depend on a vendor.
