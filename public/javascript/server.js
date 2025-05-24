var oSipStack, oSipStackEvent, oSipSessionRegister, oSipSessionCall, oSessionPublish, sipURI;
var videoRemote, videoLocal, audioRemote;
var bFullScreen = false;
var bDisableVideo = false;
// commented vars : txtPrivateIdentity, txtPublicIdentity, txtPassword, txtRealm, txtDisplayName, txtWebsocketServerUrl, 
// txtSIPOutboundProxyUrl, txtStackEvent, txtSipEvent, btnRegister, btnHangUp,txtPresenceStatus;
var oConfigCall, txtPhoneNumber,
   
  txtCallStatus, txtRegStatus;
var CallEarlyEpoch = CallProfileEpoch = CallHangupEpoch = CallEarlyMedia = null;
  
window.onload = function () {
  // txtPrivateIdentity = document.getElementById("txtPrivateIdentity");
  // txtPublicIdentity = document.getElementById("txtPublicIdentity");
  // txtPassword = document.getElementById("txtPassword");
  // txtRealm = document.getElementById("txtRealm");
  // txtDisplayName = document.getElementById("txtDisplayName");
  // txtWebsocketServerUrl = document.getElementById("txtWebsocketServerUrl");
  // txtSIPOutboundProxyUrl = document.getElementById("txtSIPOutboundProxyUrl");
  txtPhoneNumber = document.getElementById("txtPhoneNumber");
  txtRegStatus = document.getElementById('txtRegStatus');
  txtCallStatus = document.getElementById('txtCallStatus');
  // SelPresence = document.getElementById('presence');
  // txtPresenceStatus = document.getElementById('txtPresenceStatus');
  // txtStackEvent = document.getElementById('txtStackEvent');
  // txtSipEvent = document.getElementById('txtSipEvent');

  // txtStackEvent.value = '';
  // txtSipEvent.value = '';
  
  // messages = document.getElementById('messages');
  Ring = document.getElementById("ringtone");

  // btnRegister= document.getElementById("btnRegister");
  // btnHangUp = document.getElementById("btnHangup");
  // btnHoldResume = document.getElementById("btnHoldResume");
  // btnMuteUnmute = document.getElementById("btnMuteUnmute");
  // btnTransfer = document.getElementById("btnTransfer");
  // btnHangup = document.getElementById("btnHangup");
  
  // dtmfkeys =	document.getElementById('dtmfkeys');

  // dtmfkeys.hidden = true;
	
	// btnRegister.addEventListener("click", function(){
	//   	console.log("Loggin In");
  // 		sipRegister();
	// });
	
	// btnUnRegister.addEventListener("click", function(){
  // 		console.log("Loggin Out");
  // 		sipUnRegister();
	// 	});
	
	// btnCall.addEventListener("click", function(){
 	// 	if (this.value == 'Dial') {
 	// 		console.log("Dialing number");
  // 			sipCall('call-audio');
  // 		}else{
	//   		console.log("Accepting the call");
	//   		answercall();
	// 	}});
			
	// btnHangup.addEventListener("click", function(){
	// 	if (this.value == 'HangUp'){
	// 		console.log("Hangingup");
	// 		sipHangUp();
	// 	}else{
  // 			this.value='HangUp';
	// 		rejectcall();
	// 	}});
			
	// btnTransfer.addEventListener("click", function(){
	// 	console.log("Transfaring call");
	// 	sipTransfer();
	// })
	
	// btnHoldResume.addEventListener('click', function(){
	// 	console.log('Togling Hold / Resume');
	// 	sipToggleHoldResume();
	// })		
	
	// btnMuteUnmute.addEventListener('click', function(){
	// 	console.log('Togling Mute / Unmute');	
	// 	sipToggleMute();
	// })

	// SelPresence.addEventListener('change', function(e){
	//     console.log('Presence changed to ', this.options[this.selectedIndex].text);
	//     var rpid = this.options[this.selectedIndex].attributes['rpid'].value;
	//     sipPublish(rpid, this.value, this.options[this.selectedIndex].text);
	// })

  SIPml.init(postInit);
};
window.sipEventBridge = {
  callbacks: {},
  
  // Register callback functions from Vue component
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  },
  
  // Remove callback functions
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  },
  
  // Emit events to Vue component
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('SIP Event Bridge Error:', error);
        }
      });
    }
  }
};
function alertJSLoaded(){
  alert("Javascript files loaded");
}
function postInit() {
  //btnRegister.disabled = false;
  oConfigCall = {
    video_local: document.getElementById("video-local"),
    video_remote: document.getElementById("video-remote"),
    audio_remote: document.getElementById("audio-remote"),

    screencast_window_id: 0x00000000, // entire desktop
    bandwidth: { audio: undefined, video: undefined },
    video_size: {
      minWidth: undefined,
      minHeight: undefined,
      maxWidth: undefined,
      maxHeight: undefined,
    },
    events_listener: { events: "*", listener: onSipEventSession },
    sip_caps: [
      { name: "+g.oma.sip-im" },
      { name: "language", value: '"en"' },
    ],
  };
}

