const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const { getAvatarUrl } = require('../utils/discord');

module.exports = (prisma) => {
  const router = express.Router();

  // GET /dashboard/me - return logged in user profile
  router.get('/me', isAuthenticated, (req, res) => {
    const user = req.user;

    // if no user in session return 404
    if (!user) {
      return res.status(404).json({ error: 'User not found in session' });
    }

    // generate users avatar url
    const avatarUrl = getAvatarUrl(user);

    // respond with user data, avatar url, and created at time to ISO string
    res.json({
      ...user,
      avatarUrl,
      createdAt: user.createdAt?.toISOString?.() ?? null,
    });
  });

  // GET /dashboard/users - return list of all users
  router.get('/users', isAuthenticated, async (req, res) => {
    try {
      // fetch all users from db
      const users = await prisma.user.findMany();
      // respond with list of users in json
      res.json(users);
    } catch (error) {
      // on error respond with 500
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  return router;
};