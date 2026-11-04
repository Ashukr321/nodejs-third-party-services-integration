# NPM Packages - Caching (Redis) 🗄️

### 1. Recommended Package: `ioredis`
Full-featured Redis client with Cluster, Sentinel, pipelining, and Lua support. Used by BullMQ.

- **NPM Link:** [ioredis](https://www.npmjs.com/package/ioredis)
- **Install Command:** `npm install ioredis`

#### Code Example (Express + MongoDB)
```javascript
const Redis = require('ioredis');
const User = require('../models/User');

const redis = new Redis(process.env.REDIS_URL);

app.get('/api/users/:id', async (req, res) => {
  const key = `user:${req.params.id}`;

  const hit = await redis.get(key);
  if (hit) return res.json(JSON.parse(hit));

  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) return res.sendStatus(404);

  await redis.set(key, JSON.stringify(user), 'EX', 300); // 5 minutes
  res.json(user);
});
```

### 2. Recommended Package: `redis` (node-redis)
The official Redis client. Promise-based; requires an explicit `connect()`.

- **NPM Link:** [redis](https://www.npmjs.com/package/redis)
- **Install Command:** `npm install redis`

```javascript
const { createClient } = require('redis');

const client = createClient({ url: process.env.REDIS_URL });
client.on('error', (err) => console.error(err));
await client.connect();

await client.set('greeting', 'hello', { EX: 60 });
const value = await client.get('greeting');
```

### 3. Leaderboard with Sorted Sets
```javascript
await redis.zincrby('leaderboard:weekly', 50, 'user:42');        // add points
const top10 = await redis.zrevrange('leaderboard:weekly', 0, 9, 'WITHSCORES');
const rank = await redis.zrevrank('leaderboard:weekly', 'user:42'); // 0-based
```

### 4. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `connect-redis` | [Link](https://www.npmjs.com/package/connect-redis) | Redis session store for `express-session`. |
| `cache-manager` | [Link](https://www.npmjs.com/package/cache-manager) | Multi-store cache abstraction (memory + Redis), used by NestJS. |
| `lru-cache` | [Link](https://www.npmjs.com/package/lru-cache) | In-process memory cache — great as an L1 in front of Redis for hot keys. |
| `@upstash/redis` | [Link](https://www.npmjs.com/package/@upstash/redis) | HTTP-based Redis client for serverless/edge (no TCP connection). |
| `redlock` | [Link](https://www.npmjs.com/package/redlock) | Distributed lock algorithm across multiple Redis nodes. |
