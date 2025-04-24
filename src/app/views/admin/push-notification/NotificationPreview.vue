<template>
  <div :class="['phone-frame', platform]">
    <!-- Background -->
    <div :class="[platform + '-wallpaper']"></div>

    <!-- Notch and Top Bar -->
    <div v-if="platform === 'ios'" class="notch"></div>
    <div v-if="platform === 'ios'" class="ios-status-bar">
      <span class="carrier">Jio</span>
      <div class="status-icons">
        <span class="icon">📶</span>
        <span class="icon">📡</span>
        <span class="icon">🔋</span>
      </div>
    </div>

    <!-- Pixel-style Android status bar with camera notch -->
    <div v-if="platform === 'android'" class="android-notch"></div>
    <div v-if="platform === 'android'" class="android-status-bar">
      <div class="left-icons">
        <span class="icon">📶</span>
        <span class="icon">📡</span>
      </div>
      <div class="right-icons">
        <span class="icon">🔋</span>
        <span class="icon">🔔</span>
      </div>
    </div>

    <!-- Clock and Date -->
    <div :class="[platform + '-clock-block']">
      <div class="date">{{ currentDate }}</div>
      <div class="clock">{{ currentTime }}</div>
    </div>

    <!-- Notification Preview -->
    <transition name="fade-slide">
      <div v-if="showNotification" :class="['notification-preview', platform]">
        <div :class="[platform + '-content']">
          <div class="notification-header">
            <img
              v-if="form.logo_url"
              class="notification-image"
              :src="form.logo_url"
              alt="icon"
            />
            <div class="notification-text">
              <div class="notification-title-time">
                <div class="title" :title="form.title">
                  {{ (form.title || "Your title comes here").slice(0, 40)
                  }}{{ (form.title || "").length > 40 ? "..." : "" }}
                </div>
                <div class="notification-time">now</div>
              </div>
              <div class="notification-message-previ">
                <div
                  class="message"
                  :title="form.message"
                  :style="view === 'collapse' ? 'max-width:205px' : ''"
                >
                  {{ (form.message || "Your message comes here").slice(0, 90)
                  }}{{ (form.message || "").length > 90 ? "..." : "" }}
                </div>

                <div class="notification-previ">
                  <img
                    v-if="form.image_url && view === 'collapse'"
                    class="notification-previ-image"
                    :src="form.image_url"
                    alt="icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Long preview -->
          <div v-if="view === 'expand'" class="long-preview mt-4">
            <img
              v-if="form.image_url"
              class=""
              :src="form.image_url"
              alt="icon"
            />
          </div>

          <!-- Expanded content for Android -->
          <div
            v-if="
              ((platform === 'ios' && view === 'expand') ||
                platform === 'android') &&
              buttonGroupFields.length
            "
            class="expanded-content"
          >
            <div class="expanded-actions">
              <button
                v-for="item in buttonGroupFields"
                :key="item.text"
                class="cta-button"
              >
                {{ item.text }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bottom Icons -->
    <div v-if="platform === 'ios'" class="bottom-icons">
      <span class="fingerprint">🔓</span>
      <span class="camera">📷</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  form: Object,
  platform: {
    type: String,
    default: "ios",
  },
  view: {
    type: String,
    default: "collapse",
  },
  buttonGroupFields: {
    type: Array,
    default: [],
  },
});

const showNotification = ref(false);
const currentTime = ref("");
const currentDate = ref("");

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  currentDate.value = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

onMounted(() => {
  updateClock();
  setInterval(updateClock, 30000);
  showNotification.value = true;
});

watch(
  () => props.platform,
  () => {
    showNotification.value = false;
    setTimeout(() => (showNotification.value = true), 100);
  }
);

watch(
  () => props.view,
  () => {
    showNotification.value = false;
    setTimeout(() => (showNotification.value = true), 100);
  }
);
</script>

<style scoped lang="scss">
.phone-frame {
  width: 360px;
  height: 740px;
  border-radius: 42px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ios-wallpaper {
  position: absolute;
  inset: 0;
  background-image: url("@app/assets/images/pages/wallpaper_ios_1.png");
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.android-wallpaper {
  position: absolute;
  inset: 0;
  background-image: url("@app/assets/images/pages/wallpaper_android_1.png");
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.notch {
  width: 200px;
  height: 30px;
  background-color: black;
  border-radius: 0 0 18px 18px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.android-notch {
  width: 20px;
  height: 20px;
  background-color: black;
  border-radius: 10px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.carrier {
  width: 55px;
  text-align: center;
}

.ios-status-bar,
.android-status-bar {
  margin-top: 10px;
  z-index: 3;
  color: white;
  width: 100%;
  padding: 0 16px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .left-icons,
  .right-icons {
    display: flex;
    gap: 8px;
  }
}

.status-icons {
  display: flex;
  gap: 8px;
}

.ios-clock-block,
.android-clock-block {
  z-index: 2;
  text-align: center;
  margin-top: 32px;
  color: white;
}

.clock {
  font-size: 56px;
  font-weight: 600;
}

.date {
  font-size: 16px;
  margin-bottom: 4px;
}

.notification-preview {
  z-index: 2;
  border-radius: 18px;
  width: 92%;
  background-color: rgba(30, 30, 30, 0.94);
  color: white;
  padding: 14px 16px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.notification-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.notification-image {
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.notification-previ {
  height: 30px;
  // min-width: 30px;
}

.notification-previ-image {
  width: 30px;
  height: 30px;
  border-radius: 12px;
}

.notification-text {
  flex: 1;
}

.notification-title-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // margin-bottom: 4px;
}
.notification-message-previ {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // margin-bottom: 4px;
}

.notification-text .title {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 205px;
}

.notification-text .message {
  font-size: 13.5px;
  color: #ddd;
  line-height: 1.3;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  // max-width: 205px;
}

.notification-time {
  font-size: 12px;
  color: #aaa;
  white-space: nowrap;
  width: 30px;
  height: 22.5px;
  text-align: center;
}

.expanded-content {
  margin-top: 12px;
}

.expanded-actions {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.cta-button {
  width: 100%;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.long-preview {
  img {
    width: 100%;
    height: 150px;
  }
}

.bottom-icons {
  position: absolute;
  bottom: 18px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 28px;
  font-size: 20px;
  color: white;
  opacity: 0.85;
  z-index: 1;
}

.fade-slide-enter-active {
  animation: fadeSlide 0.4s ease-out;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
