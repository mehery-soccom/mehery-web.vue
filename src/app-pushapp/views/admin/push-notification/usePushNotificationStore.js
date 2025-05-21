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
    templates: [],
    platformList: [
      { label: "IOS", value: "ios" },
      { label: "Android", value: "android" },
      { label: "Huawei", value: "huawei" },
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

    // 👉 Fetch all Templates
    async fetchTemplates() {
      let apiRes = await axios.get("/api/templates");
      this.templates = apiRes.data.results;
      let res = {
        results: apiRes.data.results || [
          {
            id: 1,
            code: "greeting",
            desc: "",
            type: "simple",
            category: "custom",
            lang: "en_US",
            createdBy: "tester",
            createdStamp: 1746683942788,
            options: {
              buttons: [],
            },
            model: {
              data: {
                user_name: "",
                rider_name: "",
                var1: "",
                var2: "",
              },
              contact: {},
              global: {},
              session: {},
            },
            style: {
              logo_url: "",
              image_url: "",
              line_1: `hi {{ user_name }}`,
              line_2: `{{ rider_name }} has picked your parcel`,
              line_3: `will be delivered in {{ var1 }} {{ var2 }}`,
              bg_color: "",
              bg_color_gradient: "",
              bg_color_gradient_dir: "",
              align: "left" || "right",
              progress_color: "no_value" || "#ffff",
            },
          },
          {
            id: 2,
            code: "delivery",
            desc: "",
            type: "styled",
            category: "custom",
            lang: "en_US",
            createdBy: "tester",
            createdStamp: 1746683942788,
            options: {
              buttons: [],
            },
            model: {
              data: {
                user_name: "",
                rider_name: "",
                var1: "",
                var2: "",
              },
              contact: {},
              global: {},
              session: {},
            },
            style: {
              logo_url: "",
              image_url: "",
              line_1: `hi {{ user_name }}`,
              line_2: `{{ rider_name }} has picked your parcel`,
              line_3: `will be delivered in {{ var1 }} {{ var2 }}`,
              bg_color: "",
              bg_color_gradient: "",
              bg_color_gradient_dir: "",
              align: "left" || "right",
              progress_color: "no_value" || "#ffff",
            },
          },
        ],
        data: {
          total: apiRes.data.pagination?.total,
          page: apiRes.data.pagination?.pageNo || 1,
        },
      };
      return res;
    },

    // 👉 Fetch single Template
    fetchTemplate({ id }) {
      return axios.get(`/api/templates/${id}`);
    },

    // 👉 Create Template
    createTemplate(params) {
      return axios.post("/api/templates", params);
    },

    // 👉 Update Template
    updateTemplate(id, params) {
      return axios.put(`/api/templates/${id}`, params);
    },

    // 👉 Delete Template
    deleteTemplate({ id }) {
      return axios.delete(`/api/templates/${id}`);
    },
  },
});
