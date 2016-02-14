var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo/es5')(session);

/**
 * Configure dev environment, otherwise we will use heroku vars
 */
if(process.env.TEXTOSTAT_DEV_MODE) {
  var dotenv= require('dotenv');
  dotenv.load({ path: '.env' });
}

/**
 * Controllers
 */

var nestController = require('./controllers/nest');
var smsController = require('./controllers/sms');
var userController = require('./controllers/user');

/**
 * Passport Configuration
 */
var passportConfiguration = require('./passportConfig.js');

var app = express();

/**
 * Mongo
 */

mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

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
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.get('/auth/nest', passport.authenticate('nest', passportOptions));
app.get('/auth/nest/callback', passport.authenticate('nest', passportOptions), nestController.callback);
app.get('/auth/failure', nestController.failure);

app.get('/', passportConfiguration.isAuthenticated);
app.post('/sms', smsController.smsHandler);
app.post('/register', passportConfiguration.isAuthenticated, userController.handleRegister);
app.post('/verify', passportConfiguration.isAuthenticated, userController.handleVerify);

app.use(express.static(path.join(__dirname, '../public')));
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log('Textostat running.');
});

module.exports = app;

