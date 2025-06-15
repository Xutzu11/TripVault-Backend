const request = require('supertest');
const app = require('../src/server'); 
const path = require('path');

describe('Attraction Router', () => {
  const token = 'Bearer fake-admin-token';

  it('GET /api/states should return list of states', async () => {
    const res = await request(app)
      .get('/api/states')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/cities?state=Cluj should return cities in Cluj', async () => {
    const res = await request(app)
      .get('/api/cities?state=Cluj')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/attractions should return list of attractions', async () => {
    const res = await request(app)
      .get('/api/attractions')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/attraction/add should upload and add a new attraction', async () => {
    const res = await request(app)
      .post('/api/attraction/add')
      .set('Authorization', token)
      .attach('photo', path.join(__dirname, 'mock_image.png'))
      .field('name', 'Test Attraction')
      .field('theme', 'Nature')
      .field('revenue', 100000)
      .field('rating', 4.5)
      .field('city_id', 1)
      .field('latitude', 46.77)
      .field('longitude', 23.59);

    expect([200, 201]).toContain(res.statusCode);
  });

  it('POST /api/attraction/add should fail without authorization', async () => {
    const res = await request(app)
      .post('/api/attraction/add')
      .field('name', 'Test Attraction');

    expect(res.statusCode).toBe(401);
  });
});
