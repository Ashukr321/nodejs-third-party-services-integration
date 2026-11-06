# How PDF & Document Generation Works 📄

### 1. HTML → PDF with a Headless Browser
1. Build an HTML string from a template + data (Handlebars, EJS, or plain template literals).
2. Launch headless Chrome (Puppeteer/Playwright) — or reuse a running one.
3. Load the HTML into a page and wait for fonts/images to load.
4. Call Chrome's **print to PDF** (`page.pdf()`), using CSS print rules for page size and margins.
5. Get a `Buffer` → stream to the user, upload to S3, or attach to an email.

**Pros:** Full CSS (flexbox, grid, web fonts), same templates as your website, charts via JS.
**Cons:** Chrome is heavy (~100–300MB RAM per browser), slow to start (~1s), and needs extra system libraries in Docker.

### 2. Programmatic PDF (PDFKit)
You draw everything with code: `text()`, `moveTo().lineTo()`, `image()`, set fonts and positions.

**Pros:** Fast, low memory, no browser, streams output.
**Cons:** Layout is manual — tables, wrapping, and page breaks take effort.

### 3. Print CSS Essentials
```css
@page { size: A4; margin: 20mm 15mm; }
thead { display: table-header-group; }     /* repeat table header on every page */
tr, .no-break { break-inside: avoid; }     /* don't split a row across pages */
.page-break { break-before: page; }
body { -webkit-print-color-adjust: exact; } /* keep background colors */
```

### 4. Architecture: Don't Generate PDFs in the Request
Generating a PDF can take 1–10 seconds and a lot of memory. Under load, it blocks your API.

**Recommended flow:**
1. `POST /api/reports` → create a `Report` record with `status: pending`, enqueue a job (section 14), return `202 Accepted` + report ID.
2. Worker generates the PDF → uploads it to S3 (section 5) → sets `status: ready` and stores the S3 key.
3. Notify the user (WebSocket from section 21, email, or the client polls `GET /api/reports/:id`).
4. Download via a **short-lived pre-signed S3 URL**.

For small documents (one-page invoice) generating inline is fine, as long as you reuse the browser and limit concurrency.

### 5. Reusing the Browser
- Launching Chrome per request: ~1s + high memory → **don't**.
- Launch **once** at worker startup, open a new **page** per job, close the page after.
- Limit concurrent pages (e.g., 2–4 per worker) to avoid running out of memory.
- Restart the browser if it crashes or after N jobs to avoid memory leaks.

### 6. Security Risks of HTML → PDF
User data ends up in HTML that a real browser renders on your server:
- **HTML/JS injection:** A customer name like `<script>...</script>` or `<img src=...>` runs in Chrome. Always **escape** user data (Handlebars `{{ }}` does this; `{{{ }}}` does not).
- **SSRF:** Injected `<img src="http://169.254.169.254/...">` or `<iframe src="http://internal-admin/">` makes your server fetch internal URLs. **Block network requests** from the page except for allowed hosts.
- **Local files:** Never render with a `file://` base URL; disable JavaScript if templates don't need it.

### 7. Fonts & Languages
- Containers often have no fonts → text renders as boxes. Install fonts in the image or embed them via `@font-face` with base64 / local files.
- For Hindi and other Indic scripts, use fonts like **Noto Sans Devanagari**; Chrome handles complex text shaping, PDFKit needs a font that supports the script and may still render some ligatures incorrectly.
- The ₹ symbol needs a font that includes it.

### 8. Storage & Retention
- Store the generated file in object storage (S3), not on the server disk.
- Save metadata in MongoDB: `{ type, ownerId, s3Key, status, createdAt }`.
- Invoices are often legally required to be kept for years — use S3 lifecycle rules for other temporary exports.
- Consider regenerating on demand instead of storing, if data is immutable and generation is cheap.
