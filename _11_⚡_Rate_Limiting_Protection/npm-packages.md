# NPM Packages - Rate Limiting ⚡

### 1. Recommended Package: `express-rate-limit` & `rate-limiter-flexible`
`express-rate-limit` is simple, while `rate-limiter-flexible` is powerful for Redis-based scaling.

- **NPM Links:** [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible)
- **Install Command:** `npm install express-rate-limit rate-limiter-flexible ioredis`

#### Code Example (Express + MongoDB)
```javascript
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const User = require('../models/User');

const redisClient = new Redis(process.env.REDIS_URL);

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_limit',
  points: 5, // 5 attempts
  duration: 60 * 15, // per 15 minutes
});

async function login(req, res) {
  const { email } = req.body;

  try {
    await limiter.consume(email);
    // Proceed with login...
  } catch (err) {
    // Log blocked attempt in MongoDB
    await SecurityLog.create({ type: 'rate_limit_blocked', email, ip: req.ip });
    res.status(429).send('Too Many Requests');
  }
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `redis-rate-limit` | [Link](https://www.npmjs.com/package/redis-rate-limit) | Simple Redis-based rate limiting. |
| `bottleneck` | [Link](https://www.npmjs.com/package/bottleneck) | Task scheduler and rate limiter for jobs. |
| `slow-down` | [Link](https://www.npmjs.com/package/express-slow-down) | Delays responses instead of blocking them. |
