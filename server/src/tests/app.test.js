// server/src/tests/app.test.js
const express = require('express');
const request = require('supertest');
const baseApp = require('../app');

describe('GET /', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should respond with logged-in message if authenticated', async () => {
    const app = express();

    // Mock isAuthenticated before mounting routes
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      next();
    });

    // Mount the original app routes
    app.use(baseApp);

    const res = await request(app).get('/');
    expect(res.text).toBe('Welcome to SHDWSPR. You are logged in.');
    expect(consoleSpy).toHaveBeenCalledWith('User authenticated:', true);
  });

  it('should respond with logged-out message if not authenticated', async () => {
    const res = await request(baseApp).get('/');
    expect(res.text).toBe('Welcome to SHDWSPR. Please log in.');
    expect(consoleSpy).toHaveBeenCalledWith('User authenticated:', false);
  });
});