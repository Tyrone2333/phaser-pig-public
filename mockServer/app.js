var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || '*')
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With,token")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("Access-Control-Allow-Credentials", true) //可以带cookies
    if (req.method === 'OPTIONS') {
        res.send(200)
    } else {
        next()
    }
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
