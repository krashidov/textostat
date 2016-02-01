var thermostat_names;
var Firebase = require('firebase');
var _ = require('lodash');

function registerDataRef(dataRef){
  dataRef.on('value', function (snapshot) {
    var data = snapshot.val();
    //TODO: Save thermostat names to the user somehow?
    thermostat_names = _.map(data.devices.thermostats, function(thermostat){return thermostat.name});
    var path = 'devices/thermostats/mlVc-68Bgfsuw-9CmUiFfjv7SS1cVKLE/target_temperature_f'
    dataRef.child(path).set(42);
  });
}


module.exports = {
  callback: function(req, res) {
    var token = req.user.accessToken;
    if(token){
      var dataRef = new Firebase('wss://developer-api.nest.com');
      dataRef.authWithCustomToken(token, function(error, auth) {
        debugger;
      });
      registerDataRef(dataRef);
    }

    res.redirect('/');
  },
  failure: function(req, res) {
    res.send('Authentication failed. Please try again.');
  }
};