# NPM Packages - Logging & Monitoring 🩺

### 1. Recommended Packages: `winston` & `@sentry/node`
`winston` for structured local/cloud logging, `sentry` for error tracking.

- **NPM Links:** [winston](https://www.npmjs.com/package/winston), [@sentry/node](https://www.npmjs.com/package/@sentry/node)
- **Install Command:** `npm install winston @sentry/node morgan`

#### Code Example (Express + MongoDB)
```javascript
const winston = require('winston');
const Sentry = require("@sentry/node");
const ErrorLog = require('../models/ErrorLog');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

app.use(Sentry.Handlers.requestHandler());

app.use((err, req, res, next) => {
  logger.error(err.message);

  // Store detailed error in MongoDB
  ErrorLog.create({
    message: err.message,
    stack: err.stack,
    user: req.user?.id,
    timestamp: new Date()
  });

  res.status(500).send('Internal Server Error');
});
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `pino` | [Link](https://www.npmjs.com/package/pino) | Extremely fast and low overhead logger. |
| `morgan` | [Link](https://www.npmjs.com/package/morgan) | HTTP request logger middleware for Express. |
| `bunyan` | [Link](https://www.npmjs.com/package/bunyan) | Simple and fast JSON logging library. |
| `datadog-metrics` | [Link](https://www.npmjs.com/package/datadog-metrics) | Send custom metrics to Datadog. |
| `prom-client` | [Link](https://www.npmjs.com/package/prom-client) | Prometheus client for Node.js. |
