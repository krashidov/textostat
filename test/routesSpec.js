var request = require('supertest');
var agent = request.agent;
var sinon = require('sinon');
var tutils = require('../src/utils/twilio');
var textStub = sinon.stub(tutils, 'sendMessage', function(phone_number, message){
  console.log(message);
});

var fbStub = sinon.stub(tutils, 'sendMessage', function(phone_number, message){
  console.log(message);
});


var server = require('../src/server.js');


describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(server)
      .get('/')
      .expect(302, done);
  });
});

describe('POST /verify', function() {
  it('should return 302 when not authorized', function(done) {
    xhr = sinon.useFakeXMLHttpRequest();
    request(server)
      .post('/sms')
      .send( {From: '+13032612082', Body: 'poop'})
      .expect(200, done);
  });
  it('should return 302 when not authorized', function(done) {
    request(server)
      .post('/sms')
      .send( {From: '+13032612082', Body: 'Set temperature to 69'})
      .expect(200, done);
  });
  it('should return 302 when not authorized', function(done) {
    request(server)
      .post('/sms')
      .send( {From: '+13032612082', Body: 'Set "'})
      .expect(200, done);
  });
});