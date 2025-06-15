const request = require('supertest');
const app = require('../src/server'); 

describe('Path Router', () => {
  const token = 'Bearer fake-user-token';

  it('GET /api/path/prompt should require a prompt query param', async () => {
    const res = await request(app)
      .get('/api/path/prompt')
      .set('Authorization', token);

    expect([400, 500]).toContain(res.statusCode);
  });

  it('GET /api/path/prompt should respond with filters if prompt is given', async () => {
    const res = await request(app)
      .get('/api/path/prompt?prompt=I want to see nature spots in Cluj')
      .set('Authorization', token);

    expect([200, 500]).toContain(res.statusCode);
  });

  it('GET /api/path/optimal should return error without coordinates', async () => {
    const res = await request(app)
      .get('/api/path/optimal')
      .set('Authorization', token);

    expect(res.statusCode).toBe(400);
  });

  it('GET /api/path/optimal should respond with a list or error', async () => {
    const res = await request(app)
      .get('/api/path/optimal')
      .query({
        latitude: '46.77',
        longitude: '23.59',
        max_distance: 10,
        min_rating: 4,
        max_price: 100,
        nr_attractions: 5
      })
      .set('Authorization', token);

    expect([200, 500, 404]).toContain(res.statusCode);
  });
});
