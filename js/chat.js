var stun = {};
var turn1 = {};
var turn2 = {}; 
$.ajax({
  type: "POST",
  dataType: "json",
  url: "https://api.xirsys.com/getIceServers",
  data: {
      ident: "smorty",
      secret: "c1ed8dbe-8c96-4dde-a386-4b0c24ef086e",
      domain: "www.smortimer.com",
      application: "webrtc",
      room: "room1",
      secure: 1
  },
  success: function (data, status) {
      // data.d is where the iceServers object lives
      // peerConnectionConfig = data.d;
      // console.log(peerConnectionConfig);
      console.log(data);
      stun = data.d.iceServers[0];
      turn1 = data.d.iceServers[1];
      turn2 = data.d.iceServers[2];
  },
  async: false
});

  var conn;
  // Connect to PeerJS, have server assign an ID instead of providing one
  var peerID = prompt('What would you like your screen name to be?');
  // var peer = new Peer(peerID, {key: 'dh4ek9enhtgctyb9', debug: true});
  var peer = new Peer(
    peerID, 
    {key: 'dh4ek9enhtgctyb9', debug: true,
    config: {'iceServers': [
        {url: stun.url},
        {url: turn1.url, credential: turn1.credential, username: turn1.username},
        {url: turn2.url, credential: turn2.credential, username: turn2.username}
      ]
    }
  });
  peer.on('open', function(id){
    $('#pid').text(id);
    if(!$('#pid').text()){
      alert('No ID could be generated. Try refreshing and choosing a unique screen name.');
    };
  });  
  // Await connections from others
  peer.on('connection', connect);
  function connect(c) {
    $('#chatConnect').hide();
    $('#chat_area').show();
    conn = c;
    $('#messages').empty().append('<p class="chatHead">Now chatting with ' + conn.peer + '</p>');
    conn.on('data', function(data){
      $('#messages').append('<p class="friendChat"><strong>' + conn.peer + ': </strong>' + data + '</p>');
      $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });
    conn.on('close', function(err){ alert(conn.peer + ' has left the chat.') });
  }
  $(document).ready(function() {
    // Conect to a peer
    $('#connect').click(function(){
      var c = peer.connect($('#rid').val());
      c.on('open', function(){
        connect(c);
      });
      c.on('error', function(err){ alert(err) });  
    });
    $('#rid').keypress(function(e){
      if(e.which == 13){
        var c = peer.connect($('#rid').val());
        c.on('open', function(){
          connect(c);
        });
        c.on('error', function(err){ 
          alert(err) 
        });
      }
    })
    // Send a chat message
    $('#send').click(function(){
      var msg = $('#text').val();
      conn.send(msg);
      $('#messages').append('<p class="myChat"><strong>You: </strong>' + msg + '</p>');
      $("#messages").scrollTop($("#messages")[0].scrollHeight);
      $('#text').val('');
    });
    $('#text').keypress(function(e){
      if(e.which == 13){
        var msg = $('#text').val();
        conn.send(msg);
        $('#messages').append('<p class="myChat"><strong>You: </strong>' + msg + '</p>');
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
        $('#text').val('');
      };
    });
    // Show browser version
    $('#browsers').text(navigator.userAgent);
  });