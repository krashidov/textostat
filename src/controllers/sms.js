var sendMessage = require('../utils/twilio').sendMessage;
var Firebase = require('firebase');
var _ = require('lodash');
var User = require('../models/User');
var invalidUsageMessage = require('../utils/constants').invalidInputMessage;
var examplesMessage = require('../utils/constants').examplesMessage;

function findThermostatByName(thermostats, name){
  return _.find(thermostats, function(thermostat){
    return thermostat.name === name;
  })
}

/*
  Modified from https://github.com/nestlabs/control-jquery/blob/master/app/javascript/nest.js#L138
 */
function setTemperature(dataRef, thermostat, newTemp) {
  if (!thermostat) {
    return 'No thermostat with this name was found.';
  }
  if( !newTemp) {
    return invalidUsageMessage;
  }

  newTemp = _.toInteger(newTemp);
  var temperatureScale = thermostat['temperature_scale'].toLowerCase();
  var path = 'devices/thermostats/' + thermostat.device_id + '/target_temperature_' + temperatureScale;

  if (thermostat.is_using_emergency_heat) {
    return "Can't adjust target temperature while using emergency heat.";
  } else {
    dataRef.child(path).set(newTemp);
    return thermostat.name + ' set to ' + newTemp + ' degrees ' + temperatureScale.toUpperCase();
  }
}


function registerDataRef(dataRef, content, phone_number, res){
  var callCount = 0;
  dataRef.on('value', function (snapshot) {
    if (callCount > 0){
      return;
    }
    callCount += 1;
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
  });
}

function getTemperature(content){
  return _.last(content.match(/([\s]+)to\1+([\d]+)/i));
}

function parseSMSMessage(dataRef, snapshot, content, phone_number, res, unAuthCallback){
  var data = snapshot.val();
  var setSpecificThermostatMatch = /set([\s]+)+(["'])(\\?.)*?\2\1+to\1+([\d]+)/ig;
  var setFirstThermostatMatch = /set([\s]+)+temperature\1+to\1+([\d]+)/ig;
  var viewThermostatMatch = /view([\s]+)+thermostats/ig;
  var unauthorizedMatch = /unauthorize/ig;
  var exampleMatch = /show examples/ig;
  var thermostats = data.devices.thermostats;
  var temperature, thermostat;

  /*
   Example match: set "Bedroom Thermostat" to 45 degrees
   */
  if (content.match(setSpecificThermostatMatch)) {
    var thermostatName = _.first(content.match(/(["'])(\\?.)*?\1/));
    thermostatName = thermostatName.substr(1, thermostatName.length - 2);
    temperature = getTemperature(content);
    thermostat = findThermostatByName(thermostats, thermostatName);
    sendMessage(phone_number, setTemperature(dataRef, thermostat, temperature));
  }
  /*
   Example match: set temperature to 45 degrees
   */
  else if(content.match(setFirstThermostatMatch)){
    thermostat = thermostats[Object.keys(thermostats)[0]];
    temperature = getTemperature(content);
    sendMessage(phone_number, setTemperature(dataRef, thermostat, temperature));
  }
  else if (content.match(viewThermostatMatch)) {
    var thermostat_names = _.map(data.devices.thermostats, function (thermostat) {
      var temperatureScale = thermostat.temperature_scale.toLowerCase();
      return thermostat.name + ' currently at a temperature of ' +
        thermostat['target_temperature_' + temperatureScale] +
        ' degrees ' + temperatureScale.toUpperCase();
    });

    sendMessage(phone_number, thermostat_names.join('\n\n'));
  }
  else if (content.match(exampleMatch)) {
    sendMessage(phone_number, examplesMessage);
  }
  else if (content.match(unauthorizedMatch)) {
    User.remove({ phone_number: phone_number}, function(err){
      if(!err){
        sendMessage(phone_number, 'This number can no longer interact with your thermostats');
        if(unAuthCallback) {
          unAuthCallback();
        }
      }
    });
  }
  else {
    sendMessage(phone_number, invalidUsageMessage);
  }
  res.sendStatus(200);
}


module.exports = {
  smsHandler: function(req, res){
    var phone_number = req.body.From;
    var content = req.body.Body;
    User.findOne({ phone_number: phone_number }, function (err, existingUser) {
      if(existingUser && existingUser.token){
        var token = existingUser.token;
        var dataRef = new Firebase('wss://developer-api.nest.com');
        dataRef.authWithCustomToken(token, function() {
          registerDataRef(dataRef, content, phone_number, res);
        });
      }
    });
  },
  parseSMSMessage: parseSMSMessage
};