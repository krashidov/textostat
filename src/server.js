var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var openurl = require('openurl');
var Immutable = require('immutable');
var users = Immutable.Map();
var _ = require('lodash');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo/es5')(session);

/**
 * Configure environment
 */
var dotenv= require('dotenv');
dotenv.load({ path: '.env' });

/**
 * Controllers
 */

var nestController = require('./controllers/nest');
var smsController = require('./controllers/sms');
var userController = require('./controllers/user');

/**
 * Passport Configuration
 */
var passportConfiguration = require('./passPortConfig.js');

var app = express();

/**
 * Mongo
 */

mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

var NEST_API_URL = 'https://developer-api.nest.com';

var passportOptions = {
  failureRedirect: '/auth/failure'
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '../public')));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.get('/auth/nest');
app.get('/auth/nest/callback', nestController.callback);
app.get('/auth/failure', nestController.failure);

app.post('/sms', smsController.smsHandler);
app.post('/register', userController.handleRegister);
app.post('/verify', passportConfiguration.isAuthenticated, userController.handleVerify);

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log('Please click Accept in the browser window that just opened.');
});

module.exports = app;

