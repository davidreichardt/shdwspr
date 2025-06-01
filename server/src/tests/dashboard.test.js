const request = require('supertest');
const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');

jest.mock('../middleware/isAuthenticated');

const mockFindMany = jest.fn();

const mockPrisma = {
  user: {
    findMany: mockFindMany,
  },
};

// Import the dashboard router factory with injected prisma mock
const dashboardRouter = require('../routes/dashboard')(mockPrisma);

describe('Dashboard routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock isAuthenticated to just call next()
    isAuthenticated.mockImplementation((req, res, next) => next());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /dashboard/me', () => {
    it('should return 404 if no user in session', async () => {
      // Attach middleware that sets req.user = null BEFORE mounting router
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

      // Attach middleware that sets req.user BEFORE mounting router
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

  describe('GET /dashboard/users', () => {
    beforeEach(() => {
      // For /users tests, no req.user needed, mount router directly
      app.use('/dashboard', dashboardRouter);
    });

    it('should return all users from database', async () => {
      const mockUsers = [
        { id: '1', username: 'Alpha' },
        { id: '2', username: 'Bravo' },
      ];

      mockFindMany.mockResolvedValue(mockUsers);

      const res = await request(app).get('/dashboard/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUsers);
    });

    it('should return 500 if database fails', async () => {
      mockFindMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/dashboard/users');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch users');
    });
  });
});