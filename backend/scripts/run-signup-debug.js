require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../src/app');

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  try {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Debug', email: 'debug-run@example.com', password: 'SecurePass123' });
    console.log('status', res.status);
    console.log('body', res.body);
    console.log('headers', res.headers);
  } catch (err) {
    console.error('err', err);
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  }
})();
