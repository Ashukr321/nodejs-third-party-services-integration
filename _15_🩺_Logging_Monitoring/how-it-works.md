# How Logging & Monitoring Work 🩺

Collecting and analyzing telemetry data from your running application.

### 1. Log Levels
Categorizing logs by importance to filter noise.
- **ERROR:** Something went wrong (needs immediate attention).
- **WARN:** Potential issue (investigate later).
- **INFO:** Normal system events (user logged in).
- **DEBUG:** Verbose info for development.

### 2. Structured Logging (JSON)
Logging as JSON instead of plain text.
- **Why:** Makes it easy for machines (Elasticsearch/Splunk) to parse and search through millions of logs.

### 3. Distributed Tracing
Assigning a unique `Trace-ID` to a request as it moves through multiple microservices.
- **Why:** Helps you see exactly where a request slowed down or failed in a complex system.

### 4. Metrics & Thresholds
Counting events (e.g., number of 500 errors) and setting alerts when they cross a threshold.

### 5. Log Rotation
Automatically deleting or archiving old log files to prevent the server's disk from filling up.
