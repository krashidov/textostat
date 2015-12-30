var socket = io.connect();

function showVerificationScreen(){
  $('#register_form').fadeOut();
  $('#verify_form').fadeIn();
}

$(function(){
  $('#register_number').on('click', function (event) {
    event.preventDefault();
    socket.emit("register", {
      phone_number: $("#phone_number").val()
    });
  });

  $('#verify_code').on('click', function (event) {
    event.preventDefault();
    socket.emit("verify", {
      verification_code: $("#verification_code").val(),
      phone_number: $("#phone_number").val()
    });
  });

  socket.on('code_generated', function() {
    showVerificationScreen();
  });

  socket.on('verification_successful', function() {
    console.log('verified!');
  });
});