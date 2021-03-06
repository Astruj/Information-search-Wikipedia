var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const mongoose = require('mongoose')
var cors = require('cors');
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bodyParser = require('body-parser');


var app = express();
require('dotenv').config();

const sessionConfig = {
  secret: 'MYSECRET',
  name: 'appName',
  resave: false,
  saveUninitialized: false,
  cookie : {
    sameSite: 'none', // THIS is the config you are looing for.
    secure: false
  }
};
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}));
app.use(session(sessionConfig));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const API_SERVICE_URL = "https://en.wikipedia.org/"
const API_SERVICE_URL1 = "https://en.wikipedia.org/w/"

app.use('/json_placeholder', createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
      [`^/json_placeholder`]: '',
  },
  onProxyRes: function (proxyRes, req, res) {
      //console.log(proxyRes);
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      delete proxyRes.headers['x-frame-options'];
      //proxyRes.headers['Domain'] = 'http://localhost:4000';
      delete proxyRes.headers['set-cookie'];
      delete proxyRes.rawHeaders['Set-Cookie'];
      // // proxyRes.headers['set-cookie'] = proxyRes.headers[
      // //   "set-cookie"
      // // ][0].replace("Secure; ", "");
      // delete proxyRes.headers['cookie'];
      // delete proxyRes.rawHeaders['Cookie'];
      // delete proxyRes.headers['cookie2'];
      // delete proxyRes.headers['x-request-start'];
      // delete proxyRes.headers['x-request-id'];
      // delete proxyRes.headers['via'];
      // delete proxyRes.headers['connect-time'];
      // delete proxyRes.headers['total-route-time'];

    }
})

);


app.use('/w', createProxyMiddleware({
  target: API_SERVICE_URL1,
  changeOrigin: true,
  pathRewrite: {
      [`^/w`]: '',
  },
  onProxyRes: function (proxyRes, req, res) {
      //console.log("recieved");
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      //proxyRes.headers['Domain'] = 'http://localhost:4000';
      delete proxyRes.headers['set-cookie'];
      delete proxyRes.headers['Cookie'];
      delete proxyRes.headers['cookie2'];
      // delete proxyRes.headers['x-request-start'];
      // delete proxyRes.headers['x-request-id'];
      // delete proxyRes.headers['via'];
      // delete proxyRes.headers['connect-time'];
      // delete proxyRes.headers['total-route-time'];

    }
})

);

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// app.use(function(req, res, next) {
//   console.log("request", req.originalUrl);
//   const removeOnRoutes = '/not-wanted-route-part';
//   // req.originalUrl = req.originalUrl.replace(removeOnRoutes,'');
//   // req.path = req.path.replace(removeOnRoutes,'');
//   return next();
// });

//mongodb connection
const uri = process.env.ATLAS_URI;
console.log(uri)
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connected");
})
connection.on('error', (e) => console.log("error"));


// error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
