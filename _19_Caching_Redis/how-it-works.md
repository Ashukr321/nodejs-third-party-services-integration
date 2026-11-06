# How Caching with Redis Works 🗄️

### 1. Why Redis Is Fast
- All data lives in **RAM**.
- Single-threaded command execution → every command is **atomic**, no locks needed.
- Simple protocol over TCP; with pipelining, many commands share one round trip.

### 2. Core Data Types
| Type | Commands | Use for |
|------|----------|---------|
| String | `GET`, `SET`, `INCR` | Cached JSON, counters |
| Hash | `HSET`, `HGETALL` | Objects with fields (user profile) |
| List | `LPUSH`, `LRANGE` | Recent items, simple queues |
| Set | `SADD`, `SISMEMBER` | Unique items, tags |
| Sorted Set | `ZADD`, `ZREVRANGE` | Leaderboards, time-ordered data |
| Stream | `XADD`, `XREADGROUP` | Event logs, lightweight message queues |

### 3. Caching Patterns
**Cache-Aside (Lazy Loading)** — the most common:
1. App reads from cache.
2. **Hit:** return it.
3. **Miss:** read from DB, write to cache with a TTL, return it.

**Write-Through:** Every DB write also writes the cache. Cache is always fresh, but you cache data nobody may read.

**Write-Behind:** Write to cache now, flush to DB later. Fast, but risks data loss — rarely used for business data.

### 4. Expiry (TTL) & Eviction
- **TTL:** `SET key value EX 300` → key disappears after 300 seconds. Always set one on cache keys.
- **Eviction:** When memory is full, Redis removes keys based on `maxmemory-policy`.
  - `allkeys-lru` → evict least-recently-used keys. Best for a pure cache.
  - `noeviction` → reject writes. Use when Redis also stores queues/locks you can't lose.

### 5. Cache Invalidation
"There are only two hard things in Computer Science: cache invalidation and naming things."
- **TTL only:** Simple; data may be stale for up to TTL.
- **Delete on write:** After updating the DB, `DEL` the cache key. Next read reloads it.
- **Versioned keys:** `product:42:v7` — bump the version instead of deleting.

Delete the cache **after** the DB write succeeds, not before — otherwise a concurrent read can put the old value back.

### 6. Common Failure Modes
| Problem | What happens | Fix |
|---------|--------------|-----|
| **Cache Stampede** | Hot key expires, 1000 requests hit the DB at once | Lock so one request rebuilds; others wait or serve stale |
| **Cache Penetration** | Requests for IDs that don't exist always miss | Cache "not found" with a short TTL |
| **Cache Avalanche** | Many keys expire at the same moment | Add random jitter to TTLs |
| **Hot Key** | One key gets most traffic | Local in-memory cache in front of Redis |

### 7. Persistence & Availability
- **RDB:** Periodic snapshots. Fast restart, may lose last few minutes.
- **AOF:** Logs every write. Safer, bigger files.
- **Replication + Sentinel:** Automatic failover to a replica.
- **Redis Cluster:** Shards keys across nodes for more memory/throughput.
- **Managed:** AWS ElastiCache, Upstash, Redis Cloud.

For a pure cache, losing data is fine — the DB is the source of truth.
