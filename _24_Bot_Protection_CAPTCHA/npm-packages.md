# NPM Packages - Bot Protection / CAPTCHA 🚧

### 1. Recommended: No Package (built-in `fetch`)
All major CAPTCHA providers verify with a single form POST. Node 18+ `fetch` is enough — fewer dependencies to keep updated.

- **Docs:** [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- **Install Command:** none

#### Code Example (Express + MongoDB)
```javascript
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function isHuman(token, ip) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token || '', remoteip: ip }),
  });
  const data = await res.json();
  return data.success && data.action === 'signup';
}

app.post('/api/auth/signup', async (req, res) => {
  if (!(await isHuman(req.body['cf-turnstile-response'], req.ip))) {
    return res.status(403).json({ error: 'Bot check failed' });
  }
  const user = await User.create({
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 12),
  });
  res.status(201).json({ id: user.id });
});
```

### 2. Recommended Package: `hcaptcha`
Small helper for verifying hCaptcha tokens.

- **NPM Link:** [hcaptcha](https://www.npmjs.com/package/hcaptcha)
- **Install Command:** `npm install hcaptcha`

```javascript
const { verify } = require('hcaptcha');

const result = await verify(process.env.HCAPTCHA_SECRET, req.body['h-captcha-response']);
if (!result.success) return res.status(403).json({ error: 'Bot check failed' });
```

### 3. Frontend Packages (React)
| Package | Link | Description |
|---------|------|-------------|
| `@marsidev/react-turnstile` | [Link](https://www.npmjs.com/package/@marsidev/react-turnstile) | React component for Cloudflare Turnstile. |
| `react-google-recaptcha` | [Link](https://www.npmjs.com/package/react-google-recaptcha) | React component for reCAPTCHA v2. |
| `react-google-recaptcha-v3` | [Link](https://www.npmjs.com/package/react-google-recaptcha-v3) | React hook/provider for reCAPTCHA v3. |
| `@hcaptcha/react-hcaptcha` | [Link](https://www.npmjs.com/package/@hcaptcha/react-hcaptcha) | Official hCaptcha React component. |

### 4. Alternative / Complementary Packages
| Package | Link | Description |
|---------|------|-------------|
| `@google-cloud/recaptcha-enterprise` | [Link](https://www.npmjs.com/package/@google-cloud/recaptcha-enterprise) | reCAPTCHA Enterprise with risk analysis and reason codes. |
| `@arcjet/node` | [Link](https://www.npmjs.com/package/@arcjet/node) | Bot detection, rate limiting, and email validation as an SDK. |
| `express-rate-limit` | [Link](https://www.npmjs.com/package/express-rate-limit) | Pair with CAPTCHA on every protected route (section 11). |
| `disposable-email-domains` | [Link](https://www.npmjs.com/package/disposable-email-domains) | List of throwaway email domains to block at sign-up. |
