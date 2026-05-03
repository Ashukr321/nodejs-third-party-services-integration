# How Rate Limiting Works ⚡

Algorithms used to control the rate of incoming traffic.

### 1. Fixed Window Counter
- **Mechanism:** Resets every hour (e.g., max 100 requests between 1:00 PM and 2:00 PM).
- **Pros:** Simple.
- **Cons:** A user can send 100 requests at 1:59 and another 100 at 2:01, effectively doubling the rate.

### 2. Sliding Window Log/Counter
- **Mechanism:** Tracks the timestamp of every request. More accurate but memory-intensive.

### 3. Token Bucket
- **Mechanism:** A bucket holds "tokens." Each request consumes a token. Tokens are added back at a constant rate.
- **Pros:** Allows for "bursts" of traffic but limits the average rate.

### 4. Leaky Bucket
- **Mechanism:** Requests enter a bucket and "leak" out at a constant rate.
- **Pros:** Smoothes out traffic spikes.

### 5. Identification Methods
- **IP Address:** Good for public APIs.
- **User ID:** Best for authenticated users.
- **API Key:** Standard for developer-facing services.
