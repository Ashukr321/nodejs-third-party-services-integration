# How CAPTCHA / Bot Protection Works 🚧

### 1. The Two-Part Flow
Every CAPTCHA provider works the same way:

1. **Frontend:** Load the provider's widget script with your **site key** (public).
2. **Widget:** Runs checks in the browser (and shows a puzzle only if needed), then produces a **token**.
3. **Submit:** The token is sent to your server along with the form data.
4. **Server verify:** Your server POSTs the token + your **secret key** to the provider's `siteverify` endpoint.
5. **Decision:** Provider replies `success: true/false` (and a score for reCAPTCHA v3). Only then process the request.

```
Browser ──(widget)──► Provider       : prove I'm human
Browser ◄──token────── Provider
Browser ──form + token──► Your API
Your API ──token + secret──► Provider /siteverify
Your API ◄──{ success }──── Provider
```

**Skipping step 4 means you have no protection** — bots just send a fake token.

### 2. What the Widget Checks
- Browser environment: JavaScript engine quirks, rendering, APIs a headless browser fakes badly.
- Behavior: mouse movement, typing timing, scroll (mostly reCAPTCHA).
- Proof-of-work: small computation that is cheap for one user but expensive at bot scale (Turnstile).
- Reputation: IP, previous challenges, provider-wide signals.

### 3. Verify Endpoints
| Provider | Endpoint | Form field the widget adds |
|----------|----------|----------------------------|
| Turnstile | `https://challenges.cloudflare.com/turnstile/v0/siteverify` | `cf-turnstile-response` |
| reCAPTCHA | `https://www.google.com/recaptcha/api/siteverify` | `g-recaptcha-response` |
| hCaptcha | `https://api.hcaptcha.com/siteverify` | `h-captcha-response` |

All take `application/x-www-form-urlencoded` with `secret`, `response` (the token), and optionally `remoteip`.

### 4. Response Fields to Check
```jsonc
{
  "success": true,
  "challenge_ts": "2026-11-04T10:00:00Z",
  "hostname": "example.com",     // must be YOUR domain
  "action": "login",             // must match the action you set on the widget
  "score": 0.9,                  // reCAPTCHA v3 only: 1.0 = human, 0.0 = bot
  "error-codes": []
}
```

Checking only `success` is not enough — a token solved on an attacker's site that uses your site key would pass. Check `hostname` and `action` too.

### 5. Token Rules
- **Single use:** A token can be verified once. Replays fail with `timeout-or-duplicate`.
- **Short-lived:** Turnstile and reCAPTCHA tokens expire after about 2–5 minutes.
- **Bound to site key:** A token from another site key fails.

### 6. Score-Based Decisions (reCAPTCHA v3)
No pass/fail from Google — you choose the threshold per action:
- `score >= 0.7` → allow.
- `0.3–0.7` → step-up: ask for OTP or show a v2 checkbox.
- `< 0.3` → block or flag for review.
Start with logging only, look at the score distribution of real users, then set thresholds.

### 7. Other Layers That Work Alongside
| Technique | How it works |
|-----------|--------------|
| **Honeypot field** | Hidden input real users never fill; bots do → reject. |
| **Minimum fill time** | Form submitted < 2 seconds after load → bot. |
| **Rate limiting** | Per IP, per account, per phone number (section 11). |
| **Progressive challenge** | Show CAPTCHA only after N failures — no friction for normal users. |
| **Disposable email blocklist** | Reject sign-ups from throwaway email domains. |
| **WAF / bot management** | Cloudflare, AWS WAF Bot Control at the edge. |

### 8. Accessibility
Image puzzles block visually impaired users. Prefer invisible/managed challenges (Turnstile, reCAPTCHA v3) and always give a fallback (audio challenge or contact support).
