# NPM Packages - Testing Third-Party Services 🧪

### 1. Recommended Packages: `jest` & `nock`
Jest for the testing framework, Nock for intercepting external HTTP calls.

- **NPM Links:** [jest](https://www.npmjs.com/package/jest), [nock](https://www.npmjs.com/package/nock)
- **Install Command:** `npm install --save-dev jest nock supertest`

#### Code Example (Express + MongoDB)
```javascript
const nock = require('nock');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Payment Integration', () => {
  it('should process payment and update MongoDB', async () => {
    // 1. Mock external Stripe call
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(200, { id: 'ch_123', status: 'succeeded' });

    // 2. Call our Express API
    const res = await request(app)
      .post('/pay')
      .send({ amount: 1000, userId: 'user_1' });

    expect(res.status).toBe(200);

    // 3. Verify MongoDB update
    const user = await User.findById('user_1');
    expect(user.hasPaid).toBe(true);
  });
});
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `mocha` | [Link](https://www.npmjs.com/package/mocha) | Flexible test framework (needs Chai for assertions). |
| `sinon` | [Link](https://www.npmjs.com/package/sinon) | Powerful spies, stubs, and mocks for Node.js. |
| `msw` | [Link](https://www.npmjs.com/package/msw) | Mock Service Worker - great for mocking at the network level. |
| `supertest` | [Link](https://www.npmjs.com/package/supertest) | Specifically for testing HTTP servers like Express. |
| `chai` | [Link](https://www.npmjs.com/package/chai) | BDD/TDD assertion library. |
| `testcontainers` | [Link](https://www.npmjs.com/package/testcontainers) | Spin up real Redis/MongoDB/etc. in Docker for tests. |
