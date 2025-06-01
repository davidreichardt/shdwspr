const express = require('express');
const session = require('express-session');
const passport = require('passport');
const setupPassport = require('./config/passport');

const app = express();

// middleware to parse JSON
app.use(express.json());

// session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, //change to true when https
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

app.use('/users', usersRouter);
app.use('/auth', authRouter);

module.exports = app;
