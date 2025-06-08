const express = require('express');

module.exports = (prisma) => {
  const router = express.Router();
  const requireAdmin = require('../../../middleware/requireSystemRole')(1);

  // mount all routes under api/admin that require ADMIN or higher
  router.use(requireAdmin);

  router.use('/users', require('./users')(prisma));
  router.use('/applications', require('./applications')(prisma));

  return router;
};
