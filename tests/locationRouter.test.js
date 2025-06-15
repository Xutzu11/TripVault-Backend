const request = require('supertest');
const app = require('../src/server'); 

describe('Location Router', () => {
  const token = 'Bearer fake-admin-token';

  it('GET /api/states should return a list of states', async () => {
    const res = await request(app)
      .get('/api/states')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/states should fail without token', async () => {
    const res = await request(app).get('/api/states');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/cities?state=Cluj should return cities in Cluj', async () => {
    const res = await request(app)
      .get('/api/cities?state=Cluj')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/cities should fail without token', async () => {
    const res = await request(app).get('/api/cities?state=Cluj');
    expect(res.statusCode).toBe(401);
  });
});
