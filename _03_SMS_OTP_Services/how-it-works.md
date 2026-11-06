# How SMS Services Work 📱

SMS delivery involves complex routing through global telecommunication networks.

### 1. The SMS Gateway
An SMS gateway acts as a bridge between the internet (your app) and the cellular network. Providers like Twilio or MessageBird handle the "heavy lifting" of connecting to hundreds of carriers.

### 2. Sender IDs & Numbers
- **Long Codes:** Standard 10-digit phone numbers. Good for 2-way communication.
- **Short Codes:** 5-6 digit numbers. High throughput, perfect for mass marketing or high-volume OTPs. Expensive and require carrier approval.
- **Alphanumeric Sender ID:** Instead of a number, the user sees a name (e.g., "APPLE", "GOOGLE"). Great for branding but doesn't support replies.

### 3. Global Regulations
SMS is highly regulated.
- **Opt-in/Opt-out:** Users must consent to receive messages.
- **Local Laws:** Some countries restrict when you can send marketing SMS (e.g., not at night).

### 4. OTP Lifecycle
1. **Generate:** Create a random 4-6 digit code.
2. **Store:** Save it in a fast database (Redis) with an expiration time (e.g., 5 minutes).
3. **Send:** Transmit via SMS API.
4. **Verify:** User enters the code; your app checks if it matches and hasn't expired.
