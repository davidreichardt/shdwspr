const express = require('express');
const session = require('express-session');
const passport = require('passport');
const setupPassport = require('./config/passport');
const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();
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
app.use('/api/v1', require('./api/v1')(prisma));

app.get('/', (req, res) => {
  const loggedIn = req.isAuthenticated && req.isAuthenticated();
  console.log(`User authenticated: ${loggedIn}`);
  res.send(loggedIn ? 'You are logged in' : 'Please log in');
});

module.exports = app;
