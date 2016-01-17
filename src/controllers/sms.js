module.exports = {
  smsHandler: function(req, res){
    var phone_number = req.body.From;
    var content = req.body.Body.split(' ');

    var actionMap = {
      set: function(){

      },
      view: function(){
        sendMessage(phone_number, thermostat_names.join(' '), function(){});
      }
    };

    actionMap[content[0]]();

    console.log(req);
    res.sendStatus(200);
  }
};