function sipRegister(bullforcePstn) {
  /*
  console.log("txtDisplayName", txtDisplayName.value);
  console.log("txtPassword", txtPassword.value);
  console.log("txtPrivateIdentity", txtPrivateIdentity.value);
  console.log("txtPublicIdentity", txtPublicIdentity.value);
  console.log("txtRealm", txtRealm.value);
  console.log("txtSIPOutboundProxyUrl", txtSIPOutboundProxyUrl.value);
  console.log("txtWebsocketServerUrl", txtWebsocketServerUrl.value);
  btnRegister.disabled = true;
  */
  sipURI = bullforcePstn.FS_IMPU.toString();
  // sipURI = document.getElementById('impu').value;
  const StackInitialize = {
    // realm: 'conf.nitoville.com', // mandatory: domain name
    // impi: '641234567891', // mandatory: authorization name (IMS Private Identity)
    // impu: 'sip:641234567891@conf.nitoville.com', // mandatory: valid SIP Uri (IMS Public Identity)
    // password: 'mysecret', // optional
    // display_name: '641234567891', // optional
    // websocket_proxy_url: 'wss://conf.nitoville.com:7443', // optional
    // outbound_proxy_url: 'tls://conf.nitoville.com:7443', // optional
    // realm:  document.getElementById('realm').value,  // "lcc-default", // mandatory: domain name
    // impi: document.getElementById('impi').value , // mandatory: authorization name (IMS Private Identity)
    // impu: document.getElementById('impu').value, // mandatory: valid SIP Uri (IMS Public Identity)
    // password: document.getElementById('password').value, // optional
    // display_name:  document.getElementById('display_name').value, // optional
    // websocket_proxy_url: document.getElementById('websocket_proxy_url').value,
    // outbound_proxy_url: document.getElementById('outbound_proxy_url').value,
    // ice_servers: document.getElementById('ice_servers').value,
    // enable_rtcweb_breaker: document.getElementById('enable_rtcweb_breaker').value, // optional
    // enable_media_stream_cache: document.getElementById('enable_media_stream_cache').value, // optional
    realm:  bullforcePstn.FS_REALM,  // "lcc-default", // mandatory: domain name
    impi: bullforcePstn.FS_IMPI.toString(), // mandatory: authorization name (IMS Private Identity)
    impu: bullforcePstn.FS_IMPU, // mandatory: valid SIP Uri (IMS Public Identity)
    password: bullforcePstn.FS_SECRET.toString(), // optional
    display_name:  bullforcePstn.FS_DISPLAY, // optional
    websocket_proxy_url: bullforcePstn.FS_WS_PROXY_URL_INT,
    outbound_proxy_url: bullforcePstn.FS_WS_PROXY_URL_EXT,
    ice_servers: bullforcePstn.FS_ICE_SERVERS,
    enable_rtcweb_breaker: true, // optional
    enable_media_stream_cache: true, // optional
    events_listener: { events: "*", listener: onSipEventStack }, // optional: '*' means all events
    sip_headers: [
      // optional
      { name: "User-Agent", value: "IM-client/OMA1.0 sipML5-v1.0.0.0" },
      { name: "Organization", value: "PRABHAT SERVICES" },
    ],
  }
  // console.log("Stack Initialize : ",StackInitialize);
  oSipStack = new SIPml.Stack(StackInitialize);
  window.sipEventBridge.emit('registrationAttempt', {
    impu: bullforcePstn.FS_IMPU,
    realm: bullforcePstn.FS_REALM,
    timestamp: new Date().toISOString()
  });
  oSipStack.start();
}

