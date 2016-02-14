var Firebase = require('firebase');

module.exports = {
  callback: function(req, res) {
    var token = req.user.accessToken;
    if(token){
      var dataRef = new Firebase('wss://developer-api.nest.com');
      dataRef.authWithCustomToken(token, function(error, auth) {
      });
    }

    res.redirect('/');
  },
  failure: function(req, res) {
    res.send('Authentication failed. Please try again.');
  }
};