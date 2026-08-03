const request = require('supertest');
const { createApp } = require('./src/app');

(async () => {
  try {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Amit', email: 'amit@example.com', password: 'SecurePass123' });
    console.log('status', res.status);
    console.log('set-cookie', res.headers['set-cookie']);
    console.log('body', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
