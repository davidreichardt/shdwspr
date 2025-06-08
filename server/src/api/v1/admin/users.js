const express = require('express');
const isAuthenticated = require('../../../middleware/isAuthenticated');
const requireSystemRole = require('../../../middleware/requireSystemRole');

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

      if (Number.isNaN(userId) || userId < 1) {
        res.status(400).json({ error: 'Invalid user ID' });
      }

      const allowedRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
      if (
        typeof systemRole !== 'string' ||
        !allowedRoles.includes(systemRole)
      ) {
        return res.status(400).json({ error: 'Invalid systemRole value' });
      }

      if (userId === req.user.id) {
        res.status(403).json({ error: 'Cannot change your own system role' });
      }

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { systemRole },
        });

        res.json({
          success: true,
          id: updatedUser.id,
          systemRole: updatedUser.systemRole,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update system role' });
      }
    }
  );

  // GET /api/admin/users/:id - return full user object with all related data
  router.get('/:id', isAuthenticated, requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    if (Number.isNaN(userId) || userId < 1) {
      res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            select: { role: true },
          },
          divisions: {
            select: { division: true },
          },
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
          submittedApplications: {
            orderBy: { submittedAt: 'desc' },
          },
          reviewedApplications: {
            orderBy: { reviewedAt: 'desc' },
          },
        },
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
