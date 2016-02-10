//var User = require('../../src/models/User');
var smsHandler = require('../../src/controllers/sms').smsHandler;
var userHandler = require('../../src/controllers/user');

var should = require('should');
var sinon = require('sinon');
require('should-sinon');
var Firebase = require('Firebase');
var twilioUtils = require('../../src/utils/twilio');
describe('SMS controller will handle', function() {
  var fb;
  beforeEach(function (done) {

    fb = sinon.createStubInstance(Firebase, function () {
      return {
        authWithCustomToken: function (token, callback) {
          callback();
        },
        on: function (string, callback) {
          callback({
            val: function () {
              return {
                devices: {
                  thermostats: {
                    thermostat1: {
                      device_id: '123',
                      name: 'Normal Bathroom name',
                      temperature_scale: 'f'
                    },
                    edgeCaseThermostat: {
                      device_id: '124',
                      name: 'name with edge case keywords like show examples view thermostats temperature unauthorized show examples to',
                      temperature_scale: 'f'
                    },
                    purelyNumberedThermostat: {
                      device_id: '125',
                      name: '456',
                      temperature_scale: 'f'
                    }
                  }
                }
              }
            }
          });
        }
      }
    });
    done();
  });
  describe('setting specific thermostats', function() {
    it('with the default case', function () {
      var stub = sinon.stub(twilioUtils, 'sendMessage', function(phone_number, message, callback){
        console.log(message);
      });

      userHandler.handleRegister({
        body: { phone_number: '3032612082' }
      });
      stub.should.eventually.be.called();



    })
  });
});