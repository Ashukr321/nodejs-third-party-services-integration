# Use Cases - Bot Protection / CAPTCHA 🚧

Bots fill forms, guess passwords, and burn your third-party credits. CAPTCHA services check that a request comes from a real browser driven by a human, before your server does anything expensive.

### 1. Protecting Login (Credential Stuffing)
Attackers try leaked email/password pairs from other breaches.
- **Example:** Show a challenge after 3 failed logins from the same IP or account.

### 2. Protecting Sign-Up (Fake Accounts)
- **Example:** Stop bots creating thousands of accounts to abuse free trials or referral bonuses.

### 3. Protecting OTP Endpoints (SMS Pumping Fraud)
Bots trigger OTPs to premium-rate numbers; you pay Twilio for every SMS (section 3).
- **Example:** Require a CAPTCHA token before `POST /auth/send-otp`.

### 4. Contact / Lead Forms
- **Example:** Stop spam submissions that flood your inbox and CRM.

### 5. Expensive Endpoints
- **Example:** AI features (section 9), PDF generation (section 25), or search — every bot call costs money.

### 6. Checkout & Card Testing
Fraudsters test stolen cards with small payments.
- **Example:** CAPTCHA on the payment form plus Stripe Radar.

### 7. Comments, Reviews & Votes
- **Example:** Prevent fake reviews and poll manipulation.

### 8. Choosing a Provider
| Provider | User experience | Privacy | Cost |
|----------|-----------------|---------|------|
| **Cloudflare Turnstile** | Usually invisible, no puzzles | No ad tracking | Free |
| **Google reCAPTCHA v3** | Invisible, returns a score 0.0–1.0 | Google tracking | Free tier, then paid |
| **Google reCAPTCHA v2** | "I'm not a robot" checkbox / image puzzles | Google tracking | Free tier, then paid |
| **hCaptcha** | Checkbox / puzzles, or invisible (Enterprise) | Privacy-focused | Free tier, paid Enterprise |

Default choice for new projects: **Cloudflare Turnstile** — free, invisible, and doesn't require using Cloudflare for DNS.

### 9. CAPTCHA Is One Layer
Combine it with rate limiting (section 11), account lockout, honeypot fields, and email/phone verification. No single layer stops every bot.
