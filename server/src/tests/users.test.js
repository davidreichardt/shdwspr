const request = require('supertest');
const express = require('express');

// mock Prisma and getAvatarUrl
jest.mock('../../../generated/prisma', () => {
  const mockPrisma = {
    user: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    __mockPrisma: mockPrisma,
  };
});

jest.mock('../utils/discord', () => ({
  getAvatarUrl: jest.fn(() => 'https://cdn.discordapp.com/avatars/testavatar.png'),
}));

const { __mockPrisma } = require('../../../generated/prisma');
const userRoutes = require('../routes/users');

const app = express();
app.use('/users', userRoutes);

describe('User routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /users creates a new user and returns correct response', async () => {
    const mockUser = {
      id: 1,
      username: 'TestUser',
      discordId: '123',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    __mockPrisma.user.create.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/users')
      .send({ username: 'TestUser', discordId: '123' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      ...mockUser,
      avatarUrl: 'https://cdn.discordapp.com/avatars/testavatar.png',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
    expect(__mockPrisma.user.create).toHaveBeenCalledWith({
      data: { username: 'TestUser', discordId: '123' },
    });
  });

  it('POST /users returns 400 on error', async () => {
    __mockPrisma.user.create.mockRejectedValue(new Error('Create failed'));

    const res = await request(app)
      .post('/users')
      .send({ username: 'TestUser', discordId: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Create failed' });
  });
});