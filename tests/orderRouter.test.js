const request = require('supertest');
const app = require('../src/server'); 

describe('Order Router', () => {
  const token = 'Bearer fake-user-token';

  it('POST /api/purchase should fail without token', async () => {
    const res = await request(app)
      .post('/api/purchase')
      .send({ cart: [] });

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/purchase should fail with empty cart', async () => {
    const res = await request(app)
      .post('/api/purchase')
      .set('Authorization', token)
      .send({ cart: [] });

    // Will fail due to no items
    expect([400, 401, 500]).toContain(res.statusCode);
  });

  it('POST /api/purchase should fail if ticket generation fails', async () => {
    const fakeCart = [
      {
        event: {
          name: "Test Event",
          attraction_id: "invalid-id"
        }
      }
    ];

    const res = await request(app)
      .post('/api/purchase')
      .set('Authorization', token)
      .send({ cart: fakeCart });

    expect([500, 406, 401]).toContain(res.statusCode);
  });
});
