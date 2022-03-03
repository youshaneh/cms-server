var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors')

var tokenChecker = require('./token-checker');
var db = require('./db');

var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var clientsRouter = require('./routes/clients');

var app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors())

//TODO: don't allow all origins
//TODO: protect against brute-force attack
//TODO: GitHub automatically removes personal access tokens that haven't been used in a year. 

app.use(['/users', '/clients', '/clients/*'], tokenChecker);

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use(['/clients', '/clients/*'], clientsRouter);

app.use('*', (req, res) => res.sendStatus('404'))

module.exports = app;
// app.listen(3001, () => { })
