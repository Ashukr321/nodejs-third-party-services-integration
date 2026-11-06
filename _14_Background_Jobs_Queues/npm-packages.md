# NPM Packages - Background Jobs & Queues 📦

### 1. Recommended Package: `bullmq`
The most robust Redis-based queue for Node.js.

- **NPM Link:** [https://www.npmjs.com/package/bullmq](https://www.npmjs.com/package/bullmq)
- **Install Command:** `npm install bullmq ioredis`

#### Code Example (Express + MongoDB)
```javascript
const { Queue, Worker } = require('bullmq');
const JobLog = require('../models/JobLog'); // MongoDB model

const emailQueue = new Queue('emails');

// Producer: Adding a job
async function enqueueEmail(user) {
  const job = await emailQueue.add('welcome', { email: user.email });
  
  // Track job creation in MongoDB
  await JobLog.create({ jobId: job.id, type: 'welcome_email', status: 'queued' });
}

// Consumer: Processing a job
const worker = new Worker('emails', async job => {
  // Process...
  await sendEmail(job.data.email);
  
  // Update status in MongoDB
  await JobLog.findOneAndUpdate({ jobId: job.id }, { status: 'completed' });
});
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `bee-queue` | [Link](https://www.npmjs.com/package/bee-queue) | Lighter than Bull, focused on performance. |
| `agenda` | [Link](https://www.npmjs.com/package/agenda) | MongoDB-backed job queue. No Redis required! |
| `piscina` | [Link](https://www.npmjs.com/package/piscina) | For CPU-intensive tasks using Worker Threads. |
| `amqplib` | [Link](https://www.npmjs.com/package/amqplib) | Official RabbitMQ client. |
| `node-cron` | [Link](https://www.npmjs.com/package/node-cron) | Simple in-memory cron jobs. |
