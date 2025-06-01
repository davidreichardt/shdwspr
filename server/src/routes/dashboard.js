const express = require('express');
const isAuthenicated = require('../middleware/isAuthenticated');
const { getAvatarUrl } = require('../utils/discord');

const router = express.Router();

// GET /dashboard/me - return logged in user profile
router.get('/me', isAuthenicated, (req, res) => {
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

module.exports = router;