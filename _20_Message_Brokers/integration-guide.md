# Integration Guide - Message Brokers (kafkajs + amqplib) 📨

## Part A — Kafka with `kafkajs`

### 1. Run Kafka Locally (single node, KRaft mode — no ZooKeeper)

```bash
docker run -d --name kafka -p 9092:9092 apache/kafka:3.8.0
```

```env
KAFKA_BROKERS=localhost:9092
```

### 2. Shared Client & Producer

```javascript
// npm install kafkajs
// lib/kafka.js
const crypto = require('crypto');
const { Kafka, logLevel } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: process.env.KAFKA_BROKERS.split(','),
  logLevel: logLevel.WARN,
});

const producer = kafka.producer();

async function publish(topic, type, data, key) {
  const event = {
    eventId: crypto.randomUUID(),
    type,
    version: 1,
    occurredAt: new Date().toISOString(),
    data,
  };
  // Same key → same partition → ordered per entity
  await producer.send({ topic, messages: [{ key, value: JSON.stringify(event) }] });
  return event;
}

module.exports = { kafka, producer, publish };
```

```javascript
// app.js — connect once at startup
const { producer, publish } = require('./lib/kafka');
await producer.connect();

app.post('/api/orders', async (req, res) => {
  const order = await Order.create(req.body);
  await publish('orders', 'order.created', { orderId: order.id, total: order.total }, order.id);
  res.status(201).json(order);
});
```

### 3. Consumer with Idempotency

```javascript
// workers/email-consumer.js
const { kafka } = require('../lib/kafka');
const ProcessedEvent = require('../models/ProcessedEvent'); // { eventId: { type: String, unique: true } }

const consumer = kafka.consumer({ groupId: 'email-service' });

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      if (event.type !== 'order.created') return;

      try {
        await ProcessedEvent.create({ eventId: event.eventId }); // unique index = dedupe
      } catch (err) {
        if (err.code === 11000) return; // already processed
        throw err;
      }

      await sendOrderConfirmationEmail(event.data.orderId);
      // kafkajs commits the offset automatically after eachMessage resolves
    },
  });
}

// Graceful shutdown so offsets are committed and the group rebalances quickly
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => { await consumer.disconnect(); process.exit(0); });
}

start().catch((err) => { console.error(err); process.exit(1); });
```

> Note: if `sendOrderConfirmationEmail` throws after the dedupe insert, the retry is skipped. For critical side effects, insert the `ProcessedEvent` **after** the work succeeds, or in the same MongoDB transaction as the DB change.

### 4. Retry + Dead Letter Topic

```javascript
const MAX_ATTEMPTS = 3;

eachMessage: async ({ topic, message }) => {
  const attempts = Number(message.headers?.attempts?.toString() || 0);
  try {
    await handle(JSON.parse(message.value.toString()));
  } catch (err) {
    const target = attempts + 1 >= MAX_ATTEMPTS ? `${topic}.dlq` : `${topic}.retry`;
    await producer.send({
      topic: target,
      messages: [{ key: message.key, value: message.value, headers: { attempts: String(attempts + 1), error: err.message } }],
    });
    // Don't rethrow — rethrowing would block the partition retrying this one message
  }
}
```

## Part B — RabbitMQ with `amqplib`

### 5. Run RabbitMQ Locally

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
# Management UI: http://localhost:15672  (guest / guest)
```

```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### 6. Topology + Publisher (Confirm Channel)

```javascript
// npm install amqplib
// lib/rabbit.js
const crypto = require('crypto');
const amqp = require('amqplib');

const EXCHANGE = 'events';
let channel;

async function connectRabbit() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  conn.on('error', (err) => console.error('[rabbit]', err.message));
  conn.on('close', () => process.exit(1)); // let the orchestrator restart us

  channel = await conn.createConfirmChannel(); // broker confirms each publish
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertExchange('events.dlx', 'fanout', { durable: true });
  return channel;
}

function publish(routingKey, data) {
  const event = { eventId: crypto.randomUUID(), type: routingKey, occurredAt: new Date().toISOString(), data };
  return new Promise((resolve, reject) => {
    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(event)), {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
    }, (err) => (err ? reject(err) : resolve(event)));
  });
}

module.exports = { connectRabbit, publish, EXCHANGE };
```

### 7. Consumer with Dead Lettering

```javascript
// workers/inventory-consumer.js
const { connectRabbit, EXCHANGE } = require('../lib/rabbit');

async function start() {
  const ch = await connectRabbit();

  await ch.assertQueue('inventory.dlq', { durable: true });
  await ch.bindQueue('inventory.dlq', 'events.dlx', '');

  const q = 'inventory.order-events';
  await ch.assertQueue(q, {
    durable: true,
    arguments: { 'x-queue-type': 'quorum', 'x-dead-letter-exchange': 'events.dlx' },
  });
  await ch.bindQueue(q, EXCHANGE, 'order.*'); // order.created, order.cancelled, ...

  await ch.prefetch(10);
  await ch.consume(q, async (msg) => {
    try {
      const event = JSON.parse(msg.content.toString());
      await reserveStock(event); // must be idempotent (dedupe on event.eventId)
      ch.ack(msg);
    } catch (err) {
      console.error('failed', err.message);
      ch.nack(msg, false, false); // requeue=false → goes to DLQ
    }
  });
}

start();
```

## Part C — Transactional Outbox (MongoDB)

```javascript
// Requires a MongoDB replica set (transactions)
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const [order] = await Order.create([req.body], { session });
  await Outbox.create([{ type: 'order.created', payload: { orderId: order.id }, sent: false }], { session });
});
session.endSession();

// Relay (separate process or interval)
setInterval(async () => {
  const pending = await Outbox.find({ sent: false }).sort({ _id: 1 }).limit(100);
  for (const item of pending) {
    await publish(item.type, item.payload);       // at-least-once: consumers dedupe
    await Outbox.updateOne({ _id: item._id }, { sent: true, sentAt: new Date() });
  }
}, 1000);
```

## Best Practices
- **Consumers must be idempotent.** Assume every message can arrive twice.
- **Use a message key** (Kafka) for anything that needs ordering per entity.
- **Never block a partition/queue** on one bad message — retry topic or DLQ.
- **Version your events** and never break an existing schema.
- **Use the outbox pattern** when "save to DB + publish" must both happen.
- **Graceful shutdown:** disconnect consumers on `SIGTERM` so work isn't lost or duplicated.
- **Monitor consumer lag** (Kafka) / **queue depth** (RabbitMQ) — growing numbers mean consumers can't keep up.
- **Keep messages small** (< 1MB). Put large files in S3 and send the URL.
