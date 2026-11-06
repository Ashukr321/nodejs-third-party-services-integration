# How Real-time Communication Works 🔌

### 1. The WebSocket Handshake
WebSocket starts as a normal HTTP request, then "upgrades" to a persistent two-way TCP connection.

```
GET /socket HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

After `101`, both sides send **frames** (text or binary) at any time over the same connection. URLs use `ws://` or `wss://` (TLS — always use this in production).

### 2. Raw WebSocket vs. Socket.IO
| | **`ws` (raw WebSocket)** | **Socket.IO** |
|--|--------------------------|---------------|
| Protocol | Standard WebSocket | Own protocol on top of WebSocket (client must use Socket.IO client) |
| Reconnect | You build it | Automatic |
| Rooms / broadcast | You build it | Built-in |
| Fallback | None | HTTP long-polling if WebSocket is blocked |
| Acknowledgements | You build it | Built-in (callback on emit) |
| Size | Tiny | Larger |

### 3. Socket.IO Concepts
- **Event:** Named message — `socket.emit('chat:message', data)`.
- **Room:** Server-side group of sockets. `socket.join('room:42')`, then `io.to('room:42').emit(...)`.
- **Namespace:** Separate channel on the same connection (`/admin`, `/chat`), each with its own middleware.
- **Acknowledgement:** Client passes a callback; server calls it to confirm receipt.

### 4. Authentication
Browsers can't set custom headers on a WebSocket connection, so auth is done at the handshake:
- Socket.IO: send the token in `auth: { token }` → verify in `io.use()` middleware.
- Raw `ws`: token in a cookie or a short-lived ticket in the query string (never a long-lived JWT in the URL — it ends up in logs).

Re-check permissions when joining rooms — a valid user may not be allowed in every room.

### 5. Keeping Connections Alive
- Proxies and load balancers close idle connections (often after 60s).
- **Heartbeat:** Server sends `ping` every ~25s, client replies `pong`. No pong → connection is dead → clean it up.
- Socket.IO does this automatically; with `ws` you implement it.

### 6. Scaling to Multiple Servers
**Problem:** User A is connected to server 1, user B to server 2. Server 1 does `io.to('room').emit()` — user B never gets it.

**Solution: Adapter (Pub/Sub backplane)**
1. Every server subscribes to a shared Redis channel.
2. A broadcast on server 1 is published to Redis.
3. All servers receive it and deliver to their own local sockets.

```
Client A ─ Server 1 ─┐
                     ├── Redis Pub/Sub
Client B ─ Server 2 ─┘
```

**Sticky sessions:** If Socket.IO uses HTTP long-polling, all requests from one client must reach the same server. Configure the load balancer for sticky sessions, or force `transports: ['websocket']` on the client.

### 7. Server-Sent Events (SSE)
- Plain HTTP response with `Content-Type: text/event-stream` that never ends.
- Server writes `data: {...}\n\n` whenever there's news.
- Browser's `EventSource` reconnects automatically and resends `Last-Event-ID`.
- Works through most proxies, no special protocol — but **server → client only**.

### 8. Capacity Planning
- Each connection holds memory (a few KB to tens of KB) and a file descriptor.
- One Node.js process can typically hold tens of thousands of idle connections; the real limit is message rate and CPU.
- Raise the OS file-descriptor limit (`ulimit -n`) on servers.
