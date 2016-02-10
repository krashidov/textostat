
function showVerificationScreen(){
  $('#register_form').fadeOut();
  $('#verify_form').fadeIn();
}

function showCompletionScreen(){
  $('#verify_form').fadeOut();
  $('#verified').fadeIn();
}

$(function(){
  $('#register_number').on('click', function (event) {
    event.preventDefault();
    $.post('/register', { phone_number: $("#phone_number").val() }).done(function(data, status, response){
      if(response.status === 200){
        showVerificationScreen();
      }
    });
  });

  $('#verify_code').on('click', function (event) {
    event.preventDefault();
    $.post('/verify',
      {
        phone_number: $("#phone_number").val(),
        verification_code: $("#verification_code").val()
      }).done(function (data, status, response) {
      if (response.status === 200) {
        showCompletionScreen();
      }
    });
  });
});