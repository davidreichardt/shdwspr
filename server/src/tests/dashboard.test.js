const request = require('supertest');
const express = require('express');
const dashboardRouter = require('../routes/dashboard');
const isAuthenticated = require('../middleware/isAuthenticated');

jest.mock('../middleware/isAuthenticated');

describe('GET /dashboard/me', () => {
  let app;

  beforeEach(() => {
    app = express();

    // Mock isAuthenticated to just call next()
    isAuthenticated.mockImplementation((req, res, next) => next());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 404 if no user in session', async () => {
    // Middleware to simulate no user in req
    app.use((req, res, next) => {
      req.user = null;
      next();
    });

    app.use('/dashboard', dashboardRouter);

    const res = await request(app).get('/dashboard/me');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found in session');
  });

  it('should return user data with avatarUrl and ISO createdAt', async () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      discordId: '456',
      avatar: 'avatarhash',
      createdAt: new Date('2025-06-01T17:24:00Z'),
    };

    // Middleware to attach mock user
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    app.use('/dashboard', dashboardRouter);

    const res = await request(app).get('/dashboard/me');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: '123',
      username: 'testuser',
      discordId: '456',
      avatar: 'avatarhash',
      avatarUrl: `https://cdn.discordapp.com/avatars/${mockUser.discordId}/${mockUser.avatar}.png`,
      createdAt: mockUser.createdAt.toISOString(),
    });
  });
});