// Mute or Unmute the call
function sipToggleMute(){
  if (oSipSessionCall) {
    var i_ret;
    var bMute = !oSipSessionCall.bMute;
    // txtCallStatus.innerHTML = bMute ? '<i>Mute the call...</i>' : '<i>Unmute the call...</i>';
    i_ret = oSipSessionCall.mute('audio'/*could be 'video'*/, bMute);
    if (i_ret != 0) {
      // txtCallStatus.innerHTML = '<i>Mute / Unmute failed</i>';
      return;
    }
    oSipSessionCall.bMute = bMute;
    // btnMuteUnmute.value = bMute ? "Unmute" : "Mute";
  }
}

// holds or resumes the call
function sipToggleHoldResume() {
  if (oSipSessionCall) {
      var i_ret;
    //  btnHoldResume.disabled = true;
    
    var bHeld = !oSipSessionCall.bHeld;
      // txtCallStatus.innerHTML = oSipSessionCall.bHeld ? '<i>Resuming the call...</i>' : '<i>Holding the call...</i>';
      i_ret = oSipSessionCall.bHeld ? oSipSessionCall.resume() : oSipSessionCall.hold();
      if (i_ret != 0) {
          // txtCallStatus.innerHTML = '<i>Hold / Resume failed</i>';
          // btnHoldResume.disabled = false;
          return;
      }
      
    oSipSessionCall.bHeld = bHeld;
    // btnHoldResume.value = bHeld ? "Resume" : "Hold";
  }
}

function toggleFullScreen() {
  bFullScreen=true;
  if (bFullScreen) {
    videoRemote.webkitEnterFullScreen();
}
else {
    videoRemote.webkitExitFullscreen();
}
  // if (videoRemote.webkitSupportsFullscreen) {
  //     fullScreen(!videoRemote.webkitDisplayingFullscreen);
  // }
  // else {
  //     fullScreen(!bFullScreen);
  // }
}
function fullScreen(b_fs) {
  bFullScreen = b_fs;
  if (tsk_utils_have_webrtc4native() && bFullScreen && videoRemote.webkitSupportsFullscreen) {
      if (bFullScreen) {
          videoRemote.webkitEnterFullScreen();
      }
      else {
          videoRemote.webkitExitFullscreen();
      }
  }
  else {
      if (tsk_utils_have_webrtc4npapi()) {
          try { if (window.__o_display_remote) window.__o_display_remote.setFullScreen(b_fs); }
          catch (e) { divVideo.setAttribute("class", b_fs ? "full-screen" : "normal-screen"); }
      }
      else {
          divVideo.setAttribute("class", b_fs ? "full-screen" : "normal-screen");
      }
  }
}
function sipUnRegister() {
  if (oSipStack) {
    oSipStack.stop(); // shutdown all sessions
    txtRegStatus.innerHTML = "";
  }
}

