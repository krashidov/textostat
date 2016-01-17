var passport = require('passport');

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
