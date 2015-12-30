var http = require('http');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var NestStrategy = require('passport-nest').Strategy;
var session = require('express-session');
var EventSource = require('eventsource');
var openurl = require('openurl');
var Firebase = require('firebase');
var Immutable = require('immutable');
var speakeasy = require('speakeasy');
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var users = Immutable.Map();

function createUser(phone_number, code, socket) {
  if(users.get(phone_number)){
    message = users.get([phone_number,'verified']) ? 'You have already verified ' + number + '!' :
             'You have already requested a verification code for that number!';
    socket.emit('update', {message: message });
  } else {
    users = users.set(phone_number, Immutable.fromJS({code: code, verified: false}));
    client.sendSms({
      to: phone_number,
      from: process.env.TWILIO_NUMBER,
      body: 'Your verification code is: ' + code
    }, function(twilioerr, responseData) {
      if (twilioerr) {
        users.delete(phone_number);
        socket.emit('update', {message: "Invalid phone number!"});
      } else {
        socket.emit('code_generated');
      }
    });
  }
}

// Change for production apps.
// This secret is used to sign session ID cookies.
var SUPER_SECRET_KEY = 'keyboard-cat';

var NEST_API_URL = 'https://developer-api.nest.com';

var passportOptions = {
  failureRedirect: '/auth/failure'
};

passport.use(new NestStrategy({
  clientID: process.env.NEST_ID,
  clientSecret: process.env.NEST_SECRET
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/**
 * Start REST Streaming device events given a Nest token.
 */
function startStreaming(token) {
  var source = new EventSource(NEST_API_URL + '?auth=' + token);

  source.addEventListener('put', function(e) {
    console.log('\n' + e.data);
  });

  source.addEventListener('open', function(e) {
    console.log('Connection opened!');
  });

  source.addEventListener('auth_revoked', function(e) {
    console.log('Authentication token was revoked.');
    // Re-authenticate your user here.
  });

  source.addEventListener('error', function(e) {
    if (e.readyState == EventSource.CLOSED) {
      console.error('Connection was closed! ', e);
    } else {
      console.error('An unknown error occurred: ', e);
    }
  }, false);
}

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: SUPER_SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/auth/nest', passport.authenticate('nest', passportOptions));

app.get('/auth/nest/callback', passport.authenticate('nest', passportOptions),
  function(req, res) {
    var token = req.user.accessToken;
    res.redirect('/');
  });

app.get('/auth/failure', function(req, res) {
  res.send('Authentication failed. Please try again.');
});


app.post('/phone_number', function(req, res) {
  console.log(req);
  res.sendStatus(200);
});

var port = process.env.PORT || 3000;
app.set('port', port);

var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
  socket.on('register', function(data) {
    var code = speakeasy.totp({key: 'abc123'});
    createUser(data.phone_number, code, socket);
  });

  socket.on('verify', function(data) {
    var phone_number = data.phone_number;
    if(users.getIn([phone_number, 'code']) === data.verification_code){
      users = users.setIn([phone_number, 'verified'], true);
      socket.emit('verification_successful');
    } else {
      socket.emit('update', { messsage: 'Invalid verification code!' });
    }
  });
});

server.listen(port);

console.log('Please click Accept in the browser window that just opened.');
