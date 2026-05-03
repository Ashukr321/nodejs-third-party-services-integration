# How Search Engines Work 🔍

Search engines use specialized data structures to provide near-instant results.

### 1. The Inverted Index
Instead of searching through every document for a word, an inverted index lists every word and the documents it appears in.
- **Word:** "Node.js"
- **Documents:** [Doc1, Doc5, Doc12, ...]

### 2. Tokenization & Normalization
- **Tokenization:** Breaking text into words.
- **Stemming:** Reducing words to their root (e.g., "running" -> "run").
- **Synonyms:** Mapping "cell phone" to "mobile phone."

### 3. Relevance Scoring (TF-IDF / BM25)
Algorithms that determine which results are the most relevant based on term frequency and document length.

### 4. Faceting & Filtering
Allowing users to narrow down results by categories (e.g., "Show only electronics under $500").

### 5. Ranking
Influencing results based on business logic (e.g., "Show sponsored products at the top").
