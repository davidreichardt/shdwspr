// server/src/tests/app.test.js
const express = require('express');
const request = require('supertest');
const baseApp = require('../app');

describe('GET /', () => {
  let consoleSpy;
  let app;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    app = express();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should respond with logged-in message if authenticated', async () => {
    // Middleware to mock authenticated user for all requests
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      next();
    });

    // Mount the real app routes inside this test app
    app.use(baseApp);

    const res = await request(app).get('/');

    expect(res.text).toBe('Welcome to SHDWSPR. You are logged in.');
    expect(consoleSpy).toHaveBeenCalledWith('User authenticated:', true);
  });

  it('should respond with logged-out message if not authenticated', async () => {
    // Middleware to mock unauthenticated user for all requests
    app.use((req, res, next) => {
      req.isAuthenticated = () => false;
      next();
    });

    app.use(baseApp);

    const res = await request(app).get('/');

    expect(res.text).toBe('Welcome to SHDWSPR. Please log in.');
    expect(consoleSpy).toHaveBeenCalledWith('User authenticated:', false);
  });
});