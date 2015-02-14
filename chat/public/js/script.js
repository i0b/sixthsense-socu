$(document).ready(function(){
  var socket = io.connect();

  socket.on('chat', function (data) {
    for ( element in data ) {
      var entry = data[element];
      if ( entry.user && entry.date && entry.message ) {
        append_message(entry.user, entry.date, entry.message);
        $('html,body').animate({ scrollTop: $(document).height() }, 'slow');
      }
    }

    //$('#chat').animate({scrollTop: height}, 'slow');
    //$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
    //$("html, body").animate({ scrollTop: 0 },1000);
  });

  $('#send').click(send_message);

  $('#message').keypress(function (e) {
    if (e.keyCode == 13 && !e.shiftKey) {
      send_message();
      e.preventDefault();
    }
  });

  $('#user').keypress(function (e) {
    if (e.keyCode == 13 ) {
      this.readOnly = true;
    }
  });

  $('#user').click( function (e) {
    this.readOnly = false;
  } );


  function append_message(user, date, message) {
    var element = $('<li class="media"></li>');
    element.append($('<div class="media-body"></div>').append('<div class="media"></div>'));
    element.append('<img class="pull-left media-object img-circle" src="assets/img/user.jpg"/>');
    var inner_message = $('<div class="media-body"></div>').append(message);
    inner_message.append('<br/><small class="text-muted">'+user+' | '+date+'</small>');
    element.append(inner_message);

    $('.media-list').append(element);
  }

  function send_message(){
    socket.emit('chat', { user: $('#user').val(), message: $('#message').val() });
    $('#message').val('');
  }
});
