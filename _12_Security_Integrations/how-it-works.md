# How Security Integrations Work 🛡️

Security is a multi-layered approach ("Defense in Depth").

### 1. HTTP Headers (Helmet)
Adding specific security headers to every response to prevent common browser-based attacks.
- `Content-Security-Policy`: Restricts where scripts can be loaded from.
- `Strict-Transport-Security`: Forces HTTPS.

### 2. Static & Dynamic Analysis
- **SAST (Static Application Security Testing):** Scanning your source code without running it (e.g., looking for `eval()` or hardcoded secrets).
- **DAST (Dynamic Application Security Testing):** Testing the running application by sending malicious inputs (e.g., trying to inject SQL).

### 3. JWT Security
Using JSON Web Tokens for stateless auth.
- **Signed:** Proves the token hasn't been tampered with (HMAC or RSA).
- **Encrypted:** (Optional) Hides the payload.

### 4. Input Validation & Sanitization
Never trusting user input.
- **Validation:** Checking if an email looks like an email.
- **Sanitization:** Removing `<script>` tags from a comment before storing it.

### 5. IAM (Identity and Access Management)
Using fine-grained permissions for your own infrastructure. Your web server should have "Read" access to S3, but not "Delete" access.
