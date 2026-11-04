# NPM Packages - Real-time (WebSockets) 🔌

### 1. Recommended Package: `socket.io`
Event-based real-time framework with rooms, auto-reconnect, acknowledgements, and a Redis adapter for scaling.

- **NPM Links:** [socket.io](https://www.npmjs.com/package/socket.io), [socket.io-client](https://www.npmjs.com/package/socket.io-client), [@socket.io/redis-adapter](https://www.npmjs.com/package/@socket.io/redis-adapter)
- **Install Command:** `npm install socket.io @socket.io/redis-adapter ioredis`

#### Code Example (Express + MongoDB)
```javascript
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });

io.use(authenticateSocket); // see integration-guide.md

io.on('connection', async (socket) => {
  socket.join(`user:${socket.user.id}`);

  // Send unread notifications on connect so nothing is missed while offline
  const unread = await Notification.find({ userId: socket.user.id, read: false }).limit(50).lean();
  socket.emit('notifications:unread', unread);
});

async function notify(userId, payload) {
  const doc = await Notification.create({ userId, ...payload }); // persist first
  io.to(`user:${userId}`).emit('notification', doc);           // then deliver
}

server.listen(3000);
```

### 2. Recommended Package: `ws`
Fast, minimal, standards-compliant WebSocket server. Use when clients are not Socket.IO (IoT devices, other languages, native WebSocket in the browser).

- **NPM Link:** [ws](https://www.npmjs.com/package/ws)
- **Install Command:** `npm install ws`

```javascript
const http = require('http');
const { WebSocketServer } = require('ws');

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (data) => {
    // Broadcast to everyone
    for (const client of wss.clients) if (client.readyState === ws.OPEN) client.send(data.toString());
  });
});

// Heartbeat: terminate dead connections
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 30_000);

server.listen(3000);
```

### 3. Recommended Package: `pusher` (managed)
Hosted real-time channels — your server only triggers events over HTTP; Pusher holds the connections.

- **NPM Link:** [pusher](https://www.npmjs.com/package/pusher)
- **Install Command:** `npm install pusher`

```javascript
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER, // e.g. 'ap2'
  useTLS: true,
});

await pusher.trigger(`private-user-${userId}`, 'order-updated', { id: order.id, status: 'shipped' });
```

### 4. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `@socket.io/redis-emitter` | [Link](https://www.npmjs.com/package/@socket.io/redis-emitter) | Emit Socket.IO events from workers without a Socket.IO server. |
| `ably` | [Link](https://www.npmjs.com/package/ably) | Managed real-time with message history and guaranteed ordering. |
| `uWebSockets.js` | [Link](https://github.com/uNetworking/uWebSockets.js) | Extremely high-performance WebSocket server (installed from GitHub, not npm). |
| `@supabase/realtime-js` | [Link](https://www.npmjs.com/package/@supabase/realtime-js) | Realtime DB changes and broadcast if you use Supabase. |
| `better-sse` | [Link](https://www.npmjs.com/package/better-sse) | Helpers for Server-Sent Events with channels and keep-alive. |
