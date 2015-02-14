var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var strftime = require('strftime');
var request = require('request');
//var harmony = require('harmony-collections');
//var requestify = require('requestify');
var moment = require('moment');

var chat_datastream = 'chat-usage';
var user_datastream = 'user-usage';
var socu_url = 'http://socu.creal.de/api/v1/datastreams/';
var port = process.argv[2];
var messages = [];
var update_interval = 1;
var mesure_interval = 10;
var messages_equal_max_vibration = 10;

var last_intensity = 0;
var last_users = 0;

var app = express();
var server = http.createServer(app);
server.listen(port);
var io = socketio.listen(server);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
  io.emit('chat', messages);
    
  socket.on('chat', function (data) {
    try {
      if ( data.user && data.message ) {
        messages.push({'date': strftime('%F %H:%M:%S'),
                       'user': data.user,
                       'message': data.message});
        io.sockets.emit('chat', [messages[messages.length-1]]);
        console.log('[ '+strftime('%F %H:%M:%S')+' ] new message');
      }
      else {
        console.log('[ '+strftime('%F %H:%M:%S')+' ] ERROR: received invalide request');
      }
    }
    catch (e) {
      console.log('[ '+strftime('%F %H:%M:%S')+' ] ERROR: '+e.toString());
    }
  });
});

request({ url: socu_url+chat_datastream, method: 'GET' }, function (error, request, body) {
    if (!error && body.length == 0) {
      create_chat_datastream();
    }
});

request({ url: socu_url+user_datastream, method: 'GET' }, function (error, request, body) {
    if (!error && body.length == 0) {
      create_user_datastream();
    }
});

timeout_update_datastream();

// -----------------------------------------------------------------------------

function timeout_update_datastream() {
  setTimeout(function () {
    var num_messages = 0;
    var num_users = 0;
    var intensity = 0;
    var now = moment();

    var users = [];

    for (message in messages) {
      if (now.diff(moment(messages[message].date), 'seconds') < mesure_interval) {
        num_messages++;

        var to_add = true;
        for ( user in users ) {
          if ( users[user] == messages[message].user ) {
            to_add = false;
            break;
          }
        }
        if ( to_add ) {
          users.push(messages[message].user);
        }
      }
    }
    num_users = users.length;
  
    intensity = Math.floor(num_messages/messages_equal_max_vibration*100);
    if (intensity > 100) {
      intensity = 100;
    }
    if (num_users > 4) {
      num_users = 4;
    }

    //console.log("messages in last "+mesure_interval+' seconds: '+num_messages+' equals to intensity: '+intensity);
    if ( intensity != last_intensity ) {
      last_intensity = intensity;
      update_datastream(chat_datastream, intensity);
    }
    if ( last_users != num_users ) {
      last_users = num_users;
      update_datastream(user_datastream, num_users);
    }

    timeout_update_datastream();
  }, update_interval*1000);

}

function create_chat_datastream() {
  var information = {
    'description': 
    'Demo chat usage'
    , 'name': chat_datastream
    , 'data_fetch_method': 'GET'
    , 'what_to_submit': null
    , 'update_interval': update_interval
    , 'value': null
    , 'default_value': 0.0
    , 'nominal_range': [0, 100]
    , 'nominal_description': '%'
    , 'recommended_nominal_mapping_range': [0, 100]
    , 'recommended_stimulations': [ 'vibration' ]
  };

  request({ url: socu_url+chat_datastream, method: 'POST', json: information }, function (error, request, body) {
    console.log('[ '+strftime('%F %H:%M:%S')+' ] chat datastream created');
  });
}

function create_user_datastream() {
  var information = {
    'description': 
    'Demo user usage'
    , 'name': user_datastream
    , 'data_fetch_method': 'GET'
    , 'what_to_submit': null
    , 'update_interval': update_interval
    , 'value': null
    , 'default_value': 0.0
    , 'nominal_range': [0, 4]
    , 'nominal_description': '%'
    , 'recommended_nominal_mapping_range': [0, 4]
    , 'recommended_stimulations': [ 'thermal' ]
  };

  request({ url: socu_url+user_datastream, method: 'POST', json: information }, function (error, request, body) {
    console.log('[ '+strftime('%F %H:%M:%S')+' ] user datastream created');
  });
}

function update_datastream(datastream, data) {
  var value = { 'value': data };
  request({ url: socu_url+datastream, method: 'PUT', json: value }, function (error, request, body) {
    console.log('[ '+strftime('%F %H:%M:%S')+' ] datastream '+datastream+' updated to: '+data);
  });
}
