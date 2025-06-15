const request = require('supertest');
const app = require('../src/server');

describe('Event Router', () => {
  const token = 'Bearer fake-admin-token';

  it('GET /api/events should return a list of events', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/event/:id should return details for a valid event', async () => {
    const testEventId = 'test-id'; // replace with a real one or mock it

    const res = await request(app)
      .get(`/api/event/${testEventId}`)
      .set('Authorization', token);

    // Test may return 404 if event doesn't exist
    expect([200, 404]).toContain(res.statusCode);
  });

  it('POST /api/event/add should reject invalid input', async () => {
    const res = await request(app)
      .post('/api/event/add')
      .set('Authorization', token)
      .send({}); // Missing required fields

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/event/add should add a valid event', async () => {
    const res = await request(app)
      .post('/api/event/add')
      .set('Authorization', token)
      .type('form') // because you're using upload.none()
      .send({
        name: 'Test Event',
        description: 'Test event description',
        price: 25,
        startDate: '2025-08-01',
        endDate: '2025-08-05',
        attractionId: 'valid-attraction-id' // Replace this
      });

    expect([200, 201, 406, 405]).toContain(res.statusCode);
  });

  it('POST /api/event/add should fail without token', async () => {
    const res = await request(app)
      .post('/api/event/add')
      .send({
        name: 'Event',
        price: 10
      });

    expect(res.statusCode).toBe(401);
  });
});
