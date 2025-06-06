const express = require('express');
const isAuthenticated = require('../../middleware/isAuthenticated');
const isAdmin = require('../../middleware/isAdmin');

module.exports = (prisma) => {
  const router = express.Router();

  // GET /api/admin/users/:id - return full user object with all related data
  router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
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
