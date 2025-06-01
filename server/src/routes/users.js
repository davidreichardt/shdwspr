const express = require('express');
const { PrismaClient } = require('../../../generated/prisma');
const { getAvatarUrl } = require('../utils/discord');

const router = express.Router();
const prisma = new PrismaClient();

// route to create a new user in db
// expect json body with username and discordId
router.post('/', express.json(), async (req, res) => {
  const { username, discordId } = req.body;

  try {
    // create a new user record in db
    const newUser = await prisma.user.create({
      data: { username, discordId },
    });

    const avatarUrl = getAvatarUrl(newUser);

    const resUser = {
      ...newUser,
      avatarUrl,
      createdAt: newUser.createdAt.toISOString(),
    };

    // respond with
    res.status(201).json(resUser);
  } catch (error) {
    // on error repsond with
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
