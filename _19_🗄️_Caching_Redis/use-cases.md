# Use Cases - Caching (Redis) 🗄️

Redis is an in-memory key-value store. Reads take well under a millisecond, so it sits in front of slow things: databases, third-party APIs, and expensive computations.

### 1. Caching Database Queries
Store results of heavy or frequent queries.
- **Example:** Product details page — read from Redis, fall back to MongoDB on a miss.

### 2. Caching Third-Party API Responses
Cut cost and latency, and survive short provider outages.
- **Example:** Cache Google Maps geocoding results for 24h; cache currency exchange rates for 10 minutes.

### 3. Session Storage
Share user sessions across multiple Node.js instances behind a load balancer.
- **Example:** `express-session` + `connect-redis`.

### 4. Rate Limiting & Counters
Atomic `INCR` with expiry makes Redis the standard backend for rate limiters (see section 11).
- **Example:** 100 requests per minute per API key.

### 5. Distributed Locks
Make sure only one instance runs a task at a time.
- **Example:** Only one server sends the daily report email, even with 5 replicas running.

### 6. Leaderboards & Rankings
Sorted sets (`ZADD`, `ZREVRANGE`) keep items ranked automatically.
- **Example:** Top 10 sellers this week, game high scores.

### 7. Pub/Sub & Cache Invalidation
Tell every instance to drop a stale in-memory cache entry.
- **Example:** Admin updates a product price → all servers clear their local copy.

### 8. Queues Backend
BullMQ (section 14) and the Socket.IO Redis adapter (section 21) are built on Redis.

### 9. When NOT to Cache
- Data that must be **strongly consistent** (account balances at payment time).
- Data that changes on almost every read.
- Data that is already fast to fetch — caching adds complexity and stale-data bugs.
