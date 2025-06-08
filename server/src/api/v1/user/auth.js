const express = require('express');
const passport = require('passport');
const router = express.Router();

// route to start discord oauth
router.get('/discord', passport.authenticate('discord'));

// callback route discord redirects to after login attempt
// on success redirect to home ('/'), on failure redirect to '/auth/failed'
router.get(
  '/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/auth/failed',
    successRedirect: '/',
  })
);

// route for failed auth attempts
router.get('/failed', (req, res) => {
  res.status(401).send({ message: 'Authentication failed' });
});

// LOGOUT ROUTE
// handles logging out by terminating session
router.get('/logout', (req, res, next) => {
  // passport's logout method takes callback for error handling
  req.logout((error) => {
    if (error) return next(error);
    // destroy the session data on server
    req.session.destroy(() => {
      // clear session cookie in browser
      res.clearCookie('connect.sid');
      // redirect to homepage or login page after logout
      res.redirect('/');
    });
  });
});

module.exports = router;
