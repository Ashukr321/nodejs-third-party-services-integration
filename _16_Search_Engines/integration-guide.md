# Integration Guide - Search (Algolia Example) 🔍

### 1. Indexing Data (Server-side)

```javascript
// npm install algoliasearch
const algoliasearch = require('algoliasearch');
const client = algoliasearch('YOUR_APP_ID', 'YOUR_ADMIN_API_KEY');
const index = client.initIndex('products');

async function syncProductToSearch(product) {
  await index.saveObject({
    objectID: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
  });
}
```

### 2. Performing a Search (Client-side Recommended)
Searching from the frontend is faster and more responsive.

```javascript
// On the Frontend
const searchClient = algoliasearch('YOUR_APP_ID', 'YOUR_SEARCH_ONLY_API_KEY');
const index = searchClient.initIndex('products');

async function handleSearch(query) {
  const { hits } = await index.search(query);
  displayResults(hits);
}
```

### 3. Best Practices
- **Search-Only Keys:** Never use your "Admin" API key on the frontend. Use a restricted "Search-Only" key.
- **Async Indexing:** Don't let your database updates wait for the search engine to sync. Use a background job (BullMQ).
- **Batching:** When uploading many records at once, use batch operations to reduce network calls.
- **Relevance over Quantity:** Show 10 highly relevant results rather than 1,000 mediocre ones.
- **Handle "No Results":** Provide helpful suggestions or "Did you mean?" prompts when a search returns nothing.
