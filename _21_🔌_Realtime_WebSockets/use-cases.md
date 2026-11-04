# Use Cases - Real-time (WebSockets) 🔌

Real-time features push data from the server to the client the moment something happens — no refresh, no polling.

### 1. Chat & Messaging
- **Example:** 1-to-1 and group chat, typing indicators, read receipts.

### 2. Live Notifications
- **Example:** "Your order has shipped" appears instantly in the web app (complements push notifications in section 6, which work when the app is closed).

### 3. Live Tracking
- **Example:** Delivery partner's location updating on a map every few seconds (pairs with section 7, Maps).

### 4. Dashboards & Live Data
- **Example:** Admin dashboard with live order count, stock prices, sports scores.

### 5. Collaboration
- **Example:** Multiple users editing the same document or whiteboard; presence ("3 people viewing").

### 6. Multiplayer Games & Auctions
- **Example:** Live bidding where every bidder sees the new highest bid instantly.

### 7. Progress of Long Tasks
- **Example:** A background job (section 14) generating a report sends 10% → 50% → done to the user's browser.

### 8. Choosing the Right Technique
| Technique | Direction | Best for |
|-----------|-----------|----------|
| **Polling** | Client asks every N seconds | Simple, low-frequency updates |
| **Server-Sent Events (SSE)** | Server → client only, over HTTP | Notifications, feeds, AI token streaming |
| **WebSockets** | Both directions, persistent | Chat, games, collaboration |
| **Managed (Pusher, Ably)** | Both, hosted for you | No infra to run, pay per message/connection |

If the client only **receives**, SSE is simpler than WebSockets.