// Callback function for SIP Stacks
function onSipEventStack(e /*SIPml.Stack.Event*/) {
    oSipStackEvent = e;
    // txtStackEvent.value = txtStackEvent.value + '\n' + e.type ;
    // txtStackEvent.scrollTop = txtStackEvent.scrollHeight;
  tsk_utils_log_info("==stack event = " + e.type);
  switch (e.type) {
    case "started": {
      // catch exception for IE (DOM not ready)
      try {
        // LogIn (REGISTER) as soon as the stack finish starting

        oSipSessionRegister = this.newSession("register", {
          expires: 200,
          events_listener: { events: "*", listener: onSipEventSession },
          sip_caps: [
            { name: "+g.oma.sip-im", value: null },
            //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
            { name: "+audio", value: null },
            { name: "language", value: '"en,fr"' },
          ],
        });
        oSipSessionRegister.register();
      } catch (e) {
        console.log(`exception dom not ready : ${JSON.stringify(e)}`);
        // txtRegStatus.value = txtRegStatus.innerHTML = "<b>1:" + e + "</b>";
        // btnRegister.disabled = false;
      }
      break;
    }
    case "stopping":
    case "stopped":
    case "failed_to_start":
    case "failed_to_stop": {
      var bFailure = e.type == "failed_to_start" || e.type == "failed_to_stop";
      oSipStack = null;
      oSipSessionRegister = null;
      oSipSessionCall = null;

      uiOnConnectionEvent(false, false);

      // txtCallStatus.innerHTML = "&nbsp";
      // txtRegStatus.innerHTML = bFailure
      //   ? "<i>Disconnected: <b>" + e.description + "</b></i>"
      //   : "<i>Disconnected</i>";
      console.log(`Disconneted : ${e.discription}`);
      window.sipEventBridge.emit('connectionStatus', {
        connected: false,
        error: bFailure,
        description: e.description
      });
      break;
    }
    case "i_new_call": {
      if (oSipSessionCall) {
        // do not accept the incoming call if we're already 'in call'
        e.newSession.hangup(); // comment this line for multi-line support
        // Notify Vue component about rejected call due to busy line
        window.sipEventBridge.emit('callRejected', {
          reason: 'busy',
          message: 'Call rejected - line busy'
        });
      } else {
        oSipSessionCall = e.newSession;
        // start listening for events
        oSipSessionCall.setConfiguration(oConfigCall);
        

        var sRemoteNumber =
          oSipSessionCall.getRemoteFriendlyName() || "unknown";

        window.sipEventBridge.emit('incomingCall', {
          remoteNumber: sRemoteNumber,
          timestamp: new Date().toISOString(),
          sessionId: oSipSessionCall.getId ? oSipSessionCall.getId() : 'unknown'
        });
        console.log(`remote Number : ${sRemoteNumber}`);
        // txtCallStatus.innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";
        // txtCallStatus.innerHTML = `<i>Incoming call from <b>${sRemoteNumber} </b></i>`;
//                      <button onClick="answercall()" class="btn btn-success">Answer</button>
//                       <button onClick="rejectcall()"  class="btn btn-danger">Reject</button>
        // btnCall.value = 'Answer';
        // btnHangup.value = 'Reject';
        // btnHangup.disabled = false;
        Ring.play();              
      }
      break;
    }
    case "m_permission_requested":

    case "m_permission_accepted":
    case "m_permission_refused":

    case "i_new_message":
        //e.newSession.accept(); // e.newSession.reject(); to reject the message
        if (e.getContentString()) {
        console.log('SMS-content = ' + e.getContentString() + ' and SMS-content-type = ' + e.getContentType());
        // messages.value = messages.value + '\n' + e.getContentString()
        // messages.scrollTop = messages.scrollHeight;
        console.log(`message :${e.getContentString()}`);
        callEngageTime(e.getContentString());
     		}

    default:
      break;
  }
}

answercall = () => {
  console.log("answering call");
  Ring.pause();
  if (oSipSessionCall) {
    // txtCallStatus.innerHTML = "<i>Connecting...</i>";
    const audioRemote = document.getElementById("audio-remote");
    if (audioRemote) {
      audioRemote.autoplay = true;
      audioRemote.muted = false;
      audioRemote.volume = 1.0;
    }
    oSipSessionCall.accept(oConfigCall);
    // Notify Vue component that call was answered
    window.sipEventBridge.emit('callAnswered', {
      timestamp: new Date().toISOString(),
      status: 'accepted'
    });
    // SelPresence.value='Busy';
  }
};

rejectcall = () => {
  console.log("reject call");
  Ring.pause();
  // btnCall.value = 'Dial';
  oSipSessionCall.reject(oConfigCall);
  // Notify Vue component that call was rejected
  window.sipEventBridge.emit('callRejected', {
    timestamp: new Date().toISOString(),
    reason: 'user_declined',
    status: 'rejected'
  });

  // if (oSipSessionCall) {
  //   oSipSessionCall.reject();
    
  //   // Notify Vue component that call was rejected
  //   window.sipEventBridge.emit('callRejected', {
  //     timestamp: new Date().toISOString(),
  //     reason: 'user_declined',
  //     status: 'rejected'
  //   });
    
  //   // Reset call session
  //   oSipSessionCall = null;
  // }
};

function uiOnConnectionEvent(b_connected, b_connecting) {
  // should be enum: connecting, connected, terminating, terminated
  // btnRegister.disabled = b_connected || b_connecting;
  // btnUnRegister.disabled = !b_connected && !b_connecting;
  // btnCall.disabled = !(
  //   b_connected &&
  //   tsk_utils_have_webrtc() &&
  //   tsk_utils_have_stream()
  // );
  // txtPhoneNumber.disabled = !b_connected && !b_connecting;
  // btnHangUp.disabled = !oSipSessionCall;
  // btnTransfer.disabled = !oSipSessionCall;
  // btnMuteUnmute.disabled = !oSipSessionCall;
  // btnHoldResume.disabled = !oSipSessionCall;

  //update presence
  if (b_connected || b_connecting){
    // SelPresence.value='Idle';
    sipPublish('open', 'Idle', 'I am Idle');
  }
  if (!b_connected && !b_connecting){
      // SelPresence.value='Offline';
      sipPublish('closed', 'Offline', 'I am not Registered');
  }
}

