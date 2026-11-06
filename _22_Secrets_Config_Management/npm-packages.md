# NPM Packages - Secrets & Config Management 🔑

### 1. Recommended Package: `zod` (config validation)
Validates and types `process.env` at startup so a missing or malformed value crashes immediately with a clear message.

- **NPM Link:** [zod](https://www.npmjs.com/package/zod)
- **Install Command:** `npm install zod`

#### Code Example (Express + MongoDB)
```javascript
const { z } = require('zod');
const mongoose = require('mongoose');
const express = require('express');

const config = z.object({
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().url(),
  SENDGRID_API_KEY: z.string().startsWith('SG.'),
}).parse(process.env); // throws with a list of every invalid key

await mongoose.connect(config.MONGO_URI);
express().listen(config.PORT);
```

### 2. Recommended Package: `@aws-sdk/client-secrets-manager`
Read secrets from AWS Secrets Manager using the IAM role of your compute — no static keys.

- **NPM Link:** [@aws-sdk/client-secrets-manager](https://www.npmjs.com/package/@aws-sdk/client-secrets-manager)
- **Install Command:** `npm install @aws-sdk/client-secrets-manager`

```javascript
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const client = new SecretsManagerClient({ region: 'ap-south-1' });
const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: 'prod/api' }));
const { MONGO_URI, STRIPE_SECRET_KEY } = JSON.parse(SecretString);
```

### 3. Recommended Package: `dotenv` (local only)
Loads `.env` into `process.env`. Not needed on Node.js 20.6+ (`node --env-file=.env`).

- **NPM Link:** [dotenv](https://www.npmjs.com/package/dotenv)
- **Install Command:** `npm install dotenv`

```javascript
require('dotenv').config(); // first line of your entry file
```

### 4. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `@aws-sdk/client-ssm` | [Link](https://www.npmjs.com/package/@aws-sdk/client-ssm) | AWS SSM Parameter Store — cheaper config/secrets (`GetParameterCommand` with `WithDecryption: true`). |
| `@google-cloud/secret-manager` | [Link](https://www.npmjs.com/package/@google-cloud/secret-manager) | Google Cloud Secret Manager client. |
| `@azure/keyvault-secrets` | [Link](https://www.npmjs.com/package/@azure/keyvault-secrets) | Azure Key Vault secrets client. |
| `node-vault` | [Link](https://www.npmjs.com/package/node-vault) | HashiCorp Vault HTTP API client. |
| `@infisical/sdk` | [Link](https://www.npmjs.com/package/@infisical/sdk) | Infisical (open-source secret manager) SDK. |
| `envalid` | [Link](https://www.npmjs.com/package/envalid) | Lightweight env-var validation, alternative to zod for config only. |
| `convict` | [Link](https://www.npmjs.com/package/convict) | Schema-based config with per-environment files and docs. |
