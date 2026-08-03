// backend/tests/auth.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');

jest.setTimeout(30000);

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
});

describe('POST /api/auth/signup', () => {
  it('should create a user and return tokens', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Amit Sharma',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('amit@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject weak passwords', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Amit',
      email: 'amit@example.com',
      password: 'weak',
    });
    expect(res.status).toBe(400);
  });

  it('should reject duplicate emails', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Amit',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });

    const res = await request(app).post('/api/auth/signup').send({
      name: 'Amit2',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Amit',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });
  });

  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'amit@example.com',
      password: 'SecurePass123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'amit@example.com',
      password: 'WrongPass123',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:userId', () => {
  let token;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Amit',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });
    token = signupRes.body.data.accessToken;
  });

  it('should return 400 for invalid user ID format', async () => {
    const res = await request(app)
      .get('/api/users/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid user ID format/i);
  });

  it('should return 404 for non-existent user', async () => {
    const fakeUserId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/users/${fakeUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/User not found/i);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should rotate refresh token', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Amit',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });

    const cookie = signupRes.headers['set-cookie'];
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    // new cookie should be set
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject reused refresh token after rotation', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Amit',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });

    const oldCookie = signupRes.headers['set-cookie'];

    // first refresh — rotates token
    await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);

    // second refresh with same old cookie — should fail
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', oldCookie);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should clear cookie and revoke token', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Amit',
      email: 'amit@example.com',
      password: 'SecurePass123',
    });

    const accessToken = signupRes.body.data.accessToken;
    const cookie = signupRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);

    // token should be unusable now
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);
    expect(refreshRes.status).toBe(401);
  });
});