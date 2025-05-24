<template>
  <div class="sip-client">
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
        <button @click="hangupCall" class="btn btn-danger">
          📞 Hang Up
        </button>
        <button @click="toggleMute" class="btn btn-secondary">
          {{ isMuted ? '🔊 Unmute' : '🔇 Mute' }}
        </button>
        <button @click="toggleHold" class="btn btn-secondary">
          {{ isOnHold ? '▶️ Resume' : '⏸️ Hold' }}
        </button>
      </div>
    </div>
    <!-- Call History -->
    <div class="call-history">
      <h4>Recent Calls</h4>
      <ul>
        <li v-for="call in callHistory" :key="call.id">
          {{ call.remoteNumber }} - {{ call.status }} - {{ formatCallTime(call.timestamp) }}
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

<script>
export default {
  name: "Phone_UI",
  data() {
    return {
      dialedNumber: "",
      callState: "idle", // 'idle', 'ringing', 'talking'
      tenantPartitionKey: "kedar",
      bullforcePstn: {
        FS_DISPLAY: "",
        FS_IMPU: "",
        FS_IMPI: "",
        FS_SECRET: "",
        FS_REALM: "",
        FS_WS_PROXY_URL_INT: "",
        FS_WS_PROXY_URL_EXT: "",
        FS_OUTBOUND_PROXY_URL: "",
        FS_ICE_SERVERS: "",
      },
      incomingCall: {
        show: false,
        remoteNumber: "",
        timestamp: null,
        sessionId: null,
      },

      // Active call state
      activeCall: {
        show: false,
        remoteNumber: "",
        startTime: null,
      },

      // Call controls state
      callProcessing: false,
      isMuted: false,
      isOnHold: false,
      callDuration: "00:00",

      // Registration state
      registrationStatus: "Disconnected",

      // Call history
      callHistory: [],
      callTimer: null,
    };
  },
  mounted() {
    // if (window.someAdapterFunction) {
    //   window.someAdapterFunction();
    // }
    // if (window.SIPml) {
    // // Use SIPml functions
    // }
    // if(window)
    this.initializeSIPBridge();
    this.$nextTick(() => {
      setTimeout(() => {
        this.getSecrets();
      }, 100);
    });
  },
  beforeUnmount() {
    this.cleanupSIPBridge();
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
  },
  computed: {
    canUseKeypad() {
      return this.callState === "idle" || this.callState === "talking";
    },
    statusText() {
      switch (this.callState) {
        case "idle":
          return "Ready to dial";
        case "ringing":
          return "Calling...";
        case "talking":
          return "Connected - Use keypad for IVR";
        default:
          return "Ready to dial";
      }
    },
    statusClass() {
      return {
        "status-idle": this.callState === "idle",
        "status-ringing": this.callState === "ringing",
        "status-talking": this.callState === "talking",
      };
    },
  },
  methods: {
    initializeSIPBridge() {
      // Check if SIP bridge is available
      if (!window.sipEventBridge) {
        console.error(
          "SIP Event Bridge not available. Make sure server.js is loaded."
        );
        return;
      }

      // Register event listeners
      window.sipEventBridge.on("incomingCall", this.handleIncomingCall);
      window.sipEventBridge.on("callAnswered", this.handleCallAnswered);
      window.sipEventBridge.on("callRejected", this.handleCallRejected);
      window.sipEventBridge.on("callTerminated", this.handleCallTerminated);
      window.sipEventBridge.on("connectionStatus", this.handleConnectionStatus);
      window.sipEventBridge.on(
        "registrationAttempt",
        this.handleRegistrationAttempt
      );

      console.log("SIP Bridge initialized successfully");
    },
    cleanupSIPBridge() {
      if (window.sipEventBridge) {
        window.sipEventBridge.off("incomingCall", this.handleIncomingCall);
        window.sipEventBridge.off("callAnswered", this.handleCallAnswered);
        window.sipEventBridge.off("callRejected", this.handleCallRejected);
        window.sipEventBridge.off("callTerminated", this.handleCallTerminated);
        window.sipEventBridge.off(
          "connectionStatus",
          this.handleConnectionStatus
        );
        window.sipEventBridge.off(
          "registrationAttempt",
          this.handleRegistrationAttempt
        );
      }
    },
    async getSecrets() {
      const response = await fetch(
        "http://localhost:8090/nexus/phone/v1/register",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            tnt: this.tenantPartitionKey,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      data.bullforcePstn.FS_DISPLAY = "kedar";

      this.bullforcePstn = data.bullforcePstn;
      this.callSipRegister();
    },
    callSipRegister() {
      try {
        if (typeof window.sipRegister === "function") {
          window.sipRegister(this.bullforcePstn);
        } else {
          console.warn("sipRegister function is not available");
        }
      } catch (error) {
        console.error("Error calling sipRegister:", error);
      }
    },
    handleIncomingCall(data) {
      console.log("Incoming call received:", data);

      this.incomingCall = {
        show: true,
        remoteNumber: data.remoteNumber,
        timestamp: data.timestamp,
        sessionId: data.sessionId,
      };

      // Add to call history
      this.addToCallHistory(data.remoteNumber, "incoming", data.timestamp);
    },
    handleCallAnswered(data) {
      console.log("Call answered:", data);

      this.incomingCall.show = false;
      this.activeCall = {
        show: true,
        remoteNumber: this.incomingCall.remoteNumber,
        startTime: new Date(),
      };

      this.callProcessing = false;
      this.startCallTimer();

      // Update call history
      this.updateCallHistory("answered");
    },
    handleCallRejected(data) {
      console.log("Call rejected:", data);

      this.incomingCall.show = false;
      this.callProcessing = false;

      // Update call history
      this.updateCallHistory("rejected");
    },

    handleCallTerminated(data) {
      console.log("Call terminated:", data);

      this.incomingCall.show = false;
      this.activeCall.show = false;
      this.callProcessing = false;
      this.isMuted = false;
      this.isOnHold = false;

      if (this.callTimer) {
        clearInterval(this.callTimer);
        this.callTimer = null;
      }

      // Update call history
      this.updateCallHistory("terminated");
    },
    handleConnectionStatus(data) {
      console.log("Connection status:", data);
      this.registrationStatus = data.connected ? "Connected" : "Disconnected";
    },
    handleRegistrationAttempt(data) {
      console.log("Registration attempt:", data);
      this.registrationStatus = "Connecting...";
    },

    // === CALL ACTIONS ===
    answerCall() {
      console.log("Answering call...");
      this.callProcessing = true;
      try {
        if (typeof window.answercall === "function") {
          window.answercall();
        } else {
          console.warn("answercall function is not available");
          this.callProcessing = false;
        }
      } catch (error) {
        console.error("Error calling answercall:", error);
      }
    },

    rejectCall() {
      console.log("Rejecting call...");
      this.callProcessing = true;
      try {
        if (typeof window.rejectcall === "function") {
          window.rejectcall();
        } else {
          console.warn("rejectcall function is not available");
        }
      } catch (error) {
        console.error("Error calling rejectcall:", error);
      }
    },

    hangupCall() {
      console.log("Hanging up call...");

      if (typeof window.sipHangUp === "function") {
        window.sipHangUp();
      } else {
        console.error("Hangup function not available");
      }
      this.callState = "idle";
      this.$emit("call-ended", this.dialedNumber);
    },

    toggleMute() {
      try {
        if (typeof window.sipToggleMute === "function") {
          window.sipToggleMute();
          this.isMuted = !this.isMuted;
        } else {
          console.warn("sipToggleMute function is not available");
        }
      } catch (error) {
        console.error("Error calling sipToggleMute:", error);
      }
    },

    toggleHold() {
      try {
        if (typeof window.sipToggleHoldResume === "function") {
          window.sipToggleHoldResume();
          this.isOnHold = !this.isOnHold;
        } else {
          console.warn("sipToggleHoldResume function is not available");
        }
      } catch (error) {
        console.error("Error calling sipToggleHoldResume:", error);
      }
    },
    // testJSFunction() {
    //   this.callJSFunction();
    // },
    addDigit(digit) {
      if (this.callState === "talking") {
        // IVR response - you can emit an event or handle IVR logic here
        this.$emit("ivr-input", digit);
        console.log("IVR input:", digit);
      } else if (this.callState === "idle") {
        this.dialedNumber += digit;
      }
    },
    removeDigit() {
      if (this.callState === "idle" && this.dialedNumber.length > 0) {
        this.dialedNumber = this.dialedNumber.slice(0, -1);
      }
    },
    makeCall() {
      if (this.dialedNumber && this.callState === "idle") {
        this.callState = "ringing";
        this.$emit("call-initiated", this.dialedNumber);
        try {
          if (typeof window.sipCall === "function") {
            window.sipCall("call-audio", this.dialedNumber);
          } else {
            console.warn("sipCall function is not available");
          }
        } catch (error) {
          console.error("Error calling sipCall:", error);
        }
      }
    },
    // hangupCall() {
    //   if (this.callState !== "idle") {
    //     try {
    //       if (typeof window.sipHangUp === "function") {
    //         window.sipHangUp();
    //       } else {
    //         console.warn("sipHangUp function is not available");
    //       }
    //     } catch (error) {
    //       console.error("Error calling sipHangUp:", error);
    //     }
    //     const previousState = this.callState;
    //     this.callState = "idle";
    //     this.$emit("call-ended", { previousState, number: this.dialedNumber });
    //     this.dialedNumber = "";
    //   }
    // },
    // === UTILITY METHODS ===
    formatCallTime(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    },

    startCallTimer() {
      this.callTimer = setInterval(() => {
        if (this.activeCall.startTime) {
          const duration = Math.floor(
            (new Date() - this.activeCall.startTime) / 1000
          );
          const minutes = Math.floor(duration / 60)
            .toString()
            .padStart(2, "0");
          const seconds = (duration % 60).toString().padStart(2, "0");
          this.callDuration = `${minutes}:${seconds}`;
        }
      }, 1000);
    },

    addToCallHistory(remoteNumber, status, timestamp) {
      this.callHistory.unshift({
        id: Date.now(),
        remoteNumber,
        status,
        timestamp,
      });

      // Keep only last 10 calls
      if (this.callHistory.length > 10) {
        this.callHistory = this.callHistory.slice(0, 10);
      }
    },

    updateCallHistory(newStatus) {
      if (this.callHistory.length > 0) {
        this.callHistory[0].status = newStatus;
      }
    },
  },
};
</script>

<style scoped>
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
