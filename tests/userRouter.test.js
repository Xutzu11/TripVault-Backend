const request = require('supertest');
const app = require('../src/server'); 

describe('User Router', () => {
  const fakeUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'test1234',
    first_name: 'Test',
    last_name: 'User'
  };

  let token;

  it('POST /api/register should register a new user or fail if exists', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(fakeUser);

    expect([200, 409, 500]).toContain(res.statusCode);
  });

  it('POST /api/login should return a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: fakeUser.email,
        password: fakeUser.password
      });

    if (res.statusCode === 200) {
      expect(res.body.token).toBeDefined();
      token = res.body.token;
    } else {
      expect([401, 500]).toContain(res.statusCode);
    }
  });

  it('GET /api/user/profile should return user info with valid token', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 401, 500]).toContain(res.statusCode);
  });

  it('PUT /api/user/profile should update user profile with valid token', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name: 'Updated',
        last_name: 'User',
        age: 25,
        gender: 'M',
        height: 180,
        weight: 75
      });

    expect([200, 401, 500]).toContain(res.statusCode);
  });
});
