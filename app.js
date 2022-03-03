var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors')

var tokenChecker = require('./token-checker');
var ddosGuard = require('./ddos-guard');
var db = require('./db');

var authRouter = require('./routes/auth');
var resetPasswordRouter = require('./routes/reset-password');
var usersRouter = require('./routes/users');
var clientsRouter = require('./routes/clients');

var app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors())

//TODO: don't allow all origins
//TODO: GitHub automatically removes personal access tokens that haven't been used in a year. 

app.use(ddosGuard());
app.post('/reset_password', ddosGuard(5000, 30000)); //this endpoint involves sending email, increase the interval further
app.use(['/users', '/clients', '/clients/*'], tokenChecker);

app.use('/auth', authRouter);
app.use('/reset_password', resetPasswordRouter);
app.use('/users', usersRouter);
app.use(['/clients', '/clients/*'], clientsRouter);

app.use('*', (req, res) => res.sendStatus('404'))

module.exports = app;
// app.listen(3001, () => { })
