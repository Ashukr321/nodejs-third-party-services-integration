# NPM Packages - Message Brokers 📨

### 1. Recommended Package: `kafkajs`
Pure-JavaScript Kafka client — no native dependencies, the most widely used Kafka client for Node.js. It is no longer actively developed, so for new production systems also look at `@confluentinc/kafka-javascript` (below), which offers a kafkajs-compatible API.

- **NPM Link:** [kafkajs](https://www.npmjs.com/package/kafkajs)
- **Install Command:** `npm install kafkajs`

#### Code Example (Express + MongoDB)
```javascript
const { Kafka } = require('kafkajs');
const Order = require('../models/Order');

const kafka = new Kafka({ clientId: 'order-service', brokers: ['localhost:9092'] });
const producer = kafka.producer();
await producer.connect();

app.post('/api/orders', async (req, res) => {
  const order = await Order.create(req.body);
  await producer.send({
    topic: 'orders',
    messages: [{ key: order.id, value: JSON.stringify({ eventId: crypto.randomUUID(), type: 'order.created', data: order }) }],
  });
  res.status(201).json(order);
});

// Consumer (separate process)
const consumer = kafka.consumer({ groupId: 'analytics-service' });
await consumer.connect();
await consumer.subscribe({ topic: 'orders' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    console.log('received', event.type, event.data._id);
  },
});
```

### 2. Recommended Package: `amqplib`
The standard RabbitMQ (AMQP 0-9-1) client for Node.js.

- **NPM Link:** [amqplib](https://www.npmjs.com/package/amqplib)
- **Install Command:** `npm install amqplib`

```javascript
const amqp = require('amqplib');

const conn = await amqp.connect(process.env.RABBITMQ_URL);
const ch = await conn.createChannel();

await ch.assertExchange('events', 'topic', { durable: true });
ch.publish('events', 'user.registered', Buffer.from(JSON.stringify({ userId: 42 })), { persistent: true });

await ch.assertQueue('welcome-emails', { durable: true });
await ch.bindQueue('welcome-emails', 'events', 'user.registered');
await ch.consume('welcome-emails', async (msg) => {
  const { userId } = JSON.parse(msg.content.toString());
  await sendWelcomeEmail(userId);
  ch.ack(msg);
});
```

### 3. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `@confluentinc/kafka-javascript` | [Link](https://www.npmjs.com/package/@confluentinc/kafka-javascript) | Confluent's official client (librdkafka-based) with a kafkajs-compatible API. |
| `amqp-connection-manager` | [Link](https://www.npmjs.com/package/amqp-connection-manager) | Wraps amqplib with automatic reconnect and buffered publishing. |
| `rascal` | [Link](https://www.npmjs.com/package/rascal) | Config-driven RabbitMQ topology, retries, and redelivery limits. |
| `@aws-sdk/client-sqs` | [Link](https://www.npmjs.com/package/@aws-sdk/client-sqs) | AWS SQS — fully managed queue, no broker to run. |
| `@google-cloud/pubsub` | [Link](https://www.npmjs.com/package/@google-cloud/pubsub) | Google Cloud Pub/Sub client. |
| `nats` | [Link](https://www.npmjs.com/package/nats) | NATS — lightweight, very fast messaging with JetStream persistence. |
