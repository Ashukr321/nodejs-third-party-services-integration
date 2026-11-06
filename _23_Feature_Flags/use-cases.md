# Use Cases - Feature Flags 🚩

A feature flag is an `if` statement whose condition is controlled from a dashboard instead of a code change. Deploying code and releasing a feature become two separate steps.

### 1. Gradual Rollouts (Canary Releases)
Turn a feature on for 5% of users, watch errors and metrics, then 25%, 50%, 100%.
- **Example:** New checkout flow rolled out to 10% of users in India first.

### 2. Kill Switches for Third-Party Integrations
Turn off or swap a failing provider in seconds, without a deploy.
- **Example:** Razorpay is down → flip `payments.provider` from `razorpay` to `stripe`.
- **Example:** OpenAI latency spikes → disable "AI summary" and hide the button.

### 3. Trunk-Based Development
Merge unfinished work to `main` behind a flag that is off in production.
- **Example:** A half-built feature ships in every release but stays invisible until ready.

### 4. Beta Programs & Targeting
Enable features for specific users, organizations, plans, or regions.
- **Example:** `advanced-analytics` only for `plan = enterprise`; internal staff see everything.

### 5. A/B Testing & Experiments
Show variant A or B and measure which converts better (pair with section 8, Analytics).
- **Example:** Two pricing page layouts; track sign-up rate per variant.

### 6. Operational Toggles
Change runtime behavior under load.
- **Example:** Turn off recommendation widgets during a traffic spike; switch logging to `debug` for one customer.

### 7. Scheduled Launches
Turn a feature on at an exact time without someone deploying at midnight.
- **Example:** Sale banner goes live at 00:00 IST.

### 8. Types of Flags
| Type | Lifespan | Example |
|------|----------|---------|
| **Release** | Days–weeks, then removed | `new-checkout` |
| **Experiment** | Weeks | `pricing-page-variant` |
| **Ops / Kill switch** | Long-lived | `disable-ai-summary` |
| **Permission / Entitlement** | Long-lived | `feature-sso-for-enterprise` |
