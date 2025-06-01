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
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

app.use('/users', isAuthenticated, usersRouter);
app.use('/auth', authRouter);

// TODO: remove test after implementing real homepage and dashboard
app.get('/', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.send('Welcome to SHDWSPR. You are logged in.');
  } else {
    res.send('Welcome to SHDWSPR. Please log in.');
  }
});

module.exports = app;
