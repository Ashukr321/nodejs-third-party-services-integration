# How Retry & Failure Handling Works 🔁

Strategies for dealing with the "unhappy path" in distributed systems.

### 1. Exponential Backoff
Instead of retrying every 1 second, you increase the delay after each failure.
- Try 1: 1s
- Try 2: 2s
- Try 3: 4s
- Try 4: 8s
- **Why:** Prevents "hammering" a struggling service (the "Thundering Herd" problem).

### 2. Jitter
Adding a small random amount of time to the backoff delay.
- **Why:** If 10,000 clients fail at the same time, jitter ensures they don't all retry at the exact same millisecond.

### 3. Idempotency
Ensuring that performing the same operation multiple times has the same result as performing it once.
- **Critical:** When retrying a payment, you MUST use an **Idempotency Key** so you don't charge the user twice.

### 4. Dead Letter Queues (DLQ)
When a task fails after all retry attempts, it is moved to a special queue (the DLQ) for manual inspection.

### 5. Circuit Breaker Pattern
A state machine that prevents an application from repeatedly trying an operation that's likely to fail.
- **Closed:** Normal operation (requests flow through).
- **Open:** Service is failing; stop all requests immediately.
- **Half-Open:** Periodically allow a few requests to see if the service has recovered.
