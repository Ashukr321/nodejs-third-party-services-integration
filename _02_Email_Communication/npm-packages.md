# NPM Packages - Email & Communication 📩

### 1. Recommended Package: `nodemailer` & `@sendgrid/mail`
Nodemailer is for general SMTP, SendGrid is for high-volume API-based sending.

- **NPM Links:** [nodemailer](https://www.npmjs.com/package/nodemailer), [@sendgrid/mail](https://www.npmjs.com/package/sendgrid/mail)
- **Install Command:** `npm install nodemailer @sendgrid/mail`

#### Code Example (Express + MongoDB)
```javascript
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendWelcomeEmail(userId) {
  const user = await User.findById(userId);
  
  const msg = {
    to: user.email,
    from: 'welcome@myapp.com',
    subject: 'Welcome to Our App!',
    text: `Hello ${user.displayName}, thanks for joining!`,
  };

  await sgMail.send(msg);
  
  // Update user in MongoDB
  user.welcomeEmailSent = true;
  await user.save();
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `mailgun-js` | [Link](https://www.npmjs.com/package/mailgun-js) | Powerful API-based email. |
| `postmark` | [Link](https://www.npmjs.com/package/postmark) | Best for transactional email deliverability. |
