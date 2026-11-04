# How Message Brokers Work 📨

## Part A — Kafka

### 1. Key Terminology
- **Broker:** A Kafka server. A cluster has several.
- **Topic:** A named stream of messages (e.g., `orders`).
- **Partition:** A topic is split into partitions. Each partition is an **append-only log** with ordered messages.
- **Offset:** The position of a message in a partition.
- **Producer:** Writes messages to a topic.
- **Consumer Group:** A set of consumers sharing the work. Each partition is read by **one** consumer in the group.
- **Replication factor:** How many brokers hold a copy of each partition.

### 2. How a Message Flows
1. Producer sends `{ key: 'order-42', value: {...} }` to topic `orders`.
2. Kafka hashes the **key** to pick a partition → all messages for `order-42` land in the same partition, **in order**.
3. Message is appended and replicated; it stays until the retention period ends (e.g., 7 days).
4. Each consumer group reads at its own pace and **commits its offset** ("I've processed up to 1503").
5. On restart, the consumer resumes from the last committed offset.

### 3. Scaling Rule
- Max parallel consumers in a group = **number of partitions**.
- 6 partitions + 3 consumers → each reads 2. Add a 7th consumer → it sits idle.

### 4. Delivery Guarantees
- **At-most-once:** Commit offset before processing. Crash = message lost.
- **At-least-once (default):** Commit after processing. Crash = message reprocessed → **consumers must be idempotent**.
- **Exactly-once:** Kafka transactions + idempotent producer. Only inside Kafka; side effects (emails, HTTP calls) are still at-least-once.

## Part B — RabbitMQ

### 5. Key Terminology
- **Producer** publishes to an **Exchange** (never directly to a queue).
- **Exchange** routes the message to **Queues** using **Bindings**.
- **Consumer** reads from a queue and **acks** each message.
- **Routing key:** Label on the message used for routing (e.g., `order.created`).

### 6. Exchange Types
| Type | Routing | Example |
|------|---------|---------|
| `direct` | Exact routing-key match | `email` → email queue |
| `topic` | Pattern match: `*` = one word, `#` = zero or more | `order.*` gets `order.created`, `order.paid` |
| `fanout` | Every bound queue gets a copy | Broadcast cache invalidation |
| `headers` | Match on message headers | Rarely used |

### 7. Acknowledgements
- **ack:** Processed — delete from queue.
- **nack / reject (requeue=false):** Failed — drop it or send it to the **Dead Letter Exchange**.
- **No ack + consumer dies:** Message goes back to the queue for another consumer.
- **Prefetch:** Max unacked messages per consumer (`prefetch(10)`) — prevents one consumer hoarding work.

### 8. Durability
To survive a broker restart you need all three:
1. **Durable exchange**, 2. **Durable queue**, 3. **Persistent messages**.
For production, use **quorum queues** (replicated across nodes).

## Part C — Patterns for Both

### 9. Dead Letter Queue (DLQ)
Messages that fail repeatedly go to a separate queue/topic for inspection instead of blocking others or being lost.

### 10. Idempotent Consumer
Every message has a unique `eventId`. Before processing, check whether it's been handled (e.g., a unique index in MongoDB). Duplicate → skip.

### 11. Transactional Outbox
**Problem:** You save an order to MongoDB, then publish `order.created` — if the app crashes between the two, the event is lost.
**Solution:**
1. In the **same DB transaction**, save the order **and** an `outbox` document.
2. A separate relay process reads unsent outbox entries, publishes them, and marks them sent.

### 12. Message Schema
- Include: `eventId`, `type`, `version`, `occurredAt`, `data`.
- Never make breaking changes to a published event — add a new `version` instead.
- Larger teams use a **Schema Registry** (Avro / Protobuf / JSON Schema).
