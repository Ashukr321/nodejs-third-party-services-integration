# Integration Guide - Rate Limiting (Express & Redis) ⚡

### 1. Simple Memory-based Limiting

```javascript
// npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
});

app.use('/api/login', loginLimiter);
```

### 2. Distributed Limiting (Redis)
Required if you have multiple server instances (Auto-scaling).

```javascript
// npm install rate-limiter-flexible redis
const Redis = require('ioredis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const redisClient = new Redis(process.env.REDIS_URL);

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'api_limit',
  points: 10, // 10 requests
  duration: 1, // per 1 second
});

const rateLimitMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).send('Too Many Requests'));
};

app.use('/api/', rateLimitMiddleware);
```

### 3. Best Practices
- **Return Correct Status Code:** Always use `429 Too Many Requests`.
- **Inform the User:** Use headers like `Retry-After` to tell the client when they can try again.
- **Whitelist Admin IPs:** Don't lock yourself out of your own API.
- **Graceful Degradation:** If Redis is down, ensure the app still works (perhaps by falling back to memory limiting or allowing all traffic).
- **Layered Protection:** Use a WAF (Cloudflare/AWS WAF) for global protection and application-level limiting for specific logic.
