var sinon = require('sinon');
var mockery = require('mockery');
var expect = require('chai').expect;
var sendMessageStub = sinon.stub();
var setTemperatureSpy = sinon.spy();
var examplesMessage = require('../src/utils/constants').examplesMessage;
var invalidInputMessage = require('../src/utils/constants').invalidInputMessage;
var User = require('../src/models/User');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB);

var dataRef = {
  child: function() {
    return {
      set: setTemperatureSpy
    }
  }
};



var snapshot = {
  val: function () {
    return {
      devices: {
        thermostats: {
          id1: {
            name: 'Bathroom',
            temperature_scale: 'F',
            target_temperature_f: '65'
          },
          id2: {
            name: 'Bedroom',
            temperature_scale: 'C',
            target_temperature_c: '23'
          },
          id3: {
            name: 'Room with spaces',
            temperature_scale: 'F',
            target_temperature_f: '67'
          }
        }
      }
    }
  }
};

var phone_number = '+13035555555';

var res = {
  sendStatus: sinon.mock()
};
describe('POST /verify', function() {
  var parseSMSMessage;
  beforeEach(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.registerMock('twilio', function() {
      return {
        messages: {
          create: sendMessageStub
        }
      };
    });
    parseSMSMessage = require('../src/controllers/sms').parseSMSMessage;
  });

  afterEach(function () {
    res.sendStatus.reset();
  });

  it('will set the first thermostat\'s temperature when given an implicit message', function(done) {
    var content = 'set temperature to 65 degrees';
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
    expect(sendMessageStub.lastCall.args[0].body).to.equal('Bathroom set to 65 degrees F');
    done();
  });

  it('will set the first thermostat\'s temperature when there are spaces in between tokens', function(done) {
    var content = 'set   temperature  to    65   degrees';
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
    expect(sendMessageStub.lastCall.args[0].body).to.equal('Bathroom set to 65 degrees F');
    done();
  });

  it('will set an explicit thermostat\'s temperature', function(done) {
    var content = 'set "Room with spaces" to 70 degrees';
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
    expect(sendMessageStub.lastCall.args[0].body).to.equal('Room with spaces set to 70 degrees F');
    done();
  });

  it('will set an explicit thermostat\'s temperature when there are some spaces between tokens', function(done) {
    var content = 'set  "Room with spaces"   to   70  degrees';
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
    expect(sendMessageStub.lastCall.args[0].body).to.equal('Room with spaces set to 70 degrees F');
    done();
  });

  it('will show the names and temperatures of current thermostats', function(done) {
    var content = 'view thermostats';
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
    expect(sendMessageStub.lastCall.args[0].body).to.equal(
      'Bathroom currently at a temperature of 65 degrees F\n\n' +
      'Bedroom currently at a temperature of 23 degrees C\n\n' +
      'Room with spaces currently at a temperature of 67 degrees F');
    done();
  });

  it('will show example messages', function(done) {
    var content = 'show examples';
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
    expect(sendMessageStub.lastCall.args[0].body).to.equal(examplesMessage);
    done();
  });

  it('will tell you that your input is invalid', function(done) {
    var content = 'bazorka zorp';
    parseSMSMessage(dataRef, snapshot, content, phone_number, res);
    expect(sendMessageStub.lastCall.args[0].body).to.equal(invalidInputMessage);
    done();
  });

  it('unauthorize a user', function(done) {
    var user = new User({ phone_number: phone_number });

    user.save(function(err) {
      var content = 'unauthorize';
      parseSMSMessage(dataRef, snapshot, content, phone_number, res, function() {
        User.findOne({ phone_number: phone_number }, function(err, existingUser) {
          if (!existingUser) {
            expect(sendMessageStub.lastCall.args[0].body).to.equal('This number can no longer interact with your thermostats');
            done();
          }
        })
      });
    });
  });
});