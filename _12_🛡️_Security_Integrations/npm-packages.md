# NPM Packages - Security Integrations 🛡️

### 1. Recommended Packages: `helmet`, `zod`, `bcrypt`
Essential tools for HTTP headers, data validation, and password hashing.

- **NPM Links:** [helmet](https://www.npmjs.com/package/helmet), [zod](https://www.npmjs.com/package/zod), [bcrypt](https://www.npmjs.com/package/bcrypt)
- **Install Command:** `npm install helmet zod bcrypt cors`

#### Code Example (Express + MongoDB)
```javascript
const express = require('express');
const helmet = require('helmet');
const { z } = require('zod');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const app = express();
app.use(helmet());

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

app.post('/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) return res.status(400).send(result.error);

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  // Store in MongoDB
  const user = await User.create({
    email: req.body.email,
    password: hashedPassword
  });

  res.json(user);
});
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `joi` | [Link](https://www.npmjs.com/package/joi) | Popular object schema validation. |
| `validator` | [Link](https://www.npmjs.com/package/validator) | Library of string validators and sanitizers. |
| `argon2` | [Link](https://www.npmjs.com/package/argon2) | More modern and secure password hashing than bcrypt. |
| `csurf` | [Link](https://www.npmjs.com/package/csurf) | CSRF protection middleware (use with caution in APIs). |
