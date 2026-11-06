# Integration Guide - Retry & Failure (P-Retry & Opossum) 🔁

### 1. Implementing Exponential Backoff

```javascript
// npm install p-retry
const pRetry = require('p-retry');
const axios = require('axios');

const runRequest = async () => {
  const response = await axios.get('https://api.external-service.com/data');
  return response.data;
};

async function fetchDataWithRetry() {
  try {
    const result = await pRetry(runRequest, {
      retries: 5,
      onFailedAttempt: error => {
        console.log(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
      },
    });
    return result;
  } catch (error) {
    console.error('All retry attempts failed.');
  }
}
```

### 2. Implementing a Circuit Breaker

```javascript
// npm install opossum
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000, // If the action takes longer than 3s, fail it
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 30000 // Wait 30s before trying again
};

const breaker = new CircuitBreaker(runRequest, options);

breaker.on('open', () => console.log('Circuit is OPEN! Requests blocked.'));
breaker.on('halfOpen', () => console.log('Circuit is HALF-OPEN. Testing...'));
breaker.on('close', () => console.log('Circuit is CLOSED. Normal operation.'));

async function safeFetch() {
  return breaker.fire()
    .catch(console.error);
}
```

### 3. Best Practices
- **Fail Fast:** Don't let users wait 60 seconds for a timeout. Use short timeouts (3-5s).
- **Log Failures:** Always log why a request failed (status code, error message).
- **Graceful UI:** Show the user a "Try Again" button or a helpful error message instead of a blank screen.
- **Limit Retries:** Don't retry indefinitely. 3-5 times is usually sufficient.
- **Idempotency is Non-negotiable:** For any state-changing request (POST/PUT/DELETE), ensure you have a way to handle duplicate retries safely.
