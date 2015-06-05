

/** Smooth scroll **/
$(function() {
  $('.smooth-scroll').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});


/** Highlight platform **/
$(function(){
  var os = navigator.platform.toLowerCase();

  if(os.includes('linux')){
    $('#linfav').css('background-color', 'rgb(219, 255, 212)');
  }else if(os.includes('win')){
    $('#winfav').css('background-color', 'rgb(219, 255, 212)');
  }else if(os.includes('mac')){
    $('#macfav').css('background-color', 'rgb(219, 255, 212)');
  }

});


/** Populate release notes **/
$(document).ready(function(){

  $.ajax({
    type: "GET",
    url: "https://api.github.com/repos/ericleib/tyle/releases/latest"
  }).done(function(response) {
    var releaseNotesText = response.body;
    var title = "<h4>Release notes:</h4>";
    $("#releaseNotes").html(title + markdown.toHTML(releaseNotesText)).show();
  });

});


/** Contact form **/
$(document).ready(function() {

  $.validate();

  // Lorsque je soumets le formulaire
  $('#contact').on('submit', function(e) {
    e.preventDefault(); // J'empêche le comportement par défaut du navigateur, c-à-d de soumettre le formulaire

    var $this = $(this); // L'objet jQuery du formulaire

    // Je récupère les valeurs
    var email = $('#email').val();
    var object = $('#object').val();
    var message =  $('#message').val();

    var check =  $('#foo').val();   // Anti-spam

    if(check===''){
      register(email, object, message);
    }


  });//submit


  function register(email, object, message){
    $.ajax({
      type: "POST",
      url: "https://mandrillapp.com/api/1.0/messages/send.json",
      data: {
        'key': '2fdGlohAdHsp0K7Wk0IL3Q',
        'message': {
          'from_email': email,
          'to': [
              {
                'email': 'support@gettyle.com',
                'name': 'GetTyle',
                'type': 'to'
              }
            ],
          'autotext': 'true',
          'subject': object,
          'html': message
        }
      }
    }).done(function(response) {
      $("#contact")[0].reset();
      $("#formResponse").removeClass("text-danger");
      $("#formResponse").addClass("text-success");
      $("#formResponse").text("Thank you for your message!");
      sendThanks(email, object, message);
    }).fail(function(jqXHR, textStatus) {
      $("#formResponse").addClass("text-danger");
      $("#formResponse").removeClass("text-success");
      $("#formResponse").text("Your message could not be sent...");
    }); // ajax
  } // register()

  function sendThanks(email, object, message) {
    $.ajax({
      type: "POST",
      url: "https://mandrillapp.com/api/1.0/messages/send.json",
      data: {
        'key': '2fdGlohAdHsp0K7Wk0IL3Q',
        'message': {
          'from_email': 'support@gettyle.com',
          'to': [
              {
                'email': email,
                'type': 'to'
              }
            ],
          'autotext': 'true',
          'subject': 'Thank you for your interest in Tyle',
          'html': "<h1>Thank you for your message!</h1>"+
                  "<p>Feel free to directly communicate with us by replying to this email.</p>"+
                  "<p><strong>Object: </strong>"+object+"</p>"+
                  "<p><strong>Message: </strong>"+message+"</p>"
        }
      }
    }).done(function(res) {
      //console.log(res);
    }); // ajax
  } // send thanks()

});// ready
