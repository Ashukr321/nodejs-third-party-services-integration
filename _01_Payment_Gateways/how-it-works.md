# How Payment Gateways Work 💳

Understanding the underlying mechanism of payment processing is crucial for security and reliability.

### 1. The Tokenization Flow (PCI Compliance)
To avoid handling sensitive card data (like CVV or full card numbers) on your server, modern gateways use **Tokenization**.
1. **Frontend:** The user enters card details into an iframe or secure element provided by the gateway (e.g., Stripe Elements).
2. **Gateway:** Validates details and returns a one-time use **Token** or **Payment Method ID**.
3. **Backend:** Your server receives this token and uses it to initiate the charge via the Gateway API.

### 2. Transaction Lifecycle
- **Authorization:** The bank confirms the user has enough funds and puts a "hold" on the amount.
- **Capture:** The funds are actually moved from the user's account to the merchant's account.
- **Refund:** Reversing a captured transaction.
- **Dispute/Chargeback:** When a user claims a transaction was unauthorized.

### 3. Asynchronous Updates (Webhooks)
Payments are not always instant (e.g., Bank Transfers, 3D Secure).
- Your server initiates a payment.
- The user is redirected to their bank for 3DS verification.
- Once verified, the gateway sends a **Webhook (POST request)** to your server to notify success or failure.
- **Crucial:** Always verify the webhook signature to ensure it came from the gateway.

### 4. 3D Secure (3DS)
An additional security layer for online credit and debit card transactions (e.g., Verified by Visa). It requires the user to complete an extra verification step with their bank (usually an OTP or mobile app approval).
