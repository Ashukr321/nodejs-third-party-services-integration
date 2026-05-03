# How Email Services Work 📩

Email delivery is complex due to spam filters and technical protocols.

### 1. SMTP vs. HTTP API
- **SMTP (Simple Mail Transfer Protocol):** The traditional protocol. Reliable but can be slower for high volume.
- **HTTP API:** Modern services (SendGrid, Postmark) provide REST APIs. Faster, easier to handle responses, and better for tracking.

### 2. Deliverability & Reputation (The Big Three)
To ensure emails land in the Inbox (not Spam), you must configure:
- **SPF (Sender Policy Framework):** Specifies which mail servers are authorized to send email on behalf of your domain.
- **DKIM (DomainKeys Identified Mail):** Adds a digital signature to emails, allowing the receiver to verify the sender.
- **DMARC:** Tells receiving servers what to do if SPF or DKIM fails (e.g., reject or quarantine).

### 3. Templates & Dynamic Content
Modern services allow you to design templates in their UI and send data via JSON to populate variables like `{{name}}` or `{{order_id}}`.

### 4. Suppression Lists
Automatic handling of unsubscribes, bounces, and spam complaints to protect your sender reputation.
