import axios from "@app/plugins/axios";
import { defineStore } from "pinia";

export const usePushNotificationStore = defineStore("PushNotificationStore", {
  state: () => ({}),
  getters: {},
  actions: {
    // 👉 Send Bulk Notification
    sendBulk(params) {
      return axios.post("/pushapp/api/send-notification-bulk", params);
    },
  },
});
