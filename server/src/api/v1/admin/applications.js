const express = require('express');
const { sanitizeInput } = require('../../../utils/sanitizeInput');
const isAuthenticated = require('../../../middleware/isAuthenticated');
const requireSystemRole = require('../../../middleware/requireSystemRole');

module.exports = (prisma) => {
  const router = express.Router();
  const requireAdmin = requireSystemRole(1);

  // GET /api/admin/appication - get all unarchived applications
  router.get(
    '/',
    isAuthenticated,
    requireAdmin,
    async (req, res) => {
      try {
        const applications = await prisma.application.findMany({
          where: { archived: false },
          include: {
            user: {
              select: { id: true, rsiHandle: true, preferredName: true },
            },
            reviewedBy: {
              select: { id: true, rsiHandle: true, preferredName: true },
            },
          },
          orderBy: { submittedAt: 'desc' },
        });

        res.json(applications);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch applications' });
      }
    }
  );

  // PATCH - /api/admin/applications/:id - approve or reject applications
  router.patch(
    '/:id',
    isAuthenticated,
    requireAdmin,
    async (req, res) => {
      const applicationId = parseInt(req.params.id, 10);
      let { status, notes } = req.body;

      if (Number.isNaN(applicationId) || applicationId < 1) {
        return res.status(400).json({ error: 'Invalid application ID' });
      }

      if (!['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      if (typeof notes === 'string') {
        notes = sanitizeInput(notes);

        if (notes.length > 250) {
          return res
            .status(400)
            .json({ error: 'Notes too long (max 250 characters' });
        }
      } else {
        notes = null;
      }

      try {
        const application = await prisma.application.findUnique({
          where: { id: applicationId },
          include: { user: true },
        });

        if (!application) {
          return res.status(404).json({ error: 'Application not found' });
        }

        const updates = [];

        updates.push(
          prisma.application.update({
            where: { id: applicationId },
            data: {
              status,
              notes,
              reviewedAt: new Date(),
              reviewedById: req.user.id,
              archived: true, //set archived to true
            },
          })
        );

        if (status === 'ACCEPTED') {
          const userId = application.userId;
          const type = application.type;

          if (type === 'JOIN_ORG') {
            updates.push(
              prisma.user.update({
                where: { id: userId },
                data: { isMember: true },
              })
            );
          }

          if (type === 'RANK_UP' && application.data?.targetRank) {
            updates.push(
              prisma.user.update({
                where: { id: userId },
                data: { rank: application.data.targetRank },
              })
            );
          }

          if (type === 'JOIN_DIVISION' && application.data?.divisionId) {
            const existing = await prisma.userDivision.findUnique({
              where: {
                userId_divisionId: {
                  userId,
                  divisionId: application.data.divisionId,
                },
              },
            });

            if (!existing) {
              updates.push(
                prisma.userDivision.create({
                  data: {
                    userId,
                    divisionId: application.data.divisionId,
                  },
                })
              );
            }
          }
        }

        const result = await prisma.$transaction(updates);
        res.json(result[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update application' });
      }
    }
  );

  return router;
};
