# How Webhooks Work 🔄

Webhooks are "reverse APIs." Instead of you calling them, they call you.

### 1. The Push Model
Unlike **Polling** (where your server constantly asks "Any new data?"), **Webhooks** push data to your server the moment an event occurs.

### 2. The Anatomy of a Webhook
- **Event Type:** What happened (e.g., `user.created`).
- **Payload:** The data associated with the event (usually JSON).
- **Timestamp:** When the event occurred.
- **Signature:** A cryptographic hash in the header to prove the sender's identity.

### 3. Signature Verification
1. The sender (e.g., Stripe) creates a hash using the payload and a shared **Webhook Secret**.
2. They send this hash in the `X-Signature` header.
3. Your server receives the request, re-calculates the hash using the same secret, and compares it.

### 4. Retries & Acknowledgement
- Your server must return a `200 OK` status quickly.
- If your server is down or returns an error, the sender will usually retry with an **Exponential Backoff** (e.g., after 1 min, 5 mins, 1 hour).

### 5. Local Testing (Ngrok)
Since webhooks need a public URL, you use tools like **Ngrok** to create a tunnel from a public URL to your local `localhost:3000`.
