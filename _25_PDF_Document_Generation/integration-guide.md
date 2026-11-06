# Integration Guide - PDF Generation (Puppeteer + PDFKit) 📄

## Part A — HTML → PDF with Puppeteer

### 1. Template (Handlebars)

```handlebars
{{!-- templates/invoice.hbs --}}
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    body { font-family: 'Noto Sans', Arial, sans-serif; font-size: 12px; color: #222; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    thead { display: table-header-group; }
    th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
    td.num, th.num { text-align: right; }
    tr { break-inside: avoid; }
    .total { font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Invoice #{{invoiceNumber}}</h1>
  <div>Date: {{date}}</div>
  <div>Billed to: {{customer.name}}, {{customer.email}}</div>

  <table>
    <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
    <tbody>
      {{#each items}}
      <tr><td>{{name}}</td><td class="num">{{qty}}</td><td class="num">{{price}}</td><td class="num">{{amount}}</td></tr>
      {{/each}}
    </tbody>
  </table>

  <p class="total">Total: {{total}}</p>
</body>
</html>
```

`{{ }}` escapes HTML, so a customer named `<script>` is printed as text. Never use `{{{ }}}` for user data.

### 2. Shared Browser + Safe Rendering

```javascript
// npm install puppeteer handlebars
// lib/pdf.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');

const templates = {};
function render(name, data) {
  templates[name] ??= Handlebars.compile(fs.readFileSync(path.join(__dirname, '../templates', `${name}.hbs`), 'utf8'));
  return templates[name](data);
}

let browserPromise;
function getBrowser() {
  browserPromise ??= puppeteer.launch({ headless: true }).then((browser) => {
    browser.on('disconnected', () => { browserPromise = null; }); // relaunch next time if Chrome crashes
    return browser;
  });
  return browserPromise;
}

async function htmlToPdf(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // Block all network access — prevents SSRF through injected <img>/<iframe> URLs
    await page.setRequestInterception(true);
    page.on('request', (req) => (req.url().startsWith('data:') ? req.continue() : req.abort()));

    await page.setContent(html, { waitUntil: 'load', timeout: 15_000 });
    return await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
  } finally {
    await page.close();
  }
}

module.exports = { render, htmlToPdf, getBrowser };
```

Images and fonts must be embedded as `data:` URIs (or loaded from an allowlisted host) because the page can't fetch anything else.

### 3. Invoice Route (Small, Inline)

```javascript
const { render, htmlToPdf } = require('./lib/pdf');
const Order = require('./models/Order');

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

app.get('/api/orders/:id/invoice.pdf', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id }).lean(); // ownership check
    if (!order) return res.sendStatus(404);

    const html = render('invoice', {
      invoiceNumber: order.invoiceNumber,
      date: new Date(order.createdAt).toLocaleDateString('en-IN'),
      customer: { name: order.customerName, email: order.customerEmail },
      items: order.items.map((i) => ({ name: i.name, qty: i.qty, price: inr.format(i.price), amount: inr.format(i.price * i.qty) })),
      total: inr.format(order.total),
    });

    const pdf = await htmlToPdf(html);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${order.invoiceNumber}.pdf"`,
    });
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});
```

### 4. Large Reports via a Queue (BullMQ + S3)

```javascript
// routes/reports.js
const { Queue } = require('bullmq');
const reportQueue = new Queue('reports', { connection: { url: process.env.REDIS_URL } });

app.post('/api/reports', requireAuth, async (req, res) => {
  const report = await Report.create({ ownerId: req.user.id, params: req.body, status: 'pending' });
  await reportQueue.add('generate', { reportId: report.id }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
  res.status(202).json({ id: report.id, status: 'pending' });
});

app.get('/api/reports/:id', requireAuth, async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, ownerId: req.user.id }).lean();
  if (!report) return res.sendStatus(404);
  if (report.status !== 'ready') return res.json({ status: report.status });
  res.json({ status: 'ready', url: await presignedDownloadUrl(report.s3Key) }); // section 5
});
```

```javascript
// workers/report-worker.js
const { Worker } = require('bullmq');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { render, htmlToPdf } = require('../lib/pdf');

new Worker('reports', async (job) => {
  const report = await Report.findById(job.data.reportId);
  const data = await buildReportData(report.params);
  const pdf = await htmlToPdf(render('sales-report', data));

  const key = `reports/${report.ownerId}/${report.id}.pdf`;
  await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: pdf, ContentType: 'application/pdf' }));

  report.set({ status: 'ready', s3Key: key });
  await report.save();
}, {
  connection: { url: process.env.REDIS_URL },
  concurrency: 2, // each job opens a Chrome page — keep this low
});
```

### 5. Running Puppeteer in Docker

```dockerfile
FROM node:20-slim
# Chrome dependencies + fonts (incl. Devanagari and the ₹ sign)
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium fonts-noto fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
CMD ["node", "workers/report-worker.js"]
```

Run as a **non-root user** so Chrome's sandbox works. Avoid `--no-sandbox` unless you fully trust every template input.

## Part B — Lightweight PDFs with PDFKit

```javascript
// npm install pdfkit
const PDFDocument = require('pdfkit');

app.get('/api/tickets/:id.pdf', requireAuth, async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user.id }).lean();
  if (!ticket) return res.sendStatus(404);

  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="ticket-${ticket.code}.pdf"` });

  const doc = new PDFDocument({ size: 'A5', margin: 40 });
  doc.pipe(res); // streams directly — low memory

  doc.fontSize(20).text(ticket.eventName, { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Name: ${ticket.holderName}`); // PDFKit draws text, no HTML injection risk
  doc.text(`Date: ${new Date(ticket.eventDate).toLocaleString('en-IN')}`);
  doc.text(`Ticket code: ${ticket.code}`);
  doc.end();
});
```

For QR codes, generate a PNG buffer with the `qrcode` package (`await QRCode.toBuffer(url)`) and add it with `doc.image(buffer, { width: 120 })`.

## Part C — Fill an Existing PDF Form with pdf-lib

```javascript
// npm install pdf-lib
const { PDFDocument } = require('pdf-lib');

async function fillForm(templateBytes, values) {
  const pdf = await PDFDocument.load(templateBytes);
  const form = pdf.getForm();
  form.getTextField('applicant_name').setText(values.name);
  form.getTextField('pan_number').setText(values.pan);
  form.getCheckBox('agree_terms').check();
  form.flatten(); // make fields non-editable
  return Buffer.from(await pdf.save());
}
```

## Best Practices
- **Reuse one browser**, open a page per document, and **limit concurrency**.
- **Move heavy generation to a queue**; return `202` and notify when ready.
- **Escape all user data** in templates and **block network requests** from the page.
- **Check ownership** before generating or serving any document.
- **Embed fonts** (and test Hindi/₹ rendering) in the container image.
- **Store PDFs in S3** with pre-signed download URLs, not on local disk.
- **Set timeouts** on `setContent`/`pdf()` so a bad template can't hang a worker.
- **Version your templates** — store the template version used with each invoice for audits.
