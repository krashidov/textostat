var speakeasy = require('speakeasy');
var User = require('../models/User');
var sendMessage = require('../utils/twilio').sendMessage;

function messageCallback(twilioerr, res) {
  if (twilioerr) {
    res.status(400).send('Invalid phone number');
  } else {
    res.status(200).send('Code sent successfully');
  }
}

function normalizeNumber(number) {
  number = typeof number === 'string' ? number : number.toString();
  number = number.toString().replace(/[^0-9+]/g, '');
  return number[0] !== '+' ? '+1' + number : number;
}

module.exports = {
  handleRegister: function (req, res, next) {
    var code = speakeasy.totp({key: 'abc123'});
    var phone_number = normalizeNumber(req.body.phone_number);
    var user = new User({
      verification_code: code,
      phone_number: phone_number
    });
    console.log(user);
    return User.findOne({phone_number: phone_number}, function (err, existingUser) {
      console.log('here');
      if (existingUser) {
        existingUser.verification_code = code;
        existingUser.save(function (err) {
          sendMessage(phone_number, 'Your verification code is ' + code, function (twilioerr) {
            messageCallback(twilioerr, res);
          });
        });
      }
      user.save(function (err) {
        sendMessage(phone_number, 'Your verification code is ' + code, function (twilioerr) {
          messageCallback(twilioerr, res);
        });
      });
    });
  },

  handleVerify: function (req, res) {
    if (!req.body.phone_number || !req.body.verification_code) {
      return res.sendStatus(422);
    }

    var phone_number = normalizeNumber(req.body.phone_number);
    var verification_code = req.body.verification_code;
    var token = req.user.accessToken;
    User.findOne({phone_number: phone_number}, function (err, existingUser) {
      if (existingUser && verification_code && existingUser.verification_code === verification_code) {
        existingUser.verified = true;
        existingUser.token = token;
        return existingUser.save(function (err) {
          if(err){
            return next(err);
          }
          sendMessage(phone_number, 'You are now verified! Send \'show examples\' to see usage examples.');
          res.sendStatus(200);
        });
      } else {
        res.status(401).send('Invalid code');
      }
    });
  }
};