const express = require('express');
const session = require('express-session');
const passport = require('passport');
const setupPassport = require('./config/passport');
const isAuthenticated = require('./middleware/isAuthenticated');
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
const usersRouter = require('./api/users')(prisma);
const authRouter = require('./api/auth');
const dashboardRouter = require('./api/dashboard')(prisma);
const hangarRouter = require('./api/hangar')(prisma);
const rolesRouter = require('./api/roles')(prisma);
const shipsRouter = require('./api/ships')(prisma);
const applicationsRouter = require('./api/applications')(prisma);
const adminRouter = require('./api/admin')(prisma);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/hangar', hangarRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/ships', shipsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/admin', adminRouter);


app.get('/', (req, res) => {
  const loggedIn = req.isAuthenticated && req.isAuthenticated();
  console.log(`User authenticated: ${loggedIn}`);
  res.send(loggedIn ? 'You are logged in' : 'Please log in');
});

module.exports = app;
