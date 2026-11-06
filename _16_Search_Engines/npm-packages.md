# NPM Packages - Search Engines 🔍

### 1. Recommended Package: `algoliasearch`
The easiest way to implement fast, hosted search.

- **NPM Link:** [https://www.npmjs.com/package/algoliasearch](https://www.npmjs.com/package/algoliasearch)
- **Install Command:** `npm install algoliasearch`

#### Code Example (Express + MongoDB)
```javascript
const algoliasearch = require('algoliasearch');
const Product = require('../models/Product');
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const index = client.initIndex('products');

// Mongoose middleware to sync with Algolia
productSchema.post('save', async function(doc) {
  await index.saveObject({
    objectID: doc._id,
    name: doc.name,
    category: doc.category,
    price: doc.price
  });
});

async function search(req, res) {
  const { query } = req.query;
  const { hits } = await index.search(query);
  res.json(hits);
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `@elastic/elasticsearch` | [Link](https://www.npmjs.com/package/@elastic/elasticsearch) | Official client for self-hosted or managed Elastic. |
| `meilisearch` | [Link](https://www.npmjs.com/package/meilisearch) | Open-source, developer-focused search engine. |
| `flexsearch` | [Link](https://www.npmjs.com/package/flexsearch) | Lightweight in-memory full-text search. |
| `typesense` | [Link](https://www.npmjs.com/package/typesense) | Open-source alternative to Algolia. |