// makes a call (SIP INVITE)
function sipCall(s_type, phoneNumber) {
  console.log(`stype : ${s_type} \n phone number : ${phoneNumber}`);
  if (
    oSipStack &&
    !oSipSessionCall &&
    !tsk_string_is_null_or_empty(phoneNumber)
    // !tsk_string_is_null_or_empty(txtPhoneNumber.value)
  ) {
    // btnCall.disabled = true;
    // btnHangUp.disabled = false;

    // create call session
    oSipSessionCall = oSipStack.newSession(s_type, oConfigCall);
    // make call
    // if (oSipSessionCall.call(txtPhoneNumber.value) != 0) {
    console.log(`oSipSessionCall : `)
    if (oSipSessionCall.call(phoneNumber) != 0) {
      oSipSessionCall = null;
      // txtCallStatus.value = "Failed to make call";
      // btnCall.disabled = false;
      // btnHangUp.disabled = true;
      return;
    }
  } else if (oSipSessionCall) {
    // txtCallStatus.innerHTML = "<i>Connecting...</i>";
    oSipSessionCall.accept(oConfigCall);
  }
}

//make a transfer
function sipTransfer() {

    if (oSipSessionCall) {
        if (!tsk_string_is_null_or_empty(txtPhoneNumber.value)) {
            // btnTransfer.disabled = true;
            if (oSipSessionCall.transfer(txtPhoneNumber.value) != 0) {
                // txtCallStatus.innerHTML = '<i>Call transfer failed</i>';
                // btnTransfer.disabled = false;
                return;
            }
            // txtCallStatus.innerHTML = '<i>Transfering the call...</i>';
        }
    }
    else{
    	// txtCallStatus.innerHTML = 'No session running';
    }}

//call hangup
function sipHangUp() {
  if (oSipSessionCall) {
    // txtCallStatus.innerHTML = "<i>Terminating the call...</i>";
    // btnCall.disabled = false;
    // btnCall.value = 'Dial';
    // btnHangup.disabled = true;
    // btnTransfer.disabled = true;
    // dtmfkeys.hidden = true;
    oSipSessionCall.hangup({
      events_listener: { events: "*", listener: onSipEventSession },
    });
  }
}

var onSipEventSession = function (e) {
    // txtSipEvent.value = txtSipEvent.value + '\n' + e.type;
    // txtSipEvent.scrollTop = txtSipEvent.scrollHeight;
  tsk_utils_log_info("==session event = " + e.type);

  switch (e.type) {
    case "connecting":
    case "connected": {
      var bConnected = e.type == "connected";
      if (e.session == oSipSessionRegister) {
        uiOnConnectionEvent(bConnected, !bConnected);
        // txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
        console.log(`event description 1: ${e.description}`);
      } else if (e.session == oSipSessionCall) {
        // btnHangUp.value = "HangUp";
        // btnCall.disabled = true;
        // btnHangUp.disabled = false;
        // btnTransfer.disabled = false;
        // dtmfkeys.hidden = false;
        // btnHoldResume.disabled = false;
        // btnMuteUnmute.disabled = false;

        (video_local = document.getElementById("video-local")),
          (video_remote = document.getElementById("video-remote")),
          (audio_remote = document.getElementById("audio-remote")),
          (console.log(`event description 2: ${e.description}`));
          // (txtCallStatus.innerHTML = "<i>" + e.description + "</i>");
      }
      break;
    }
    case "terminating":
    case "terminated": {
      if (e.session == oSipSessionRegister) {
        uiOnConnectionEvent(false, false);

        oSipSessionCall = null;
        oSipSessionRegister = null;

        // txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
      } else if (e.session == oSipSessionCall) {
        uiCallTerminated(e.description);
      }
      break;
    } // 'terminating' | 'terminated'
    case "m_stream_video_local_added":

    case "m_stream_video_local_removed":

    case "m_stream_video_remote_added":
      {
        if (e.session == oSipSessionCall) {
          console.log("remote video started now")
        }
        break;
      }

    case "m_stream_video_remote_removed":

    case "m_stream_audio_local_added":
    case "m_stream_audio_local_removed":
    case "m_stream_audio_remote_added":
    	console.log('Call Audio added time : '+ (CallEarlyMedia - window.performance.now())/1000 + ' sec');
    	CallEarlyMedia = null;
    case "m_stream_audio_remote_removed":
    case "i_ect_new_call":

    case "i_ao_request": {
      if (e.session == oSipSessionCall) {
        var iSipResponseCode = e.getSipResponseCode();
        if (iSipResponseCode == 180 || iSipResponseCode == 183) {
          // txtCallStatus.innerHTML = "<i>Remote ringing...</i>";
          console.log(`Remote ringing...`);
        }
      }
      break;
    }

    case "m_early_media":
    	CallEarlyMedia = window.performance.now();
    case "o_ect_accepted": {
      if (e.session == oSipSessionCall) {
        // txtCallStatus.innerHTML = "<i>Call transfer accepted</i>";
        console.log(`o_ect_accepted : Call transfer accepted`);
      }
      break;
    }
    case "o_ect_completed":
    case "i_ect_completed":
    case 'o_ect_failed':
    case 'i_ect_failed':

    case 'o_ect_notify':
    case 'i_ect_notify':

    case 'i_ect_requested':
  }
};

