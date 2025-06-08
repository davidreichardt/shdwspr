const express = require('express');

module.exports = (prisma) => {
  const router = express.Router();

  router.use('/auth', require('./auth')(prisma));
  router.use('/users', require('./users')(prisma));
  router.use('/dashboard', require('./dashboard')(prisma));
  router.use('/applications', require('./applications')(prisma));
  router.use('/roles', require('./roles')(prisma));
  router.use('/hangar', require('./hangar')(prisma));
  router.use('/ships', require('./ships')(prisma));

  return router;
}