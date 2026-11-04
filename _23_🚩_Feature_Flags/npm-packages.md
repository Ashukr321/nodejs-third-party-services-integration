# NPM Packages - Feature Flags 🚩

### 1. Recommended Package: `unleash-client`
Server SDK for Unleash — the most popular open-source feature flag platform. Self-host for free or use Unleash Cloud.

- **NPM Link:** [unleash-client](https://www.npmjs.com/package/unleash-client)
- **Install Command:** `npm install unleash-client`

#### Code Example (Express + MongoDB)
```javascript
const { initialize } = require('unleash-client');
const Product = require('./models/Product');

const unleash = initialize({
  url: process.env.UNLEASH_URL,
  appName: 'shop-api',
  customHeaders: { Authorization: process.env.UNLEASH_API_TOKEN },
});

app.get('/api/products', async (req, res) => {
  const ctx = { userId: req.user?.id, properties: { plan: req.user?.plan } };

  const query = Product.find({ active: true }).limit(20);
  if (unleash.isEnabled('sort-by-popularity', ctx)) query.sort({ salesCount: -1 });
  else query.sort({ createdAt: -1 });

  res.json(await query.lean());
});
```

### 2. Recommended Package: `@launchdarkly/node-server-sdk`
Server SDK for LaunchDarkly — the leading commercial platform, strong targeting and experimentation.

- **NPM Link:** [@launchdarkly/node-server-sdk](https://www.npmjs.com/package/@launchdarkly/node-server-sdk)
- **Install Command:** `npm install @launchdarkly/node-server-sdk`

```javascript
const ld = require('@launchdarkly/node-server-sdk');

const client = ld.init(process.env.LAUNCHDARKLY_SDK_KEY);
await client.waitForInitialization({ timeout: 10 });

const context = { kind: 'user', key: req.user.id, email: req.user.email, plan: req.user.plan };
const showNewCheckout = await client.variation('new-checkout', context, false); // false = fallback

// On shutdown
await client.flush();
client.close();
```

### 3. Recommended Package: `@openfeature/server-sdk`
Vendor-neutral flag API (CNCF standard). Write flag checks once; plug in any provider.

- **NPM Link:** [@openfeature/server-sdk](https://www.npmjs.com/package/@openfeature/server-sdk)
- **Install Command:** `npm install @openfeature/server-sdk`

```javascript
const { OpenFeature } = require('@openfeature/server-sdk');

await OpenFeature.setProviderAndWait(provider); // Unleash, LaunchDarkly, Flagsmith, flagd, ...
const client = OpenFeature.getClient();
const limit = await client.getNumberValue('max-upload-mb', 10, { targetingKey: userId });
```

### 4. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `flagsmith-nodejs` | [Link](https://www.npmjs.com/package/flagsmith-nodejs) | Flagsmith — open-source flags + remote config. |
| `@growthbook/growthbook` | [Link](https://www.npmjs.com/package/@growthbook/growthbook) | GrowthBook — open-source flags with built-in A/B test statistics. |
| `posthog-node` | [Link](https://www.npmjs.com/package/posthog-node) | PostHog — flags combined with product analytics. |
| `statsig-node` | [Link](https://www.npmjs.com/package/statsig-node) | Statsig — experimentation-focused flags. |
| `@aws-sdk/client-appconfigdata` | [Link](https://www.npmjs.com/package/@aws-sdk/client-appconfigdata) | AWS AppConfig — feature flags inside AWS. |
