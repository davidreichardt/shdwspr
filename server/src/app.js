const express = require('express');
const session = require('express-session');
const passport = require('passport');
const setupPassport = require('./config/passport');
const isAuthenticated = require('./middleware/isAuthenticated');

const app = express();

// middleware to parse JSON
app.use(express.json());

// session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: 'lax' }, //change to true when https
  })
);

// configure passport strategy
setupPassport();

// initialize passport and sessions
app.use(passport.initialize());
app.use(passport.session());

// import and mount routes
const usersRouter = require('./api/users');
const authRouter = require('./api/auth');
const dashboardRouter = require('./api/dashboard');

app.use('/api/users', isAuthenticated, usersRouter);
app.use('/api//auth', authRouter);
app.use('/api/dashboard', isAuthenticated, dashboardRouter);

app.get('/', (req, res) => {
  console.log('User authenticated:', req.isAuthenticated && req.isAuthenticated());
  res.send(
    req.isAuthenticated && req.isAuthenticated()
      ? 'Welcome to SHDWSPR. You are logged in.'
      : 'Welcome to SHDWSPR. Please log in.'
  );
});

module.exports = app;
