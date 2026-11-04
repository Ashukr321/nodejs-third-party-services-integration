# Integration Guide - Bot Protection (Cloudflare Turnstile) 🚧

No SDK needed — verification is a single HTTPS POST using Node's built-in `fetch` (Node 18+).

### 1. Get Keys
Cloudflare dashboard → **Turnstile** → Add widget → add your domains (and `localhost` for dev) → copy the **site key** and **secret key**.

```env
TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

For automated tests Cloudflare publishes dummy keys:
| Key | Value | Behavior |
|-----|-------|----------|
| Site key | `1x00000000000000000000AA` | Always passes |
| Secret key | `1x0000000000000000000000000000000AA` | Always passes |
| Secret key | `2x0000000000000000000000000000000AA` | Always fails |

### 2. Frontend Widget

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<form action="/api/auth/signup" method="POST">
  <input name="email" type="email" required />
  <input name="password" type="password" required />

  <!-- Honeypot: hidden from humans, bots fill it -->
  <input name="website" type="text" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true" />

  <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY" data-action="signup"></div>
  <button type="submit">Sign up</button>
</form>
```

The widget adds a hidden `cf-turnstile-response` field to the form. For SPAs, use `turnstile.render()` with a `callback` and send the token in your JSON body.

### 3. Verify Helper

```javascript
// lib/turnstile.js
const crypto = require('crypto');

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ALLOWED_HOSTS = (process.env.TURNSTILE_HOSTNAMES || '').split(',').filter(Boolean);

async function verifyTurnstile(token, { ip, expectedAction } = {}) {
  if (!token || typeof token !== 'string' || token.length > 2048) return { ok: false, reason: 'missing-token' };

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
    idempotency_key: crypto.randomUUID(), // lets you safely retry this call on a network error
  });
  if (ip) body.append('remoteip', ip);

  let data;
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(5000) });
    data = await res.json();
  } catch (err) {
    // Provider unreachable: fail closed for sensitive actions (decide per endpoint)
    return { ok: false, reason: 'verify-unavailable' };
  }

  if (!data.success) return { ok: false, reason: (data['error-codes'] || []).join(',') };
  if (expectedAction && data.action !== expectedAction) return { ok: false, reason: 'action-mismatch' };
  if (ALLOWED_HOSTS.length && !ALLOWED_HOSTS.includes(data.hostname)) return { ok: false, reason: 'hostname-mismatch' };
  return { ok: true };
}

module.exports = { verifyTurnstile };
```

### 4. Express Middleware

```javascript
// middleware/requireHuman.js
const { verifyTurnstile } = require('../lib/turnstile');

const requireHuman = (action) => async (req, res, next) => {
  if (req.body.website) return res.status(400).json({ error: 'Invalid request' }); // honeypot filled

  const token = req.body['cf-turnstile-response'] || req.body.captchaToken;
  const result = await verifyTurnstile(token, { ip: req.ip, expectedAction: action });
  if (!result.ok) {
    req.log?.warn({ reason: result.reason, ip: req.ip }, 'captcha failed');
    return res.status(403).json({ error: 'Bot check failed, please try again' });
  }
  next();
};

module.exports = { requireHuman };
```

`req.ip` is only the real client IP if you set `app.set('trust proxy', ...)` correctly behind a load balancer.

### 5. Apply to Sensitive Routes

```javascript
const { requireHuman } = require('./middleware/requireHuman');
const rateLimit = require('express-rate-limit');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5 });

app.post('/api/auth/signup', requireHuman('signup'), signupHandler);
app.post('/api/auth/send-otp', otpLimiter, requireHuman('otp'), sendOtpHandler);
app.post('/api/contact', requireHuman('contact'), contactHandler);
```

### 6. Progressive Challenge on Login

```javascript
const redis = require('./lib/redis'); // section 19

app.post('/api/auth/login', async (req, res, next) => {
  const key = `login-fail:${req.ip}`;
  const failures = Number(await redis.get(key)) || 0;

  if (failures >= 3) {
    const result = await verifyTurnstile(req.body.captchaToken, { ip: req.ip, expectedAction: 'login' });
    if (!result.ok) return res.status(403).json({ error: 'captcha_required' }); // frontend then shows widget
  }

  const user = await authenticate(req.body.email, req.body.password);
  if (!user) {
    await redis.multi().incr(key).expire(key, 15 * 60).exec();
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  await redis.del(key);
  // ...issue session / token
});
```

### 7. reCAPTCHA v3 (Score-Based) Variant

```javascript
async function verifyRecaptcha(token, expectedAction, minScore = 0.5) {
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: token }),
  });
  const data = await res.json();
  return data.success && data.action === expectedAction && data.score >= minScore;
}
```

### 8. Testing

```javascript
// Use Cloudflare's dummy secrets in .env.test
// TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA  → always passes
// TURNSTILE_SECRET_KEY=2x0000000000000000000000000000000AA  → always fails
// Or mock the network call with nock (section 17):
nock('https://challenges.cloudflare.com')
  .post('/turnstile/v0/siteverify')
  .reply(200, { success: true, action: 'signup', hostname: 'localhost' });
```

### 9. Best Practices
- **Always verify on the server.** The frontend widget alone does nothing.
- **Never expose the secret key** — only the site key goes to the browser.
- **Check `action` and `hostname`**, not just `success`.
- **Set a timeout** on the verify call, and decide fail-open vs. fail-closed per endpoint (fail-closed for OTP/sign-up).
- **Verify before doing anything expensive** (DB writes, SMS, AI calls).
- **Combine with rate limiting** — CAPTCHA farms solve challenges for pennies.
- **Log failures with reason codes** to spot attacks and tune thresholds.
- **Don't add CAPTCHA everywhere** — it hurts conversion. Use it on abuse-prone endpoints or progressively.
