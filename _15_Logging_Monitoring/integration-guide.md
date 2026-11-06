# Integration Guide - Logging (Winston & Sentry) 🩺

### 1. Structured Logging with Winston

```javascript
// npm install winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// In production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

logger.error('Payment failed', { userId: 123, amount: 50 });
```

### 2. Error Tracking with Sentry

```javascript
// npm install @sentry/node
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust in production
});

// Use it in Express middleware
app.use(Sentry.Handlers.requestHandler());

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use(Sentry.Handlers.errorHandler());
```

### 3. Best Practices
- **No PII in Logs:** Never log passwords, credit card numbers, or auth tokens.
- **Correlation IDs:** Add a unique ID to every request and include it in every log entry for that request.
- **Alert Fatigue:** Only alert on things that are actionable. Don't send an email for every single 404 error.
- **Use Log Aggregators:** Don't SSH into servers to read log files. Use a centralized dashboard.
- **Monitor Your Monitoring:** Ensure your logging system itself isn't causing performance issues (e.g., synchronous logging).
