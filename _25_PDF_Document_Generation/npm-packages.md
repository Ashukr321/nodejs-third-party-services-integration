# NPM Packages - PDF & Document Generation 📄

### 1. Recommended Package: `puppeteer`
Controls headless Chrome. Render any HTML/CSS to a pixel-perfect PDF.

- **NPM Link:** [puppeteer](https://www.npmjs.com/package/puppeteer)
- **Install Command:** `npm install puppeteer handlebars`

#### Code Example (Express + MongoDB)
```javascript
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const Certificate = require('./models/Certificate');

const template = Handlebars.compile(`
  <html><body style="font-family: Arial; text-align: center; padding-top: 80px">
    <h1>Certificate of Completion</h1>
    <p>This certifies that <b>{{name}}</b> completed <b>{{course}}</b> on {{date}}.</p>
  </body></html>`);

const browserPromise = puppeteer.launch(); // launch once, reuse

app.get('/api/certificates/:id.pdf', requireAuth, async (req, res) => {
  const cert = await Certificate.findOne({ _id: req.params.id, userId: req.user.id }).lean();
  if (!cert) return res.sendStatus(404);

  const page = await (await browserPromise).newPage();
  try {
    await page.setContent(template({ name: cert.name, course: cert.course, date: cert.issuedAt.toDateString() }));
    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
    res.type('application/pdf').send(pdf);
  } finally {
    await page.close();
  }
});
```

### 2. Recommended Package: `pdfkit`
Draw PDFs programmatically. No browser, low memory, streams output.

- **NPM Link:** [pdfkit](https://www.npmjs.com/package/pdfkit)
- **Install Command:** `npm install pdfkit`

```javascript
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({ size: 'A4', margin: 50 });
doc.pipe(res);
doc.fontSize(18).text('Monthly Statement');
doc.moveDown().fontSize(11).text(`Account: ${account.number}`);
doc.end();
```

### 3. Recommended Package: `pdf-lib`
Create and **modify** PDFs: fill forms, merge files, add watermarks. Pure JavaScript, works in Node and browsers.

- **NPM Link:** [pdf-lib](https://www.npmjs.com/package/pdf-lib)
- **Install Command:** `npm install pdf-lib`

```javascript
const { PDFDocument, rgb, degrees } = require('pdf-lib');

const pdf = await PDFDocument.load(existingPdfBytes);
for (const page of pdf.getPages()) {
  page.drawText('CONFIDENTIAL', { x: 150, y: 400, size: 50, color: rgb(0.9, 0.1, 0.1), opacity: 0.2, rotate: degrees(45) });
}
const bytes = await pdf.save();
```

### 4. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `playwright` | [Link](https://www.npmjs.com/package/playwright) | Alternative to Puppeteer; same `page.pdf()` approach (Chromium only for PDF). |
| `@react-pdf/renderer` | [Link](https://www.npmjs.com/package/@react-pdf/renderer) | Build PDFs with React components, no browser needed. |
| `exceljs` | [Link](https://www.npmjs.com/package/exceljs) | Generate/read Excel (.xlsx) files with styles and streaming. |
| `docx` | [Link](https://www.npmjs.com/package/docx) | Generate Word (.docx) documents. |
| `qrcode` | [Link](https://www.npmjs.com/package/qrcode) | QR codes as PNG/SVG/data URL for tickets and invoices. |
| `bwip-js` | [Link](https://www.npmjs.com/package/bwip-js) | Barcodes (Code128, EAN, etc.) for shipping labels. |
| Gotenberg | [Link](https://gotenberg.dev/) | Docker service with an HTTP API for HTML/Office → PDF; keeps Chrome off your API servers. |
