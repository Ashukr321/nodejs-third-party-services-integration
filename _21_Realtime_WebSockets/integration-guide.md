# Integration Guide - Real-time (Socket.IO + Redis Adapter) 🔌

### 1. Socket.IO Server with Express

```javascript
// npm install socket.io express
// server.js
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }, // never '*' with credentials
});

httpServer.listen(3000);
module.exports = { app, io };
```

### 2. Authenticate on Connect (JWT)

```javascript
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    next();
  } catch {
    next(new Error('unauthorized')); // client receives a connect_error
  }
});
```

Using Keycloak (section 18)? Replace `jwt.verify` with the `jose` `jwtVerify` check from that section.

### 3. Rooms, Events & Acknowledgements

```javascript
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

io.on('connection', (socket) => {
  // Personal room — lets any part of the app notify this user
  socket.join(`user:${socket.user.id}`);

  socket.on('chat:join', async (conversationId, ack) => {
    const allowed = await Conversation.exists({ _id: conversationId, members: socket.user.id });
    if (!allowed) return ack?.({ ok: false, error: 'forbidden' });
    socket.join(`conv:${conversationId}`);
    ack?.({ ok: true });
  });

  socket.on('chat:message', async ({ conversationId, text }, ack) => {
    if (!socket.rooms.has(`conv:${conversationId}`)) return ack?.({ ok: false, error: 'not joined' });
    if (typeof text !== 'string' || !text.trim() || text.length > 2000) return ack?.({ ok: false, error: 'invalid' });

    const msg = await Message.create({ conversationId, sender: socket.user.id, text: text.trim() });
    socket.to(`conv:${conversationId}`).emit('chat:message', msg); // everyone except sender
    ack?.({ ok: true, id: msg.id });
  });

  socket.on('disconnect', (reason) => {
    console.log(`user ${socket.user.id} disconnected: ${reason}`);
  });
});
```

### 4. Emit from REST Routes / Other Code

```javascript
app.post('/api/orders/:id/ship', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'shipped' }, { new: true });
  io.to(`user:${order.userId}`).emit('order:updated', { id: order.id, status: order.status });
  res.json(order);
});
```

### 5. Scale Across Servers (Redis Adapter)

```javascript
// npm install @socket.io/redis-adapter ioredis
const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');

const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
// io.to(room).emit(...) now reaches sockets on every server
```

### 6. Emit from a Worker Process (no Socket.IO server)

```javascript
// npm install @socket.io/redis-emitter ioredis
// workers/report-worker.js (e.g. a BullMQ worker from section 14)
const Redis = require('ioredis');
const { Emitter } = require('@socket.io/redis-emitter');

const emitter = new Emitter(new Redis(process.env.REDIS_URL));

async function generateReport(job) {
  emitter.to(`user:${job.data.userId}`).emit('report:progress', { percent: 50 });
  // ...
  emitter.to(`user:${job.data.userId}`).emit('report:done', { url: '/reports/123.pdf' });
}
```

### 7. Client (Browser)

```javascript
// npm install socket.io-client
import { io } from 'socket.io-client';

const socket = io('https://api.example.com', {
  auth: { token: localStorage.getItem('accessToken') },
  transports: ['websocket'], // skip long-polling → no sticky sessions needed
});

socket.on('connect_error', (err) => console.error(err.message)); // 'unauthorized'
socket.emit('chat:join', 'conv123', (res) => console.log(res));
socket.on('chat:message', (msg) => render(msg));
```

### 8. Server-Sent Events (No Library)

```javascript
const clients = new Map(); // userId -> Set<res>

app.get('/api/events', requireAuth, (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders();

  const set = clients.get(req.user.id) || new Set();
  set.add(res);
  clients.set(req.user.id, set);

  const ping = setInterval(() => res.write(': ping\n\n'), 25_000); // keep proxies from closing it
  req.on('close', () => { clearInterval(ping); set.delete(res); });
});

function sendToUser(userId, event, data) {
  for (const res of clients.get(userId) || []) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
// shortcut: in-memory map only reaches users on this instance; publish via Redis to scale out
```

Browser: `const es = new EventSource('/api/events', { withCredentials: true }); es.addEventListener('order:updated', e => ...)`.

### 9. Best Practices
- **Authenticate at the handshake** and **authorize every room join**.
- **Validate every incoming event** like an HTTP body — sockets are a trust boundary.
- **Rate-limit events per socket** (e.g., max 10 messages/second) to stop spam/flooding.
- **Persist first, then emit.** The DB is the source of truth; sockets are delivery only. Clients refetch missed messages on reconnect.
- **Use `wss://`** in production, behind a proxy configured for WebSocket upgrade (nginx: `proxy_set_header Upgrade $http_upgrade;`).
- **Handle token expiry:** disconnect sockets when the token expires, and let the client reconnect with a fresh one.
- **Use the Redis adapter** as soon as you run more than one instance.
- **Keep payloads small** — send IDs and changed fields, not whole documents.
