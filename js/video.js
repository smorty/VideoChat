// grab the room from the URL
var room = location.search && location.search.split('?')[1];

// This object will take in an array of XirSys STUN / TURN servers
// and override the original peerConnectionConfig object
var peerConnectionConfig;
 
$.ajax({
    type: "POST",
    dataType: "json",
    url: "https://api.xirsys.com/getIceServers",
    data: {
        ident: "smorty",
        secret: "c1ed8dbe-8c96-4dde-a386-4b0c24ef086e",
        domain: "www.smortimer.com",
        application: "video",
        room: room,
        secure: 1
    },
    success: function (data, status) {
        // data.d is where the iceServers object lives
        peerConnectionConfig = data.d;
        console.log(peerConnectionConfig);
    },
    async: false
});

// create our webrtc connection
var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: '',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false,
    peerConnectionConfig: peerConnectionConfig
});

// when it's ready, join if we got a room from the URL
webrtc.on('readyToCall', function () {
    // you can name it anything
    if (room) webrtc.joinRoom(room);
});

function showVolume(el, volume) {
    if (!el) return;
    if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
    } else if (volume > -20) {
        el.style.height = '100%';
    } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
    }
}
webrtc.on('channelMessage', function (peer, label, data) {
    if (data.type == 'volume') {
        showVolume(document.getElementById('volume_' + peer.id), data.volume);
    }
});
webrtc.on('videoAdded', function (video, peer) {
    console.log('video added', peer);
    var remotes = document.getElementById('remotes');
    if (remotes) {
        var d = document.createElement('div');
        d.className = 'videoContainer';
        d.id = 'container_' + webrtc.getDomId(peer);
        d.appendChild(video);
        var vol = document.createElement('div');
        vol.id = 'volume_' + peer.id;
        vol.className = 'volume_bar';
        video.onclick = function () {
            video.style.width = video.videoWidth + 'px';
            video.style.height = video.videoHeight + 'px';
        };
        d.appendChild(vol);
        remotes.appendChild(d);
        $('#localVideo').animate({height: '100px', width: '100%', top: '5.5rem', left: '-10.8rem'});
        $('#localVideo').css("position", "absolute");
    }
});
webrtc.on('videoRemoved', function (video, peer) {
    console.log('video removed ', peer);
    var remotes = document.getElementById('remotes');
    var el = document.getElementById('container_' + webrtc.getDomId(peer));
    if (remotes && el) {
        remotes.removeChild(el);
    }
    $('#localVideo').css({"position": "relative", "top": "0", "left": "0", "height": "300px"});
});
webrtc.on('volumeChange', function (volume, treshold) {
    //console.log('own volume', volume);
    showVolume(document.getElementById('localVolume'), volume);
});

// Since we use this twice we put it here
function setRoom(name) {
    $('.room').remove();
    // $('h1').text(name);
    $('#subTitle').text('Link to join: ' + location.href);
    $('body').addClass('active');
}

if (room) {
    setRoom(room);
} else {
    $('#create').click(function () {
        var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
        webrtc.createRoom(val, function (err, name) {
            console.log(' create room cb', arguments);
        
            var newUrl = location.pathname + '?' + name;
            if (!err) {
                history.replaceState({foo: 'bar'}, null, newUrl);
                setRoom(name);
            } else {
                console.log(err);
            }
        });
        return false;          
    });
}

var button = $('#screenShareButton'),
    setButton = function (bool) {
        button.text(bool ? 'share screen' : 'stop sharing');
    };
webrtc.on('localScreenStopped', function () {
    setButton(true);
});

setButton(true);

button.click(function () {
    if (webrtc.getLocalScreen()) {
        webrtc.stopScreenShare();
        setButton(true);
    } else {
        webrtc.shareScreen(function (err) {
            if (err) {
                setButton(true);
            } else {
                setButton(false);
            }
        });
        
    }
});