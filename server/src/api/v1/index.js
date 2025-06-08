const express = require('express');

module.exports = (prisma) => {
  const router = express.Router();

  router.use('/user', require('./user')(prisma));
  router.use('/admin', require('./admin')(prisma));

  return router;
}