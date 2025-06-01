// middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  // if user is authenticated proceed to next route handler
  if (req.isAuthenticated()) return next();
  //if not authenticated respond with
  res.status(401).json({ message: 'Unauthorized' });
}

module.exports = isAuthenticated;