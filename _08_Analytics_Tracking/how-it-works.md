# How Analytics & Tracking Work 📊

Analytics is about capturing events and turning them into insights.

### 1. The Event-Based Model
Most modern analytics (like Mixpanel or GA4) use an event-based model:
- **Event:** Something that happened (e.g., `button_clicked`).
- **Properties:** Context about the event (e.g., `button_name: "subscribe"`, `page: "/pricing"`).
- **User Identity:** Linking events to a specific user across devices.

### 2. Client-side vs. Server-side Tracking
- **Client-side:** Easiest to implement. Captures browser info (URL, device). Can be blocked by AdBlockers.
- **Server-side:** More reliable and secure. Good for tracking sensitive events (e.g., `payment_completed`). Not affected by AdBlockers.

### 3. Identity Resolution (Aliasing)
Mapping an anonymous user (who just landed on the site) to a known user (after they log in) so their entire journey can be analyzed.

### 4. Data Warehousing
For large scale, raw data is sent to a data warehouse (BigQuery, Snowflake) for complex SQL analysis.

### 5. Cookies & Privacy
Using `_ga` or similar cookies to track sessions. Must comply with GDPR/CCPA by providing opt-out mechanisms.
