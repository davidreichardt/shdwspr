const express = require('express');
const { PrismaClient } = require('../../../generated/prisma');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', express.json(), async (req, res) => {
  const { email, username, discordId } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: { email, username, discordId }
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;