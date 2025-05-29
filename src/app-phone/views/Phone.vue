<script setup>
import axios from "@/app-phone/plugins/axios";
import { REMOTE_JS_URL } from "@core/constants";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

import dtmfTone from "@/app-phone/assets/sounds/dtmf.wav";
import ringbacktone from "@/app-phone/assets/sounds/ringbacktone.wav";
import ringtone from "@/app-phone/assets/sounds/ringtone.wav";



const dialedNumber = ref("");
const callState = ref("idle"); // 'idle', 'ringing', 'talking'
const tenantPartitionKey = ref("kedar");
const bullforcePstn = ref({
  FS_DISPLAY: "",
  FS_IMPU: "",
  FS_IMPI: "",
  FS_SECRET: "",
  FS_REALM: "",
  FS_WS_PROXY_URL_INT: "",
  FS_WS_PROXY_URL_EXT: "",
  FS_OUTBOUND_PROXY_URL: "",
  FS_ICE_SERVERS: "",
});
const incomingCall = ref({
  show: false,
  remoteNumber: "",
  timestamp: null,
  sessionId: null,
});

// Active call state
const activeCall = ref({
  show: false,
  remoteNumber: "",
  startTime: null,
});

// Call controls state
const callProcessing = ref(false);
const isMuted = ref(false);
const isOnHold = ref(false);
const callDuration = ref("00:00");

// Registration state
const registrationStatus = ref("Disconnected");

// Call history
const callHistory = ref([]);
const callTimer = ref(null);

// Computed properties
const canUseKeypad = computed(() => {
  return callState.value === "idle" || callState.value === "talking";
});

const statusText = computed(() => {
  switch (callState.value) {
    case "idle":
      return "Ready to dial";
    case "ringing":
      return "Calling...";
    case "talking":
      return "Connected - Use keypad for IVR";
    default:
      return "Ready to dial";
  }
});

const statusClass = computed(() => {
  return {
    "status-idle": callState.value === "idle",
    "status-ringing": callState.value === "ringing",
    "status-talking": callState.value === "talking",
  };
});

// Methods
const initializeSIPBridge = () => {
  // Check if SIP bridge is available
  if (!window.sipEventBridge) {
    console.error(
      "SIP Event Bridge not available. Make sure server.js is loaded."
    );
    return;
  }

  // Register event listeners
  window.sipEventBridge.on("incomingCall", handleIncomingCall);
  window.sipEventBridge.on("callAnswered", handleCallAnswered);
  window.sipEventBridge.on("callRejected", handleCallRejected);
  window.sipEventBridge.on("callTerminated", handleCallTerminated);
  window.sipEventBridge.on("connectionStatus", handleConnectionStatus);
  window.sipEventBridge.on("registrationAttempt", handleRegistrationAttempt);

  console.log("SIP Bridge initialized successfully");
};

const cleanupSIPBridge = () => {
  if (window.sipEventBridge) {
    window.sipEventBridge.off("incomingCall", handleIncomingCall);
    window.sipEventBridge.off("callAnswered", handleCallAnswered);
    window.sipEventBridge.off("callRejected", handleCallRejected);
    window.sipEventBridge.off("callTerminated", handleCallTerminated);
    window.sipEventBridge.off("connectionStatus", handleConnectionStatus);
    window.sipEventBridge.off("registrationAttempt", handleRegistrationAttempt);
  }
};

const getSecrets = async () => {
  //   const response = await fetch(
  //     "http://localhost:8090/nexus/phone/v1/register",
  //     {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         tnt: tenantPartitionKey.value,
  //       },
  //     }
  //   );
  //   if (!response.ok) {
  //     throw new Error(`Error: ${response.status} - ${response.statusText}`);
  //   }

  try {
    const response = await axios.get("/v1/register", {
      headers: {
        tnt: tenantPartitionKey.value,
      },
    });
    const data = response.data;
    bullforcePstn.value = {
      ...data.bullforcePstn,
      FS_DISPLAY: "kedar",
    };
  } catch (error) {
    console.error(error);

    bullforcePstn.value = {};
  } finally {
    console.log(`bullforcePstn : ${JSON.stringify(bullforcePstn.value)}`);
    console.log(`Sip registered called`);
    callSipRegister();
  }
};

