var dataRef;
var thermostat_names;


function registerDataRef(){
  dataRef.on('value', function (snapshot) {
    var data = snapshot.val();
    //TODO: Save thermostat names to the user somehow?
    thermostat_names = _.map(data.devices.thermostats, function(thermostat){return thermostat.name});
  });
}


module.exports = {
  callback: function(req, res) {
    var token = req.user.accessToken;
    if(token){
      dataRef = new Firebase('wss://developer-api.nest.com');
      dataRef.authWithCustomToken(token, function() {});
      registerDataRef();
    }

    res.redirect('/');
  },
  failure: function(req, res) {
    res.send('Authentication failed. Please try again.');
  }
};