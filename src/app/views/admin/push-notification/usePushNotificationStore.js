import axios from "@app/plugins/axios";
import { defineStore } from "pinia";

export const usePushNotificationStore = defineStore("PushNotificationStore", {
  state: () => ({}),
  getters: {},
  actions: {
    // 👉 Fetch Simple Notifications
    fetchSimpleNotifications(params) {
      let res = {
        results: [],
      };
      return Promise.resolve(res);
    },

    // 👉 Send Bulk Notification
    sendBulk(params) {
      return axios.post("/pushapp/api/send-notification-bulk", params);
    },
  },
});
