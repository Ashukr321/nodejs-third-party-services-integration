# Integration Guide - Security (Helmet & Input Validation) 🛡️

### 1. Hardening Express (Helmet)

```javascript
// npm install helmet
const express = require('express');
const helmet = require('helmet');

const app = express();

// Sets various security-related HTTP headers
app.use(helmet());
```

### 2. Input Validation (Joi/Zod)

```javascript
// npm install zod
const { z } = require('zod');

const userSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().int().positive(),
});

app.post('/register', (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  // Proceed with registration...
});
```

### 3. Best Practices
- **Environment Variables:** Use `.env` and NEVER commit it. Use `dotenv-safe` to ensure all required variables are present.
- **CSRF Protection:** Use `csurf` middleware if you are using cookies/sessions for browser-based apps.
- **Hashing Passwords:** Always use **bcrypt** or **argon2** with a high salt/cost factor.
- **SQL Injection:** Always use parameterized queries (provided by modern ORMs like Sequelize or Prisma).
- **Update Dependencies:** Regularly run `npm audit fix` and use Snyk to catch vulnerable packages early.
- **Principle of Least Privilege:** Your database user should only have the permissions it absolutely needs (e.g., `SELECT`, `INSERT`, `UPDATE`, but not `DROP TABLE`).
