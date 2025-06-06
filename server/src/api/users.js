const express = require('express');
const { getAvatarUrl } = require('../utils/discord');
const isAuthenticated = require('../middleware/isAuthenticated');

module.exports = (prisma) => {
  const router = express.Router();
  const userSelect = {
    rsiHandle: true,
    discordHandle: true,
    showDiscordHandle: true,
    avatar: true,
    rank: true,
    preferredName: true,
    // fetch roles from UserRole join table
    roles: {
      select: { role: { select: { name: true } } },
    },
    // fetch divisions from UserDivision join table
    divisions: {
      select: { division: { select: { name: true } } },
    },
    // fetch ships from hangar, include specified info
    hangar: {
      select: {
        quantity: true,
        ship: {
          select: {
            name: true,
            manufacturer: true,
          },
        },
      },
    },
  };

  // format response, flatten nested objects, respect showDiscordHandle
  const formatUser = (user) => ({
    rsiHandle: user.rsiHandle,
    discordHandle: user.showDiscordHandle ? user.discordHandle : null,
    avatarUrl: getAvatarUrl(user),
    rank: user.rank,
    preferredName: user.preferredName,
    roles: user.roles.map((r) => r.role.name),
    divisions: user.divisions.map((d) => d.division.name),
    ships: user.hangar.map((h) => ({
      name: h.ship.name,
      manufacturer: h.ship.manufacturer,
      quantity: h.quantity,
    })),
  });

  // GET /api/users - public list of users
  router.get('/', async (req, res) => {
    try {
      const users = await prisma.user.findMany({ select: userSelect });

      res.json(users.map(formatUser));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // GET /api/users/:id - return public profile of specific user
  router.get('/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelect,
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(formatUser(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // PATCH /api/users/me - update preferred name
  router.patch('/me', isAuthenticated, express.json(), async (req, res) => {
    const userId = req.user.id;
    const { preferredName } = req.body;

    if (typeof preferredName !== 'string' || preferredName.trim() === '') {
      return res.status(400).json({ error: 'Invalid preferred name' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { preferredName: preferredName.trim() },
      });

      res.json({ success: true, preferredName: updatedUser.preferredName });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update preferred name' });
    }
  });

  // POST /api/users/roles - add role
  router.post('/roles', isAuthenticated, express.json(), async (req, res) => {
    const userId = req.user.id;
    const { roleId } = req.body;

    if (typeof roleId !== 'number') {
      return res.status(400).json({ error: 'Invalid roleId' });
    }

    try {
      await prisma.userRole.create({
        data: { userId, roleId },
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add role' });
    }
  });

  // DELETE /api/users/roles/:roleId
  router.delete(
    '/roles/:roleId',
    isAuthenticated,
    express.json(),
    async (req, res) => {
      const userId = req.user.id;
      const roleId = parseInt(req.params.roleId, 10);

      try {
        await prisma.userRole.delete({
          where: {
            userId_roleId: { userId, roleId },
          },
        });

        res.json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove role' });
      }
    }
  );

  // POST /api/users/hangar - add ship
  router.post('/hangar', isAuthenticated, express.json(), async (req, res) => {
    const userId = req.user.id;
    const { shipId, quantity } = req.body;

    if (
      typeof shipId !== 'number' ||
      typeof quantity !== 'number' ||
      quantity < 1
    ) {
      return res.status(400).json({ error: 'Invalid shipId or quantity' });
    }

    try {
      await prisma.hangar.create({
        data: {
          userId,
          shipId,
          quantity,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add ship' });
    }
  });

  // DELETE /api/users/hangar/:shipId
  router.delete(
    '/hangar/:shipId',
    isAuthenticated,
    express.json(),
    async (req, res) => {
      const userId = req.user.id;
      const shipId = parseInt(req.params.shipId, 10);

      try {
        await prisma.hangar.delete({
          where: { userId, shipId },
        });

        res.json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove ship' });
      }
    }
  );

  return router;
};
