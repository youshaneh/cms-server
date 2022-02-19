var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors')

var authRouter = require('./routes/auth');

var app = express();

app.use(express.json());
app.use(cookieParser());
// app.disable('x-powered-by')
app.use(cors())

app.use('/auth', authRouter);

module.exports = app;

// app.listen(3001, () => {})
