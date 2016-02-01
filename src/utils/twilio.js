var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);


module.exports = {
  sendMessage: function(phone_number, message, callback){
    client.messages.create({
      to: phone_number,
      from: process.env.TWILIO_NUMBER,
      body: message
    }, callback);
  }
};