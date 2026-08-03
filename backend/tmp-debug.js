require('dotenv').config();
const request = require('supertest');
const { createApp } = require('./src/app');

const app = createApp();

request(app)
  .post('/api/auth/signup')
  .send({ name: 'Amit Sharma', email: 'amit@example.com', password: 'SecurePass123' })
  .then((res) => {
    console.log('STATUS', res.status);
    console.log('BODY', JSON.stringify(res.body, null, 2));
    console.log('SET_COOKIE', res.headers['set-cookie']);
  })
  .catch((err) => {
    console.error('ERROR', err);
  });