const callSipRegister = () => {
  try {
    if (typeof window.sipRegister === "function") {
      window.sipRegister(bullforcePstn.value);
    } else {
      console.warn("sipRegister function is not available");
    }
  } catch (error) {
    console.error("Error calling sipRegister:", error);
  }
};

const handleIncomingCall = (data) => {
  console.log("Incoming call received:", data);

  incomingCall.value = {
    show: true,
    remoteNumber: data.remoteNumber,
    timestamp: data.timestamp,
    sessionId: data.sessionId,
  };

  // Add to call history
  addToCallHistory(data.remoteNumber, "incoming", data.timestamp);
};

const handleCallAnswered = (data) => {
  console.log("Call answered:", data);

  incomingCall.value.show = false;
  activeCall.value = {
    show: true,
    remoteNumber: incomingCall.value.remoteNumber,
    startTime: new Date(),
  };

  callProcessing.value = false;
  startCallTimer();

  // Update call history
  updateCallHistory("answered");
};

const handleCallRejected = (data) => {
  console.log("Call rejected:", data);

  incomingCall.value.show = false;
  callProcessing.value = false;

  // Update call history
  updateCallHistory("rejected");
};

const handleCallTerminated = (data) => {
  console.log("Call terminated:", data);

  incomingCall.value.show = false;
  activeCall.value.show = false;
  callProcessing.value = false;
  isMuted.value = false;
  isOnHold.value = false;

  if (callTimer.value) {
    clearInterval(callTimer.value);
    callTimer.value = null;
  }

  // Update call history
  updateCallHistory("terminated");
};

const handleConnectionStatus = (data) => {
  console.log("Connection status:", data);
  registrationStatus.value = data.connected ? "Connected" : "Disconnected";
};

const handleRegistrationAttempt = (data) => {
  console.log("Registration attempt:", data);
  registrationStatus.value = "Connecting...";
};

// === CALL ACTIONS ===
const answerCall = () => {
  console.log("Answering call...");
  callProcessing.value = true;
  try {
    if (typeof window.answercall === "function") {
      window.answercall();
    } else {
      console.warn("answercall function is not available");
      callProcessing.value = false;
    }
  } catch (error) {
    console.error("Error calling answercall:", error);
  }
};

const rejectCall = () => {
  console.log("Rejecting call...");
  callProcessing.value = true;
  try {
    if (typeof window.rejectcall === "function") {
      window.rejectcall();
    } else {
      console.warn("rejectcall function is not available");
    }
  } catch (error) {
    console.error("Error calling rejectcall:", error);
  }
};

const hangupCall = () => {
  console.log("Hanging up call...");

  if (typeof window.sipHangUp === "function") {
    window.sipHangUp();
  } else {
    console.error("Hangup function not available");
  }
  callState.value = "idle";
};

const toggleMute = () => {
  try {
    if (typeof window.sipToggleMute === "function") {
      window.sipToggleMute();
      isMuted.value = !isMuted.value;
    } else {
      console.warn("sipToggleMute function is not available");
    }
  } catch (error) {
    console.error("Error calling sipToggleMute:", error);
  }
};

const toggleHold = () => {
  try {
    if (typeof window.sipToggleHoldResume === "function") {
      window.sipToggleHoldResume();
      isOnHold.value = !isOnHold.value;
    } else {
      console.warn("sipToggleHoldResume function is not available");
    }
  } catch (error) {
    console.error("Error calling sipToggleHoldResume:", error);
  }
};

const addDigit = (digit) => {
  if (callState.value === "talking") {
    // IVR response - you can emit an event or handle IVR logic here
    console.log("IVR input:", digit);
  } else if (callState.value === "idle") {
    console.log(`I am clicked : ${digit}`);
    dialedNumber.value = `${dialedNumber.value}${digit}`;
    console.log(dialedNumber.value);
  }
};