function uiCallTerminated(s_description) {
  // btnHangUp.value = 'HangUp';
  // btnHoldResume.value = 'Hold';
  // btnMuteUnmute.value = "Mute";
  // btnMuteUnmute.disabled = true;
  // btnHoldResume.disabled = true;
  // btnCall.disabled = false;
  // btnHangUp.disabled = true;

  oSipSessionCall = null;

  // Notify Vue component about call termination
  window.sipEventBridge.emit('callTerminated', {
    description: s_description,
    timestamp: new Date().toISOString()
  });
  // txtCallStatus.innerHTML = "<i>" + s_description + "</i>";

  setTimeout(function () {
    if (!oSipSessionCall) {
      // console.log("&nbsp");
      console.log("Call session cleared");
      // txtCallStatus.innerHTML = "&nbsp";
    }
  }, 2500);
}

function callEngageTime(sms){
	sms_ = JSON.parse(sms);
	if(sms_){
		st = sms_['call_status'];
		if (st == 'HANGUP'){
			CallHangupEpoch = sms_['t'];
			callDuration = (CallHangupEpoch - CallEarlyEpoch) / 1000000;
			CallProfileEpoch = null;
			CallHangupEpoch = null;
			CallEarlyEpoch = null;
			console.log('Call duration : ' + callDuration + ' sec');
		}
		if (st =='EARLY'){
			CallBeginEpoch = sms_['t'];
		}
		if (st == 'PROFILE'){
			CallEngageEpoch = sms_['t'];
      CallBeginEpoch = sms_['t'];
			console.log('Call Establishment time : ' + ((CallEngageEpoch - CallBeginEpoch)/1000000) + ' sec');
		}		
	}
}

function sipSendDTMF(c) {
            if (oSipSessionCall && c) {
                if (oSipSessionCall.dtmf(c) == 0) {
                    try { dtmfTone.play(); } catch (e) { }
                }
            }
        }

var onPublishEvent = function(e){
  if(e.type == 'connected' || e.type == 'connecting'){
    console.log(e.type);
    window.sipEventBridge.emit('connectionStatus', {
      connected: e.type === 'connected',
      // error: bFailure || "something went wrong onPublishEvent",
      description: e.description
    });
    // txtPresenceStatus.innerHTML = '<i> Publish Presence state :<b>' + e.type + '<b></i>&nbsp State : <b>' + SelPresence.value + '<b>';
  }
  console.log('publishEvent:', e);
}

