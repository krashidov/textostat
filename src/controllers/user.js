var User = require('../models/User');
var sendMessage = require('../utils/twilio').sendMessage;

function onSave(req, res, next, err) {
  return err ? next(err) : res.sendStatus(200);
}

module.exports = {
  handleRegister: function(req, res, next) {
    var code = speakeasy.totp({key: 'abc123'});
    var phone_number = req.body.phone_number;
    var user = new User({
      verification_code: code,
      phone_number: phone_number,
    });
    User.findOne({phone_number: phone_number}, function (err, existingUser) {
      if(existingUser){
        existingUser.verification_code = code;
        existingUser.save(function(err){
          sendMessage(phone_number, code, function(twilioerr) {
            if (twilioerr) {
              //users.delete(phone_number);
              //socket.emit('update', {message: "Invalid phone number!"});
            } else {
              //socket.emit('code_generated');
            }
          });
          return err ? next(err) : res.sendStatus(200);
        });
        return res.sendStatus(200);
      }
      user.save(function(){

      });
    });
  },

  handleVerify: function(req, res) {
    var phone_number = req.body.phone_number;
    var verification_code = req.body.verification_code;
    var token = req.body.user.accessToken;
    User.findOne({phone_number: phone_number}, function (err, existingUser) {
      if(existingUser && verification_code && existingUser.verification_code === verification_code){
        existingUser.verified = true;
        existingUser.token = token;
        return existingUser.save(onSave.bind(undefined, req, res, next));
      } else {
        //TODO: let the user know this verification code is not correct
      }
    });
    if (users.getIn([phone_number, 'code']) === data.verification_code) {
      users = users.setIn([phone_number, 'verified'], true);
      socket.emit('verification_successful');
    } else {
      socket.emit('update', {messsage: 'Invalid verification code!'});
    }
  }
};