function handleSetTemperature(content){
  //grab whatever is in the quotes and then strip it
  var thermostatName = _.first(content.match(/(["'])(\\?.)*?\1/));
  thermostatName = thermostatName.substr(1, thermostatName.length - 2);
  var temperature = _.last(content.match(/"([\s]+)to\1([\d]+)/));
  setTemperature(thermostatName, _.toInteger(temperature));
}

module.exports = function(users, token){
  return function(req, res) {
    var phone_number = req.body.From;
    var content = req.body.Body;
    var setValidMatch = /set([\s]+)(["'])(\\?.)*?\2\1to\1([\d]+)/ig;
    var viewValidMatch = /view([\s]+)thermostats/ig;


    if (content.match(setValidMatch)) {
      handleSetTemperature(content);
    }
    else if (content.match(viewValidMatch)) {
      sendMessage(phone_number, thermostat_names.join(' '), function () {});
    }
    else {
      //default
    }
    res.sendStatus(200);
  };
};