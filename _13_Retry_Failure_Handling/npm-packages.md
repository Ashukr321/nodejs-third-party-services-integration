# NPM Packages - Retry & Failure Handling 🔁

### 1. Recommended Packages: `p-retry` & `opossum`
`p-retry` for retrying tasks with backoff, `opossum` for circuit breaking.

- **NPM Links:** [p-retry](https://www.npmjs.com/package/p-retry), [opossum](https://www.npmjs.com/package/opossum)
- **Install Command:** `npm install p-retry opossum`

#### Code Example (Express + MongoDB)
```javascript
const pRetry = require('p-retry');
const axios = require('axios');
const FailureLog = require('../models/FailureLog');

async function callExternalAPI() {
  const response = await axios.get('https://api.thirdparty.com/data');
  return response.data;
}

async function safeRequest(req, res) {
  try {
    const data = await pRetry(callExternalAPI, {
      retries: 3,
      onFailedAttempt: async (error) => {
        // Log each failure in MongoDB
        await FailureLog.create({
          attempt: error.attemptNumber,
          message: error.message,
          timestamp: new Date()
        });
      }
    });
    res.json(data);
  } catch (err) {
    res.status(503).send('Service Temporarily Unavailable');
  }
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `async-retry` | [Link](https://www.npmjs.com/package/async-retry) | Very simple retry wrapper. |
| `cockatiel` | [Link](https://www.npmjs.com/package/cockatiel) | Comprehensive resilience library (Retry, Circuit Breaker, Bulkhead). |
| `retry` | [Link](https://www.npmjs.com/package/retry) | The base library for many others. |
| `axios-retry` | [Link](https://www.npmjs.com/package/axios-retry) | Specifically for retrying Axios requests. |
