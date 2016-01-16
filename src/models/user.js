var Immutable = require('immutable');

module.exports = {
  getCurrentUser: function(users, phone_number){
    return users.get(phone_number);
  },
  getPhonenumber: function(users, phone_number){
    return users.getIn([phone_number, 'phone_number']);
  },
  getThermostats: function(users, phone_number){
    return users.getIn([phone_number, 'thermostats']);
  },
  verifyUser: function(users, phone_number){
    return users.setIn([phone_number, 'verified'], true);
  },
  getVerificationCode: function(phone_number){
    return users.getIn([phone_number, 'code']);
  },
  setVerificationCode: function(phone_number, code){
    return users.setIn([phone_number, code]);
  },
  setToken: function (users, phone_number, phone_number) {
    return users.setIn([phone_number, 'phone_number'], phone_number);
  },
  isVerified: function(users, phone_number, verification_code){
    return users.getIn([phone_number, 'verified']);
  },
  //createUser: function createUser(users, token, phone_number, code, socket) {
  //
  //},
  createUser: function(users, phone_number){
    return users.set(phone_number, Immutable.Map({
      thermostats: [],
      verified: false
    }));
  }
};