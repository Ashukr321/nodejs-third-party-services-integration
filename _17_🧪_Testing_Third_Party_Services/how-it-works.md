# How Testing Third-Party Services Works 🧪

Different levels of isolation for external dependencies.

### 1. Mocking (Jest)
Replacing a library's functions with "fakes" that return predictable values.
- **Pros:** Fast, no network required.
- **Cons:** Doesn't test the actual network call.

### 2. Nock (HTTP Interception)
Intercepting real HTTP requests made by your app and returning a pre-defined response.
- **Pros:** Tests your actual `axios` or `fetch` calls. Very powerful for simulating timeouts or specific status codes.

### 3. Test Environments (Sandboxes)
Using a "Test Mode" provided by the service (e.g., Stripe's test API keys).
- **Pros:** Most realistic.
- **Cons:** Slower, requires network, can be flaky if the provider's test environment is down.

### 4. WireMock / Prism
Running a local server that acts as a "Mock Server" for the external API.

### 5. Dependency Injection
Designing your code so you can easily swap the "Real Service" with a "Mock Service" during testing.
