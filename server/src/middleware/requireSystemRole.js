const roleLevels = {
  USER: 0,
  ADMIN: 1,
  SUPERADMIN: 2,
};

const requireSystemRole = (minLevel) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user?.systemRole;
    const userLevel = roleLevels[userRole];

    if (userLevel === undefined || userLevel < minLevel) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return next();
  };
};

module.exports = requireSystemRole;