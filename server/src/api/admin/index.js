const express = require('express');
const requireSystemRole = require('../../middleware/requireSystemRole');

module.exports = (prisma) => {
  const router = express.Router();

  // mount all routes under api/admin that require ADMIN or higher
  router.use(requireSystemRole(1));

  router.use('/users', require('./users')(prisma));
  router.use('/applications', require('./applications')(prisma));
  router.use('/ships', require('./ships')(prisma));
  router.use('/roles', require('./roles')(prisma));
  router.use('/divisions', require('./divisions')(prisma));

  return router;
}