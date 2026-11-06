# Use Cases - Message Brokers (Kafka / RabbitMQ) 📨

A message broker lets services talk **asynchronously**: one service publishes a message, others consume it later. The publisher doesn't know or wait for the consumers.

Section 14 (BullMQ) covers **job queues** — "do this task later". This section covers **events between services** — "this happened, whoever cares can react".

### 1. Decoupling Microservices
- **Example:** `order-service` publishes `order.created`. `email-service`, `inventory-service`, and `analytics-service` each consume it. Adding a new consumer needs no change in `order-service`.

### 2. Absorbing Traffic Spikes
The broker buffers messages so consumers process at their own pace.
- **Example:** A flash sale produces 50k orders/minute; the fulfillment service processes 5k/minute without crashing.

### 3. Event Sourcing & Audit Logs (Kafka)
Kafka keeps messages for days or forever, so new services can **replay history**.
- **Example:** Rebuild a search index by re-reading every `product.updated` event from the start.

### 4. Real-Time Data Pipelines (Kafka)
Stream clicks, logs, or IoT data into analytics systems.
- **Example:** App events → Kafka → ClickHouse / Elasticsearch / data warehouse.

### 5. Task Routing & Work Distribution (RabbitMQ)
Route messages by type or pattern to the right workers.
- **Example:** `notification.email` → email workers, `notification.sms` → SMS workers.

### 6. Request/Reply Between Services (RabbitMQ)
RPC over a queue when an HTTP call between services isn't suitable.
- **Example:** Ask a pricing service for a quote with a `replyTo` queue and `correlationId`.

### 7. Kafka vs. RabbitMQ vs. BullMQ
| | **Kafka** | **RabbitMQ** | **BullMQ (Redis)** |
|--|-----------|--------------|--------------------|
| Model | Distributed log | Smart broker, queues + routing | Job queue |
| Message after consume | **Kept** (replayable) | Deleted on ack | Kept as completed/failed job |
| Ordering | Per partition | Per queue (single consumer) | Per queue |
| Throughput | Very high (millions/s) | High (tens of thousands/s) | Medium |
| Routing | By topic + key | Exchanges: direct, topic, fanout, headers | By queue name |
| Best for | Event streaming, replay, analytics | Service messaging, complex routing | Background jobs in a Node app |
| Ops cost | High | Medium | Low (just Redis) |

**Rule of thumb:** jobs inside one app → BullMQ. Events between a few services → RabbitMQ. High-volume streams or replay → Kafka.

### 8. Managed Options
- **Kafka:** Confluent Cloud, AWS MSK, Upstash Kafka, Redpanda (Kafka-compatible).
- **RabbitMQ:** CloudAMQP, Amazon MQ.
- **Cloud-native:** AWS SQS/SNS, Google Pub/Sub, Azure Service Bus.
