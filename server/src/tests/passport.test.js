process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_CLIENT_SECRET = 'test-client-secret';
process.env.DISCORD_CALLBACK_URL = 'http://localhost/callback';

const passport = require('passport');
const setupPassport = require('../config/passport');

jest.mock('../../../generated/prisma', () => {
  const mockUser = {
    id: 1,
    discordId: '123',
    username: 'TestUser',
    avatar: 'avatarhash',
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    __mockUser: mockUser,
    __mockPrisma: mockPrisma,
  };
});

const { __mockUser, __mockPrisma } = require('../../../generated/prisma');

describe('Passport Discord Strategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupPassport();
  });

  it('should create a user if one does not exist', async () => {
    __mockPrisma.user.findUnique.mockResolvedValue(null);
    __mockPrisma.user.create.mockResolvedValue(__mockUser);

    const strategy = passport._strategies.discord;

    await new Promise((resolve) => {
      strategy._verify(
        'access',
        'refresh',
        {
          id: '123',
          username: 'TestUser',
          avatar: 'avatarhash',
        },
        (err, user) => {
          expect(err).toBeNull();
          expect(user).toEqual(__mockUser);
          expect(__mockPrisma.user.create).toHaveBeenCalled();
          resolve();
        }
      );
    });
  });

  it('should return existing user if found', async () => {
    __mockPrisma.user.findUnique.mockResolvedValue(__mockUser);

    const strategy = passport._strategies.discord;

    await new Promise((resolve) => {
      strategy._verify(
        'access',
        'refresh',
        {
          id: '123',
          username: 'TestUser',
          avatar: 'avatarhash',
        },
        (err, user) => {
          expect(err).toBeNull();
          expect(user).toEqual(__mockUser);
          expect(__mockPrisma.user.create).not.toHaveBeenCalled();
          resolve();
        }
      );
    });
  });

  it('should update avatar if changed', async () => {
    const updatedUser = { ...__mockUser, avatar: 'newavatar' };
    __mockPrisma.user.findUnique.mockResolvedValue({
      ...__mockUser,
      avatar: 'oldavatar',
    });
    __mockPrisma.user.update.mockResolvedValue(updatedUser);

    const strategy = passport._strategies.discord;

    await new Promise((resolve) => {
      strategy._verify(
        'access',
        'refresh',
        {
          id: '123',
          username: 'TestUser',
          avatar: 'newavatar',
        },
        (err, user) => {
          expect(err).toBeNull();
          expect(user).toEqual(updatedUser);
          expect(__mockPrisma.user.update).toHaveBeenCalled();
          resolve();
        }
      );
    });
  });
});
