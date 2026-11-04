# How Secrets & Config Management Works 🔑

### 1. Config vs. Secrets
| | **Config** | **Secret** |
|--|-----------|-----------|
| Examples | Port, log level, feature toggles, API base URLs | API keys, DB passwords, JWT signing keys, webhook secrets |
| If leaked | Harmless | Account takeover, data breach, money lost |
| Storage | Env vars, config files in Git | Secret manager; never in Git |

### 2. The Twelve-Factor Rule
Store config in the **environment**, not in code. The same build artifact (Docker image) runs in every environment; only env vars differ.

### 3. How a Secret Manager Works
1. Secrets are stored **encrypted at rest** with a master key held in a KMS/HSM.
2. Your app authenticates using its **identity**, not another secret:
   - AWS: the IAM role of the EC2/ECS/Lambda.
   - Kubernetes: the pod's service account.
   - Vault: AppRole, Kubernetes auth, or cloud IAM auth.
3. A policy decides which identity can read which secret.
4. App fetches the secret over TLS at startup (and caches it in memory).
5. Every access is written to an **audit log**.

This solves the "secret zero" problem: there's no bootstrap password to leak, because cloud identity is provided by the platform.

### 4. Ways to Deliver Secrets to the App
| Method | How | Trade-off |
|--------|-----|-----------|
| **Env vars injected at deploy** | CI/CD or platform reads secret manager → sets env vars | Simple; rotation needs a restart |
| **Fetch at startup via SDK** | App calls the secret manager on boot | Needs SDK + network at startup |
| **Fetch with TTL cache** | Re-fetch every N minutes or on auth failure | Supports rotation without restart |
| **Sidecar / mounted file** | Vault Agent, CSI driver writes secrets to a file | No SDK in app; watch file for changes |

### 5. Rotation Flow (Two-Key Overlap)
1. Create **new** key while the old one still works.
2. Update the secret manager with the new key.
3. Apps pick it up (restart or cache refresh).
4. Once all apps use the new key, **revoke** the old one.

Many providers (Stripe, AWS, GitHub) support two active keys at once for this reason.

### 6. Dynamic Secrets (Vault)
Instead of one long-lived DB password:
1. App asks Vault for DB credentials.
2. Vault creates a new DB user with a 1-hour lease.
3. When the lease expires, Vault deletes the user.
A leaked credential is useless an hour later.

### 7. How Secrets Usually Leak
- Committed `.env` or hardcoded key in Git (even if deleted later — it's in history).
- Logged by accident (`console.log(process.env)`, error objects that include request headers).
- Sent to the frontend bundle (`NEXT_PUBLIC_`, `VITE_` prefixes expose values to browsers).
- Shared in Slack / tickets / screenshots.
- Docker image layers (`COPY .env`), or `ENV` lines in a Dockerfile.

### 8. If a Secret Leaks
1. **Revoke/rotate immediately** — deleting the commit is not enough; bots scan GitHub within minutes.
2. Check provider logs for misuse during the exposure window.
3. Remove it from Git history (`git filter-repo`) only after rotating.
4. Add a scanner so it can't happen again.
