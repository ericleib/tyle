

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

/** Create 3D wheel **/
$(document).ready(function(){

  $('#myCarousel')
  .carousel({interval: false})
  .on('slide.bs.carousel', function (e) {
    setTimeout(onWindowResize,0) ;
  });


  var container = $("#wheel3D")[0];

  var camera, scene, renderer, material, mesh;

  var targetRotation = 0;
  var targetRotationOnMouseDown = 0;

  var mouseX = 0;
  var mouseXOnMouseDown = 0;

  var windowHalfX = container.clientWidth;
  var windowHalfY = container.clientHeight;

  init();
  animate();

  function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 70, 1 , 1, 1000 );
    camera.position.y = 100;
    camera.position.z = 100;

    scene.add(camera);

    // cylinder

    var geometry = new THREE.CylinderGeometry( 50, 50, 10, 32 );

    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    mesh.position.y = 100;
    scene.add( mesh );

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xDC493E );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.clientWidth, container.clientHeight );
    container.appendChild( renderer.domElement );

    container.addEventListener( 'mousedown', onDocumentMouseDown, false );
    container.addEventListener( 'touchstart', onDocumentTouchStart, false );
    container.addEventListener( 'touchmove', onDocumentTouchMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
  }

  function onWindowResize() {
    windowHalfX = container.clientWidth / 2;
    windowHalfY = container.clientHeight / 2;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );
  }


  function onDocumentMouseDown( event ) {
    event.preventDefault();
    container.addEventListener( 'mousemove', onDocumentMouseMove, false );
    container.addEventListener( 'mouseup', onDocumentMouseUp, false );
    container.addEventListener( 'mouseout', onDocumentMouseOut, false );
    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
  }

  function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
  }

  function onDocumentMouseUp( event ) {
    container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    container.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    container.removeEventListener( 'mouseout', onDocumentMouseOut, false );
  }

  function onDocumentMouseOut( event ) {
    container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    container.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    container.removeEventListener( 'mouseout', onDocumentMouseOut, false );
  }

  function onDocumentTouchStart( event ) {
    if ( event.touches.length === 1 ) {
      event.preventDefault();
      mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
      targetRotationOnMouseDown = targetRotation;
    }
  }

  function onDocumentTouchMove( event ) {
    if ( event.touches.length === 1 ) {
      event.preventDefault();
      mouseX = event.touches[ 0 ].pageX - windowHalfX;
      targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
    }
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {
    mesh.rotation.x +=0.01;
    mesh.rotation.z +=0.02;
    mesh.rotation.y += ( targetRotation - mesh.rotation.y ) * 0.05;
    renderer.render( scene, camera );
  }
});


/** Populate release notes **/
$(document).ready(function(){

  $.ajax({
    type: "GET",
    url: "https://api.github.com/repos/ericleib/tyle/releases/latest"
  }).done(function(response) {
    var text = response.body;
    var name = response.name;
    var tag = response.tag_name;
    var title = "<h4><b>Release notes for:</b> "+name+" <small>("+tag+")</small></h4>";
    $("#releaseNotes").html(title + markdown.toHTML(text)).show();
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
