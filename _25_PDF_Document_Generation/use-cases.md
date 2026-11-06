# Use Cases - PDF & Document Generation 📄

Backends often need to produce documents users can download, print, or attach to emails.

### 1. Invoices & Receipts
- **Example:** After a successful payment (section 1), generate a GST invoice PDF and email it (section 2).

### 2. Reports & Exports
- **Example:** Monthly sales report as PDF; order history as Excel/CSV for the finance team.

### 3. Tickets & Passes
- **Example:** Event tickets or boarding passes with a QR code.

### 4. Certificates
- **Example:** Course completion certificates with the user's name and a verification URL.

### 5. Contracts & Agreements
- **Example:** Fill a rental agreement template, then send it for e-signature (DocuSign, Leegality, Digio).

### 6. Filling Official Forms
- **Example:** Fill fields in an existing government or bank PDF form.

### 7. Shipping Labels
- **Example:** 4x6 inch labels with barcodes for courier pickup.

### 8. Choosing an Approach
| Approach | How | Best for |
|----------|-----|----------|
| **HTML → PDF (headless Chrome)** | Render HTML/CSS with Puppeteer/Playwright | Rich layouts, reuse web templates, charts |
| **Programmatic PDF** | Draw text/lines with PDFKit | Simple, fast documents; no browser needed |
| **Modify existing PDF** | pdf-lib | Fill forms, add stamps/watermarks, merge |
| **React components → PDF** | @react-pdf/renderer | Teams already using React |
| **PDF service** | Gotenberg (self-hosted), DocRaptor, PDFMonkey | Offload Chrome from your API servers |
| **Spreadsheets** | ExcelJS | Data exports users will edit |
