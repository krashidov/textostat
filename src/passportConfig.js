var passport = require('passport');
var NestStrategy = require('passport-nest').Strategy;

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


exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/nest');
};