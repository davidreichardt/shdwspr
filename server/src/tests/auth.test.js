const request = require('supertest');
const express = require('express');
const session = require('express-session');
const authRouter = require('../routes/auth');

describe('Auth routes', () => {
  let app;

  beforeEach(() => {
    app = express();

    // Mock middleware to support logout route
    app.use((req, res, next) => {
      req.logout = (cb) => cb && cb(); // mock logout callback
      req.session = { destroy: (cb) => cb && cb() }; // mock session destroy
      res.clearCookie = jest.fn(); // mock clearCookie
      next();
    });

    app.use('/auth', authRouter);
  });

  it('GET /auth/failed returns 401 with message', async () => {
    const res = await request(app).get('/auth/failed');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Authentication failed' });
  });

  it('GET /auth/logout clears session and redirects', async () => {
    const res = await request(app).get('/auth/logout');
    expect(res.status).toBe(302); // 302 = redirect
    expect(res.headers.location).toBe('/');
  });
});