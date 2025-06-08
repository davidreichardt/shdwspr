const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');

module.exports = (prisma) => {
  const router = express.Router();

  // POST /api/applications - submit new application
  router.post('/', isAuthenticated, express.json(), async (req, res) => {
    const userId = req.user.id;
    const { type, target, notes } = req.body;

    if (!['JOIN_ORG', 'RANK_UP', 'JOIN_DIVISION'].includes(type)) {
      return res.status(400).json({ error: 'Invalid application type' });
    }

    try {
      await prisma.application.create({
        data: {
          userId,
          type,
          data: target,
          notes: notes?.trim() || '',
          status: 'PENDING',
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // GET /api/applications - get current user's aplications
  router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.user.id;

    try {
      const applications = await prisma.application.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
      });

      res.json(applications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  // PATCH /api/applications/:id/cancel - allow user to cancel pending application
  router.patch('/:id/cancel', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id, 10);

    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      });

      if (!application || application.userId !== userId) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (application.status !== 'PENDING') {
        return res
          .status(400)
          .json({ error: 'Cannot cancel processed application' });
      }

      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'CANCELLED' },
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to cancel application' });
    }
  });

  return router;
};
