# Integration Guide - Email (Nodemailer & SendGrid) 📩

### 1. Using Nodemailer (General SMTP)
Best for simple setups or custom SMTP servers.

```javascript
// npm install nodemailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail(to, subject, text) {
  await transporter.sendMail({ from: '"MyApp" <no-reply@myapp.com>', to, subject, text });
}
```

### 2. Using SendGrid (HTTP API)
Best for high deliverability and analytics.

```javascript
// npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'user@example.com',
  from: 'no-reply@myapp.com',
  templateId: 'd-1234567890abcdef', // Use dynamic templates
  dynamicTemplateData: {
    name: 'John Doe',
    otp: '123456',
  },
};

sgMail.send(msg).catch(console.error);
```

### 3. Best Practices
- **Use Background Jobs:** Never send emails directly in the request-response cycle. It slows down the app. Use a queue like BullMQ.
- **Track Bounces:** Monitor failed deliveries to keep your list clean.
- **Use Subdomains for Marketing:** Send transactional emails from `mail.myapp.com` and marketing from `news.myapp.com` to isolate reputations.
- **Personalize:** Higher engagement leads to better deliverability.
- **Testing:** Use tools like **Mailtrap** or **Ethereal Email** during development to catch emails without sending them to real users.
