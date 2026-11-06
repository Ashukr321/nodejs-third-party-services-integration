# How Feature Flags Work 🚩

### 1. Building Blocks
- **Flag:** A named switch (`new-checkout`) with a type: boolean, string, number, or JSON.
- **Context:** Who/what is asking — `{ userId, email, plan, country, appVersion }`.
- **Targeting rules:** Conditions evaluated in order — "if `plan = enterprise` → on", "if `country = IN` → 20% on".
- **Variants:** The possible values (`on`/`off`, or `A`/`B`/`C`).
- **Default / fallback value:** Used when the flag service is unreachable or the flag doesn't exist.

### 2. Where Evaluation Happens
**Server-side (local evaluation)** — used by all good Node.js SDKs:
1. On startup, the SDK downloads **all flag rules** from the flag service.
2. It keeps them in memory and updates via streaming (SSE) or polling every few seconds.
3. `isEnabled('new-checkout', context)` is evaluated **in-process** — no network call, microseconds.
4. If the flag service goes down, the SDK keeps using the last known rules.

**Remote evaluation** — client sends context, server returns flag values. Used by browser/mobile SDKs so rules (and other users' data) are not exposed to clients.

### 3. Percentage Rollouts Are Sticky
A 20% rollout must give the **same user the same answer every time**, otherwise users see features flicker.

How SDKs do it:
1. Hash `flagName + userId` (e.g., MurmurHash) → a number.
2. Map it to a bucket 0–99.
3. Bucket < 20 → on.

Raising 20% → 50% keeps everyone who was already in; it only adds new users. The flag name is part of the hash so the same 20% of users aren't always the guinea pigs for every flag.

### 4. Flag Lifecycle
1. **Create** flag (off everywhere).
2. **Deploy** code with the flag check.
3. **Enable** for internal users → beta → % rollout → 100%.
4. **Clean up:** Remove the flag check from code and delete the flag.

Skipping step 4 is how codebases fill up with dead `if` branches — **flag debt**.

### 5. Build vs. Buy
| | **DIY (DB/Redis/env var)** | **Unleash / Flagsmith (open-source)** | **LaunchDarkly / Statsig (SaaS)** |
|--|---------------------------|----------------------------------------|----------------------------------|
| Cost | Free | Free self-hosted, paid cloud | Paid per seat / MAU |
| Targeting & % rollout | You build it | Yes | Yes, advanced |
| Audit log, UI | You build it | Yes | Yes |
| Experiments & stats | No | Basic | Yes |
| Best for | A few kill switches | Most teams | Large orgs, heavy experimentation |

### 6. OpenFeature
**OpenFeature** is a CNCF standard API for feature flags. Your code calls the OpenFeature API; a **provider** plugs in Unleash, LaunchDarkly, Flagsmith, etc. Switching vendors means changing one line, not every flag check.

### 7. Risks
- **Testing combinations:** 10 boolean flags = 1024 possible states. Test the main ones and remove old flags quickly.
- **Stale flags:** Old flags nobody understands. Give every flag an owner and an expiry date.
- **Security:** Flags are not authorization. Hiding a button with a flag doesn't protect the API — check permissions server-side.
- **Fallback values:** Choose the safe default (usually "old behavior") for when the flag service is unreachable.
