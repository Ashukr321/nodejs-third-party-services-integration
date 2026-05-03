# Integration Guide - Background Jobs (BullMQ Example) 📦

BullMQ is the fastest and most reliable Redis-based queue for Node.js.

### 1. The Producer (Adding a Job)

```javascript
// npm install bullmq ioredis
const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL);
const emailQueue = new Queue('emailQueue', { connection });

async function addEmailJob(user) {
  await emailQueue.add('sendWelcomeEmail', {
    email: user.email,
    name: user.name,
  }, {
    attempts: 3, // Retry up to 3 times
    backoff: { type: 'exponential', delay: 1000 },
  });
}
```

### 2. The Worker (Processing a Job)

```javascript
const { Worker } = require('bullmq');

const worker = new Worker('emailQueue', async job => {
  if (job.name === 'sendWelcomeEmail') {
    const { email, name } = job.data;
    await sendActualEmail(email, name);
    console.log(`Email sent to ${email}`);
  }
}, { connection });

worker.on('completed', job => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed: ${err.message}`));
```

### 3. Best Practices
- **Separate Your Processes:** Run your workers in separate containers/processes from your web server. This ensures that heavy processing doesn't slow down the UI.
- **Small Job Data:** Don't put massive objects in the queue. Pass IDs (e.g., `userId: 123`) and let the worker fetch the latest data from the database.
- **Graceful Shutdown:** Ensure workers finish their current job before the process exits during deployment.
- **Monitor Queue Depth:** If your queue keeps growing, you need more workers or more efficient code.
- **Use a DLQ:** Handle failed jobs that exhausted all retries to avoid losing data.
