# NPM Packages - AI & External APIs 🤖

### 1. Recommended Package: `openai`
The official SDK for GPT-4, DALL-E, and more.

- **NPM Link:** [https://www.npmjs.com/package/openai](https://www.npmjs.com/package/openai)
- **Install Command:** `npm install openai`

#### Code Example (Express + MongoDB)
```javascript
const OpenAI = require('openai');
const AICache = require('../models/AICache'); // MongoDB model for caching
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getResponse(req, res) {
  const { prompt } = req.body;

  // 1. Check MongoDB Cache first
  const cached = await AICache.findOne({ prompt });
  if (cached) return res.json({ response: cached.response });

  // 2. Call OpenAI
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
  });

  const responseText = completion.choices[0].message.content;

  // 3. Store in MongoDB
  await AICache.create({ prompt, response: responseText });

  res.json({ response: responseText });
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `@anthropic-ai/sdk` | [Link](https://www.npmjs.com/package/@anthropic-ai/sdk) | For Claude AI models. |
| `langchain` | [Link](https://www.npmjs.com/package/langchain) | Framework for building AI apps with LLMs. |
| `@google/generative-ai` | [Link](https://www.npmjs.com/package/@google/generative-ai) | Google Gemini AI SDK. |
| `replicate` | [Link](https://www.npmjs.com/package/replicate) | Run thousands of open-source AI models. |
