var request = require('supertest');
var server = require('../src/server.js');
var agent = request.agent;


describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
});

describe('POST /verify', function() {
  it('should return 302 when not authorized', function(done) {
    agent(server)
      .get('/auth/nest/callback')
      .expect(401, done);
  });
});