const express = require('express');
const app = express();

const usersRouter = require('./routes/users');

app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

module.exports = app;