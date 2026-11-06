# How AI APIs (LLMs) Work 🤖

Modern AI is primarily driven by Large Language Models (LLMs).

### 1. Tokens
LLMs don't "read" words; they process **Tokens** (chunks of characters).
- 1,000 tokens ≈ 750 words.
- Pricing is usually per 1M tokens.

### 2. Prompts & Context
- **Prompt:** The instruction you give the AI.
- **System Message:** High-level instructions (e.g., "You are a helpful assistant").
- **Context Window:** The limit of how much text (tokens) the AI can "remember" in a single conversation.

### 3. Embeddings & Vector Databases
Converting text into a list of numbers (vectors) that represent its meaning.
- **RAG (Retrieval-Augmented Generation):** Searching your own documents (stored in a Vector DB like Pinecone) and feeding relevant parts to the AI to answer specific questions accurately.

### 4. Determinism & Temperature
- **Temperature:** Controls "creativity." `0.0` is predictable/factual; `1.0` is creative/random.

### 5. Streaming
Since AI can be slow to generate long text, APIs "stream" the response token-by-token so the user sees progress instantly.
