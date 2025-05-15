import axios from "@app/plugins/axios";
import { defineStore } from "pinia";

export const usePushNotificationStore = defineStore("PushNotificationStore", {
  state: () => ({
    buttonGroupList: [
      {
        label: "Yes | No",
        value: "CONFIRMATION_CATEGORY",
        fields: [
          { text: "Yes", id: "PUSHAPP_YES" },
          { text: "No", id: "PUSHAPP_NO" },
        ],
      },
      {
        label: "Accept | Reject",
        value: "RESPONSE_CATEGORY",
        fields: [
          { text: "Accept", id: "PUSHAPP_ACCEPT" },
          { text: "Reject", id: "PUSHAPP_REJECT" },
        ],
      },
      {
        label: "Subscribe | Unsubscribe",
        value: "SUBSCRIPTION_CATEGORY",
        fields: [
          { text: "Subscribe", id: "PUSHAPP_SUB" },
          { text: "Unsubscribe", id: "PUSHAPP_UNSUB" },
        ],
      },
      {
        label: "Buy | Sell",
        value: "TRANSACTION_CATEGORY",
        fields: [
          { text: "Buy", id: "PUSHAPP_BUY" },
          { text: "Sell", id: "PUSHAPP_SELL" },
        ],
      },
      {
        label: "View | Add",
        value: "CONTENT_CATEGORY",
        fields: [
          { text: "View", id: "PUSHAPP_VIEW" },
          { text: "Add", id: "PUSHAPP_ADD" },
        ],
      },
      {
        label: "Cart | Pay",
        value: "CHECKOUT_CATEGORY",
        fields: [
          { text: "Cart", id: "PUSHAPP_CART" },
          { text: "Pay", id: "PUSHAPP_PAY" },
        ],
      },
      {
        label: "Save | Submit",
        value: "FORM_ACTION_CATEGORY",
        fields: [
          { text: "Save", id: "PUSHAPP_SAVE" },
          { text: "Submit", id: "PUSHAPP_SUBMIT" },
        ],
      },
      {
        label: "Cancel | Delete",
        value: "DESTRUCTIVE_ACTION_CATEGORY",
        fields: [
          { text: "Cancel", id: "PUSHAPP_CANCEL" },
          { text: "Delete", id: "PUSHAPP_DELETE" },
        ],
      },
      {
        label: "Call | Email",
        value: "CONTACT_CATEGORY",
        fields: [
          { text: "Call", id: "PUSHAPP_CALL" },
          { text: "Email", id: "PUSHAPP_EMAIL" },
        ],
      },
    ],
  }),
  getters: {},
  actions: {
    // 👉 Fetch Simple Notifications
    async fetchSimpleNotifications() {
      let apiRes = await axios.get("/api/notifications");
      let res = {
        results: apiRes.data.data,
        data: {},
      };
      console.log(res);
      return res;
    },

    // 👉 Fetch Single Notification
    async fetchSimpleNotification({ id }) {
      return axios.get(`/api/notification/${id}`);
    },

    // 👉 Send Bulk Notification
    sendBulk(params) {
      return axios.post("/api/send-notification-bulk", params);
    },
  },
});
