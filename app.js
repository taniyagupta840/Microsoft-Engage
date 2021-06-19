var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var helloworldRouter = require('./routes/helloworld');
var usersRouter = require('./routes/users');
var acstokenRouter = require('./routes/acs-token');
var generateuuidRouter = require('./routes/generate-uuid');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// app.get('*', (req, res) => {
//     res.render(path.join(__dirname+'/client/build/index.html'));
// });

app.use('/helloworld', helloworldRouter);
app.use('/users', usersRouter);
app.use('/acs-token', acstokenRouter);
app.use('/generate-uuid', generateuuidRouter);

module.exports = app;
