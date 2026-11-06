# Integration Guide - AI (OpenAI Example) 🤖

### 1. Basic Chat Completion

```javascript
// npm install openai
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getAIResponse(userMessage) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a senior Node.js mentor." },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}
```

### 2. Streaming Response (Real-time UI)

```javascript
async function streamAIResponse(userMessage, res) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: userMessage }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    res.write(content); // Send to client as it arrives
  }
  res.end();
}
```

### 3. Best Practices
- **Cost Management:** Monitor token usage. Use cheaper models (GPT-4o-mini) for simple tasks.
- **Rate Limiting:** AI APIs are slow and expensive. Don't let a single user drain your budget.
- **Prompt Engineering:** Be specific. Instead of "Fix this code," say "Fix this Node.js memory leak and explain why it happened."
- **Handle Timeouts:** AI responses can take 10+ seconds. Ensure your server and load balancer don't time out.
- **Security:** Never send sensitive PII (passwords, SSNs) to external AI providers.
- **Fallback:** If the AI is down or slow, have a pre-written fallback response or a simple heuristic-based logic.
