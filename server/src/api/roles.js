const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');

module.exports = (prisma) => {
  const router = express.Router();

  // GET /api/roles - list all public roles user can assign to themselves
  router.get('/', isAuthenticated, async (req, res) => {
    try {
      const roles = await prisma.role.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json(roles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  });

  // POST /api/roles - add role to current user
  router.post('/', isAuthenticated, express.json(), async (req, res) => {
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

  // DELETE /api/roles/:roleId - remove role from current user
  router.delete(
    '/:roleId',
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

  return router;
};
