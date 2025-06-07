const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');

module.exports = (prisma) => {
  const router = express.Router();

  // GET /api/hangar - get user's hanagr
  router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.user.id;

    try {
      const hangar = await prisma.hangar.findMany({
        where: { userId },
        orderBy: { ship: { name: 'asc' } },
        select: {
          quantity: true,
          ship: {
            select: {
              id: true,
              name: true,
              manufacturer: true,
            },
          },
        },
      });

      const formatHangar = hangar.map((entry) => ({
        shipId: entry.ship.id,
        name: entry.ship.name,
        manufacturer: entry.ship.manufacturer,
        quantity: entry.quantity,
      }));

      res.json(formatHangar);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch hangar' });
    }
  });

  // POST /api/hangar - add ship to hangar or update quantity
  router.post('/', isAuthenticated, express.json(), async (req, res) => {
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
      await prisma.hangar.upsert({
        where: {
          userId_shipId: {
            userId,
            shipId,
          },
        },
        update: { quantity },
        create: {
          userId,
          shipId,
          quantity,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add/update ship' });
    }
  });

  // PATCH /api/hangar/:shipId - update quantity
  router.patch(
    '/:shipId',
    isAuthenticated,
    express.json(),
    async (req, res) => {
      const userId = req.user.id;
      const shipId = parseInt(req.params.shipId, 10);
      const { quantity } = req.body;

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }

      try {
        await prisma.hangar.update({
          where: {
            userId_shipId: { userId, shipId },
          },
          data: { quantity },
        });

        res.json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update ship quantity' });
      }
    }
  );

  // DELETE /api/hangar/:shipId
  router.delete('/:shipId', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const shipId = parseInt(req.params.shipId, 10);

    try {
      await prisma.hangar.delete({
        where: { userId_shipId: { userId, shipId } },
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove ship' });
    }
  });

  return router;
};
