const express = require('express');
const isAuthenticated = require('../../middleware/isAuthenticated');
const requireSystemRole = require('../../middleware/requireSystemRole');

module.exports = (prisma) => {
  const router = express.Router();
  const requireAdmin = requireSystemRole(1);
  const requireSuperAdmin = requireSystemRole(2);

  // PATCH /api/admin/users/:id/system-role
  router.patch(
    '/users/:id/system-role',
    isAuthenticated,
    requireSuperAdmin,
    express.json(),
    async (req, res) => {
      const userId = parseInt(req.params.id, 10);
      const { systemRole } = req.body;

      if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(systemRole)) {
        return res.status(400).json({ error: 'Invalid systemRole value' });
      }

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { systemRole },
        });

        res.json({ success: true, id: updatedUser.id, systemRole: updatedUser.systemRole });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update system role' });
      }
    }
  );

  // GET /api/admin/users/:id - return full user object with all related data
  router.get('/:id', isAuthenticated, requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  return router;
};
