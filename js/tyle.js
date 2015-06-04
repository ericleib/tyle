

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
