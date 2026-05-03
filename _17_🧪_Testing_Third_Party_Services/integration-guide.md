# Integration Guide - Testing (Jest & Nock) 🧪

### 1. Mocking with Nock (HTTP Level)

```javascript
// npm install nock
const nock = require('nock');
const { getCoords } = require('../maps-service');

describe('Maps Service', () => {
  it('should return coordinates for a valid address', async () => {
    // Intercept the request to Google Maps
    const scope = nock('https://maps.googleapis.com')
      .get('/maps/api/geocode/json')
      .query(true) // Allow any query params
      .reply(200, {
        results: [{ geometry: { location: { lat: 37.42, lng: -122.08 } } }]
      });

    const coords = await getCoords('1600 Amphitheatre Pkwy');
    expect(coords).toEqual({ lat: 37.42, lng: -122.08 });
    
    // Ensure the mock was actually called
    expect(scope.isDone()).toBe(true);
  });
});
```

### 2. Simulating a Timeout

```javascript
it('should handle API timeouts', async () => {
  nock('https://api.stripe.com')
    .post('/v1/payment_intents')
    .delayConnection(5000) // 5 second delay
    .reply(500);

  await expect(createPayment(50)).rejects.toThrow('timeout');
});
```

### 3. Best Practices
- **Never Use Production Keys in Tests:** Always use `.env.test` or environment variables that point to test/sandbox accounts.
- **Clean Up:** Use `nock.cleanAll()` after each test to prevent mocks from leaking into other tests.
- **Test the "Bad" Path:** Don't just test success. Test 401 Unauthorized, 429 Too Many Requests, and 500 Internal Server Errors.
- **Avoid Real Network Calls in CI:** Tests that rely on the internet are "flaky" and slow down the pipeline. Use mocks/nock for 99% of your automated tests.
- **Integration Tests:** Have a small set of "Smoke Tests" that use real (test-mode) keys to ensure the provider hasn't changed their API format.
