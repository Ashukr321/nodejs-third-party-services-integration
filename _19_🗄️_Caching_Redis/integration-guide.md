# Integration Guide - Redis Caching (ioredis) 🗄️

### 1. Run Redis Locally

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

```env
REDIS_URL=redis://localhost:6379
```

### 2. Shared Client

```javascript
// npm install ioredis
// lib/redis.js
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3, // fail fast instead of hanging requests when Redis is down
});

redis.on('error', (err) => console.error('[redis]', err.message));

module.exports = redis;
```

Create **one** client per process and reuse it. Never connect per request.

### 3. Cache-Aside Helper

```javascript
// lib/cache.js
const redis = require('./redis');

const withJitter = (ttl) => ttl + Math.floor(Math.random() * ttl * 0.1); // avoid mass expiry

async function cached(key, ttlSeconds, loader) {
  try {
    const hit = await redis.get(key);
    if (hit !== null) return JSON.parse(hit);
  } catch (err) {
    console.warn('[cache] read failed, falling back to source', err.message);
  }

  const value = await loader();

  // Cache "not found" too (short TTL) to stop repeated misses hitting the DB
  const ttl = value === null ? 60 : withJitter(ttlSeconds);
  redis.set(key, JSON.stringify(value), 'EX', ttl).catch(() => {});
  return value;
}

module.exports = { cached };
```

Redis being down must **not** take the app down — the cache is an optimization.

### 4. Using It in Routes

```javascript
const { cached } = require('./lib/cache');
const redis = require('./lib/redis');
const Product = require('./models/Product');

app.get('/api/products/:id', async (req, res) => {
  const product = await cached(`product:${req.params.id}`, 300, () =>
    Product.findById(req.params.id).lean(),
  );
  if (!product) return res.sendStatus(404);
  res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  await redis.del(`product:${req.params.id}`); // invalidate AFTER the DB write
  res.json(product);
});
```

### 5. Caching a Third-Party API

```javascript
async function getExchangeRate(from, to) {
  return cached(`fx:${from}:${to}`, 600, async () => {
    const res = await fetch(`https://api.example.com/rates?from=${from}&to=${to}`);
    if (!res.ok) throw new Error(`FX API ${res.status}`); // don't cache errors
    return (await res.json()).rate;
  });
}
```

### 6. Preventing a Cache Stampede (Lock)

```javascript
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cachedWithLock(key, ttlSeconds, loader) {
  const hit = await redis.get(key);
  if (hit !== null) return JSON.parse(hit);

  // NX = only set if missing, PX = auto-release after 5s if the holder crashes
  const gotLock = await redis.set(`lock:${key}`, '1', 'PX', 5000, 'NX');
  if (!gotLock) {
    await sleep(100);
    return cachedWithLock(key, ttlSeconds, loader); // someone else is rebuilding
  }

  try {
    const value = await loader();
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return value;
  } finally {
    await redis.del(`lock:${key}`);
  }
}
```

### 7. Distributed Lock for Cron Jobs

```javascript
const crypto = require('crypto');

async function runOnce(lockName, ttlMs, task) {
  const token = crypto.randomUUID();
  const ok = await redis.set(`lock:${lockName}`, token, 'PX', ttlMs, 'NX');
  if (!ok) return; // another instance has it

  try {
    await task();
  } finally {
    // Only delete the lock if we still own it (atomic check-and-delete)
    await redis.eval(
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end",
      1, `lock:${lockName}`, token,
    );
  }
}

// runOnce('daily-report', 60_000, sendDailyReport);
```

### 8. Session Storage

```javascript
// npm install express-session connect-redis redis
const session = require('express-session');
const { RedisStore } = require('connect-redis'); // v8+ named export; targets the official `redis` client
const { createClient } = require('redis');

const sessionClient = createClient({ url: process.env.REDIS_URL });
sessionClient.connect().catch(console.error);

app.use(session({
  store: new RedisStore({ client: sessionClient, prefix: 'sess:' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 },
}));
```

### 9. Best Practices
- **Always set a TTL** on cache keys. Keys without expiry slowly fill memory.
- **Namespace keys:** `service:entity:id` (e.g., `shop:product:42`).
- **Never use `KEYS *` in production** — it blocks Redis. Use `SCAN`.
- **Don't cache huge values** (> 100KB). Cache what the endpoint needs.
- **Serialize carefully:** `JSON.stringify` turns `Date` into strings and drops `undefined`.
- **Set `maxmemory` + `allkeys-lru`** on a cache-only Redis.
- **Use a separate Redis (or DB index) for queues/locks** vs. cache, so eviction never deletes jobs.
- **Monitor hit rate** (`INFO stats` → `keyspace_hits` / `keyspace_misses`). A low hit rate means the cache isn't helping.
