var http = require('http');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var NestStrategy = require('passport-nest').Strategy;
var session = require('express-session');
var openurl = require('openurl');
var Firebase = require('firebase');
var Immutable = require('immutable');
var speakeasy = require('speakeasy');
var users = Immutable.Map();
var _ = require('lodash');
var mongoose = require('mongoose');

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

function createUser(phone_number, code, socket) {
  if(users.get(phone_number)){
    message = users.get([phone_number,'verified']) ? 'You have already verified ' + number + '!' :
             'You have already requested a verification code for that number!';
    socket.emit('update', {message: message });
  } else {
    users = users.set(phone_number, Immutable.fromJS({code: code, verified: false}));
    sendMessage(phone_number, 'Your verification code is: ' + code,
      );
  }
}

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


app.get('/auth/nest', passport.authenticate('nest', passportOptions));
app.get('/auth/nest/callback', passport.authenticate('nest', passportOptions), nestController.callback);
app.get('/auth/failure', nestController.failure);

app.post('/sms', smsController.smsHandler);
app.post('/register', userController.handleRegister);
app.post('/verify', userController.handleVerify);

var port = process.env.PORT || 3000;
app.set('port', port);
var server = http.createServer(app);
server.listen(port);

console.log('Please click Accept in the browser window that just opened.');