function sipPublish(pRpid, pStatus, pNote){
    if (oSipStack && pRpid && pStatus && pNote) {
        var session = oSipStack.newSession('publish');
        var contentType = 'application/pidf+xml';

        var content = '<?xml version="1.0" encoding="ISO-8859-1"?>' +
           '<presence xmlns="urn:ietf:params:xml:ns:pidf"' +
           'xmlns:dm="urn:ietf:params:xml:ns:pidf:data-model"' +
           'xmlns:rpid="urn:ietf:params:xml:ns:pidf:rpid"' +
           'xmlns:c="urn:ietf:params:xml:ns:pidf:cipid" entity=' + sipURI + '>' +
           '<tuple id=' + makeId() + '><status><basic>' + pStatus + '</basic></status></tuple>' +
           '<dm:person id=' + makeId() + '><rpid:activities><rpid:' + pRpid + '/>' + pNote + '</rpid:activities>' +
           '<dm:note>' + pNote + '</dm:note></dm:person>' +
           '</presence>';
        session.publish(content, contentType, {
            expires: 200, events_listener: { events: '*', listener: onPublishEvent },
            sip_caps: [
                { name: '+g.oma.sip-im' },
                { name: '+sip.ice' },
                { name: 'language', value: '\"en\"' }
                ],
        sip_headers: [
            { name: 'Event', value: 'presence' },
            { name: 'Organization', value: 'PRABHAT SERVICES' }
            ]
        });
    } else{
        console.log('Not yet ready to Publish');
    }
}

function makeId(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
}

var userStatusList={};
var onSubscriptionEvent = function(e){
    console.log('subscriptionEvent:', e.type);
    if(e.type == 'i_notify'){
        console.log('NOTIFY content = ' + e.getContentString());
        console.log('NOTIFY content-type = ' + e.getContentType());

        var subUserStatus = subUserNote = subUserURI = '';
        var parser = new DOMParser();
        var xmlDoc = parser ? parser.parseFromString(e.getContentString(), "text/xml") : null;
        var presenceNode = xmlDoc ? xmlDoc.getElementsByTagName ("presence")[0] : null;
        if(presenceNode){
            var entityUri = presenceNode.getAttribute ("entity");
            var tupleNode = presenceNode.getElementsByTagName ("tuple")[0];
            var dmNode = presenceNode.getElementsByTagName("dm:person")[0];
            if(entityUri && tupleNode){
                subUserURI = entityUri;
                var statusNode = tupleNode.getElementsByTagName("status")[0];
                if(statusNode){
                    var basicNode = statusNode.getElementsByTagName("basic")[0];
                    if(basicNode){
                        //console.info('Presence notification: Uri = ' + entityUri + ' status = ' + basicNode.textContent);
                        subUserStatus = basicNode.textContent;
                    }
                }
            }
            if(dmNode){
                var noteNode = dmNode.getElementsByTagName("dm:note")[0];
                if (noteNode){subUserNote = noteNode.textContent;}
            }
        }
        console.log('subUserURI :' + subUserURI + ', subUserStatus : ' + subUserStatus + ', subUserNote : ' + subUserNote);
        if(subUserURI in userStatusList){
            userStatusList[subUserURI]['status'] = subUserStatus;
            userStatusList[subUserURI]['note'] = subUserNote;
        }else{
            userStatusList[subUserURI] = {'status': subUserStatus, 'note': subUserNote};
        }
    }
}

var subscriptionSession;

function sipSubscribe(sip_id){
    if (Object.keys(userStatusList).toString().indexOf(sip_id) > 0){
        console.log('Already subscribed');
        return;
    }
    subscriptionSession = oSipStack.newSession('subscribe',
            {
                expires: 200, events_listener: { events: '*', listener: onSubscriptionEvent },
                sip_headers: [
                                { name: 'Event', value: 'presence' },
                                { name: 'Accept', value: 'application/pidf+xml' }],
                sip_caps: [
                            { name: '+g.oma.sip-im', value: null },
                            { name: '+audio', value: null },
                            { name: 'language', value: '\"en\"' }]
            });
    subscriptionSession.subscribe(sip_id);
}

function sipUserStatus(sip_id, action){
    if(!oSipSessionCall){
        console.log('No running session found. Should be called while in call');
    }else{
        if (action == 'status' || action == 'rpid'){
            oSipSessionCall.info(action + " */" + sip_id, 'application/text');
        }else{
            console.log('sipUserStatus : Wrong action. Must be "status" or "rpid"');
        }

    }
}
// window.sipFunctions = {
//   answercall,
//   rejectcall,
//   sipCall,
//   sipHangUp,
//   sipRegister,
//   sipUnRegister,
//   sipToggleMute,
//   sipToggleHoldResume
// };