const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');

module.exports = (prisma) => {
  const router = express.Router();

  // GET /api/ships - list all ships
  router.get('/', isAuthenticated, async (req, res) => {
    try {
      const ships = await prisma.ship.findMany({
        select: {
          id: true,
          name: true,
          manufacturer: true,
          size: true,
          scu: true,
          roles: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      // flatten roles
      const formatShips = ships.map((ship) => ({
        id: ship.id,
        name: ship.name,
        manufacturer: ship.manufacturer,
        size: ship.size,
        scu: ship.scu,
        roles: ship.roles.map((r) => r.role.name),
      }));

      res.json(formatShips);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch ships' });
    }
  });

  // GET /api/shipRoles -list all ship roles
  router.get('/roles', isAuthenticated, async (req, res) => {
    try {
      const roles = await prisma.shipRole.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json(roles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch ship roles' });
    }
  });

  return router;
};