const removeDigit = () => {
  if (callState.value === "idle" && dialedNumber.value.length > 0) {
    dialedNumber.value = dialedNumber.value.slice(0, -1);
  }
};

const makeCall = () => {
  if (dialedNumber.value && callState.value === "idle") {
    callState.value = "ringing";
    try {
      if (typeof window.sipCall === "function") {
        window.sipCall("call-audio", dialedNumber.value);
      } else {
        console.warn("sipCall function is not available");
      }
    } catch (error) {
      console.error("Error calling sipCall:", error);
    }
  }
};

// === UTILITY METHODS ===
const formatCallTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

const startCallTimer = () => {
  callTimer.value = setInterval(() => {
    if (activeCall.value.startTime) {
      const duration = Math.floor(
        (new Date() - activeCall.value.startTime) / 1000
      );
      const minutes = Math.floor(duration / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (duration % 60).toString().padStart(2, "0");
      callDuration.value = `${minutes}:${seconds}`;
    }
  }, 1000);
};

const addToCallHistory = (remoteNumber, status, timestamp) => {
  callHistory.value.unshift({
    id: Date.now(),
    remoteNumber,
    status,
    timestamp,
  });

  // Keep only last 10 calls
  if (callHistory.value.length > 10) {
    callHistory.value = callHistory.value.slice(0, 10);
  }
};

const updateCallHistory = (newStatus) => {
  if (callHistory.value.length > 0) {
    callHistory.value[0].status = newStatus;
  }
};
const setAttribute = (target, attrs) => {
  for (var key in attrs) {
    if (key == "href" || key == "src") {
      attrs[key] = window.__dynamic_base__ + attrs[key];
    }
    target.setAttribute(key, attrs[key]);
  }
  return target;
};
// const addPreloads = () => {
//   for (var i = 0; i < preloads.length; i++) {
//     var item = preloads[i];
//     var childNode = document.createElement(item.tagName);
//     setAttribute(childNode, item.attrs);

//     var parentElements = document.getElementsByTagName(item.parentTagName);
//     if (parentElements && parentElements.length > 0) {
//       parentElements[0].appendChild(childNode);
//     }
//   }
// };
// const preloads = [
//   {
//     parentTagName: "head",
//     tagName: "script",
//     attrs: { src: "/javascript/adapter.js" },
//   },
//   {
//     parentTagName: "head",
//     tagName: "script",
//     attrs: { src: "/javascript/SIPml-api-altered.js" },
//   },
//   {
//     parentTagName: "head",
//     tagName: "script",
//     attrs: { src: "/javascript/server.js" },
//   },
// ];
const preloads = [
  { src: "/javascript/adapter.js" },
  { src: "/javascript/SIPml-api-altered.js" },
  { src: "/javascript/server.js" },
];
const audioElements = [
  {
    parentTagName: "body",
    tagName: "audio",
    attrs: {
      id: "ringtone",
      loop: "",
      src: "/javascript/sounds/ringtone.wav",
    },
  },
  {
    parentTagName: "body",
    tagName: "audio",
    attrs: {
      id: "ringbacktone",
      loop: "",
      src: "/javascript/sounds/ringbacktone.wav",
    },
  },
  {
    parentTagName: "body",
    tagName: "audio",
    attrs: {
      id: "dtmfTone",
      src: "/javascript/sounds/dtmf.wav",
    },
  },
  {
    parentTagName: "body",
    tagName: "audio",
    attrs: {
      id: "audio-remote",
      autoplay: "autoplay",
      // src: "/javascript/sounds/dtmf.wav"
    },
  },
];
const addPreloads = async () => {
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${REMOTE_JS_URL}${src}`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

  // Wait for all scripts to load
  await Promise.all(preloads.map((s) => loadScript(s.src)));
};
const addAudioElements = async () => {
  for (const elementDef of audioElements) {
    const { parentTagName, tagName, attrs } = elementDef;

    const parent = document.querySelector(parentTagName);
    if (!parent) continue;

    const el = document.createElement(tagName);

    for (const [key, value] of Object.entries(attrs)) {
      if (value === "") {
        el.setAttribute(key, ""); // For boolean attrs like loop
      } else {
        el.setAttribute(key, value);
      }
    }

    parent.appendChild(el);
  }
};
// Lifecycle hooks
onMounted(async () => {
  console.log("Phone onMounted");

  await addPreloads();

  initializeSIPBridge();

  nextTick(() => {
    setTimeout(() => {
      getSecrets();
    }, 100);
  });
});

onBeforeUnmount(() => {
  cleanupSIPBridge();

  for (var i = 0; i < preloads.length; i++) {
    var item = preloads[i];
    // var childNode = document.createElement(item.tagName);
    // setAttribute(childNode, item.attrs);

    // var parentElements = document.getElementsByTagName(item.parentTagName);
    // if (parentElements && parentElements.length > 0) {
    //   parentElements[0].appendChild(childNode);
    // }
    const script = document.querySelector(`script[src="${item.src}"]`);
    if (script) {
      document.body.removeChild(script);
    }
  }

  if (callTimer.value) {
    clearInterval(callTimer.value);
  }
});
</script>

<template>
  <div class="sip-client">
    <audio id="audio-remote" autoplay="autoplay"></audio>
    <audio id="ringtone" loop :src="ringtone"></audio>
    <audio id="ringbacktone" loop :src="ringbacktone"></audio>
    <audio id="dtmfTone" :src="dtmfTone"></audio>
    <!-- <audio id="audio-remote" autoplay></audio>
    <audio id="ringtone" loop src="../assets/sounds/ringtone.wav"></audio>
    <audio id="ringbacktone" loop src="../assets/sounds/ringbacktone.wav"></audio>
    <audio id="dtmfTone" src="../assets/sounds/dtmf.wav"></audio> -->
    <!-- Registration Status -->
    <div class="registration-status">
      <p>Status: {{ registrationStatus }}</p>
    </div>
    <!-- Incoming Call Modal/Alert -->
    <div v-if="incomingCall.show" class="incoming-call-overlay">
      <div class="incoming-call-modal">
        <h3>Incoming Call</h3>
        <p class="caller-info">
          <strong>From: {{ incomingCall.remoteNumber }}</strong>
        </p>
        <p class="call-time">{{ formatCallTime(incomingCall.timestamp) }}</p>

        <div class="call-actions">
          <button
            @click="answerCall"
            class="btn btn-success answer-btn"
            :disabled="callProcessing"
          >
            <span v-if="!callProcessing">📞 Answer</span>
            <span v-else>Connecting...</span>
          </button>

          <button
            @click="rejectCall"
            class="btn btn-danger reject-btn"
            :disabled="callProcessing"
          >
            <span v-if="!callProcessing">❌ Reject</span>
            <span v-else>Rejecting...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Call Status -->
    <div v-if="activeCall.show" class="active-call-status">
      <h4>Call Active</h4>

      <p>Connected to: {{ activeCall.remoteNumber }}</p>
      <p>Duration: {{ callDuration }}</p>

      <div class="call-controls">
        <button @click="hangupCall" class="btn btn-danger">📞 Hang Up</button>
        <button @click="toggleMute" class="btn btn-secondary">
          {{ isMuted ? "🔊 Unmute" : "🔇 Mute" }}
        </button>
        <button @click="toggleHold" class="btn btn-secondary">
          {{ isOnHold ? "▶️ Resume" : "⏸️ Hold" }}
        </button>
      </div>
    </div>
    <!-- Call History -->
    <div class="call-history">
      <h4>Recent Calls</h4>
      <ul>
        <li v-for="call in callHistory" :key="call.id">
          {{ call.remoteNumber }} - {{ call.status }} -
          {{ formatCallTime(call.timestamp) }}
        </li>
      </ul>
    </div>
    <div class="dialer-container">
      <div class="display">
        <div class="number-display">{{ dialedNumber }}</div>
        <div class="status-display" :class="statusClass">{{ statusText }}</div>
      </div>

      <div class="keypad">
        <div class="keypad-row">
          <button
            class="key-button"
            @click="addDigit('1')"
            :disabled="!canUseKeypad"
          >
            1
          </button>
          <button
            class="key-button"
            @click="addDigit('2')"
            :disabled="!canUseKeypad"
          >
            2
          </button>
          <button
            class="key-button"
            @click="addDigit('3')"
            :disabled="!canUseKeypad"
          >
            3
          </button>
        </div>

        <div class="keypad-row">
          <button
            class="key-button"
            @click="addDigit('4')"
            :disabled="!canUseKeypad"
          >
            4
          </button>
          <button
            class="key-button"
            @click="addDigit('5')"
            :disabled="!canUseKeypad"
          >
            5
          </button>
          <button
            class="key-button"
            @click="addDigit('6')"
            :disabled="!canUseKeypad"
          >
            6
          </button>
        </div>

        <div class="keypad-row">
          <button
            class="key-button"
            @click="addDigit('7')"
            :disabled="!canUseKeypad"
          >
            7
          </button>
          <button
            class="key-button"
            @click="addDigit('8')"
            :disabled="!canUseKeypad"
          >
            8
          </button>
          <button
            class="key-button"
            @click="addDigit('9')"
            :disabled="!canUseKeypad"
          >
            9
          </button>
        </div>

        <div class="keypad-row">
          <button
            class="key-button"
            @click="addDigit('+')"
            :disabled="!canUseKeypad"
          >
            +
          </button>
          <button
            class="key-button"
            @click="addDigit('0')"
            :disabled="!canUseKeypad"
          >
            0
          </button>
          <button
            class="key-button backspace"
            @click="removeDigit"
            :disabled="callState !== 'idle'"
          >
            ⌫
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <button
          class="action-button call-button"
          @click="makeCall"
          :disabled="callState === 'ringing' || !dialedNumber"
        >
          📞 Call
        </button>

        <button
          class="action-button hangup-button"
          @click="hangupCall"
          :disabled="callState === 'idle'"
        >
          📱 Hang Up
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.call-history {
  margin-top: 30px;
}

.call-history ul {
  list-style: none;
  padding: 0;
}

.call-history li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
.active-call-status {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  margin: 20px 0;
}
.call-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
.sip-client {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.incoming-call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.incoming-call-modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.caller-info {
  font-size: 18px;
  margin: 15px 0;
}

.call-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}
.dialer-container {
  max-width: 320px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.display {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 20px;
  padding: 20px;
  text-align: center;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.number-display {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  min-height: 30px;
  word-break: break-all;
}

.status-display {
  font-size: 14px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.status-idle {
  background: #e3f2fd;
  color: #1976d2;
}

.status-ringing {
  background: #fff3e0;
  color: #f57c00;
  animation: pulse 1.5s infinite;
}

.status-talking {
  background: #e8f5e8;
  color: #2e7d32;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.keypad {
  margin-bottom: 20px;
}

.keypad-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.key-button {
  width: 90px;
  height: 60px;
  border: none;
  border-radius: 10px;
  background: #fff;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.key-button:hover:not(:disabled) {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.key-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.key-button:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.backspace {
  background: #ffebee !important;
  color: #d32f2f !important;
}

.backspace:hover:not(:disabled) {
  background: #ffcdd2 !important;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.action-button {
  flex: 1;
  height: 50px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.call-button {
  background: #4caf50;
  color: white;
}

.call-button:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.call-button:disabled {
  background: #c8e6c9;
  color: #81c784;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.hangup-button {
  background: #f44336;
  color: white;
}

.hangup-button:hover:not(:disabled) {
  background: #da190b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
}

.hangup-button:disabled {
  background: #ffcdd2;
  color: #ef9a9a;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}
</style>
