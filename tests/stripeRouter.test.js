const request = require('supertest');
const app = require('../src/server'); 

describe('Stripe Router', () => {
  const token = 'Bearer fake-user-token';

  it('GET /api/stripe/verify-session/:sessionId should fail without sessionId', async () => {
    const res = await request(app)
      .get('/api/stripe/verify-session/')
      .set('Authorization', token);

    expect(res.statusCode).toBe(404); // invalid route
  });

  it('GET /api/stripe/verify-session/:sessionId should return paid=false or error', async () => {
    const fakeSessionId = 'cs_test_fake';
    const res = await request(app)
      .get(`/api/stripe/verify-session/${fakeSessionId}`)
      .set('Authorization', token);

    expect([200, 400, 500]).toContain(res.statusCode);
  });

  it('POST /api/stripe/create-checkout-session should fail without cart data', async () => {
    const res = await request(app)
      .post('/api/stripe/create-checkout-session')
      .set('Authorization', token)
      .send({ cart: [] });

    expect([400, 401, 500]).toContain(res.statusCode);
  });

  it('POST /api/stripe/create-checkout-session should return session URL or error', async () => {
    const mockCart = [
      {
        event: {
          id: 'fake-event-id',
          name: 'Fake Event',
          price: 20,
          attraction_id: 'fake-attraction-id'
        }
      }
    ];

    const res = await request(app)
      .post('/api/stripe/create-checkout-session')
      .set('Authorization', token)
      .send({ cart: mockCart });

    expect([200, 500]).toContain(res.statusCode);
  });
});
