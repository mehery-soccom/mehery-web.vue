import axios from "@app/plugins/axios";
import { defineStore } from "pinia";

export const useChannelsStore = defineStore("ChannelsStore", {
  state: () => ({
    channels: [
      {
        company_name: "Demo",
        company_id: "company_id_1",
        app_name: "agent app",
        app_id: "app_id_1",
        platforms: [
          {
            platform_id: "platform_id_1",
            platform_type: "ios", // ["ios", "android", "huawei"]
            bundle_id: "bundle_id_1",
            key_id: "", // Optional, only for iOS
            team_id: "", // Optional, only for iOS
            file_path: "",
          },
        ],
      },
      {
        company_name: "Demo",
        company_id: "company_id_1",
        app_name: "oa app",
        app_id: "app_id_2",
        platforms: [
          {
            platform_id: "platform_id_1",
            platform_type: "ios", // ["ios", "android", "huawei"]
            bundle_id: "bundle_id_1",
            key_id: "key_id_1", // Optional, only for iOS
            team_id: "team_id_1", // Optional, only for iOS
            file_path: "",
          },
          {
            platform_id: "platform_id_2",
            platform_type: "android", // ["ios", "android", "huawei"]
            bundle_id: "bundle_id_2",
            key_id: "", // Optional, only for iOS
            team_id: "", // Optional, only for iOS
            file_path: "",
          },
        ],
      },
    ],
  }),
  getters: {
    channelsCount: (state) => state.channels.length,
  },
  actions: {
    // 👉 Fetch all Channels
    fetchChannels(params) {
      //   return axios.get("apps/channels", { params });
      let res = {
        results: this.channels,
        data: {
          total: this.channelsCount,
          page: 1,
        },
      };
      return Promise.resolve(res);
    },

    // 👉 Fetch single Channel
    fetchChannel({ id }) {
      //   return axios.get(`/apps/channels/${id}`);
      let res = {
        data: this.channels.find((c) => c.app_id === id),
      };
      if (!res.data) return Promise.reject(res);
      return Promise.resolve(res);
    },

    // 👉 Create Channel
    createChannel(params) {
      return axios.post("/pushapp/api/channel", params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // 👉 Update Channel
    updateChannel({ id, ...params }) {
      //   return axios.patch(`/apps/channels/${id}`, { params });
      let res = {
        success: true,
      };
      const index = this.channels.findIndex((c) => c.app_id === id);
      if (index > -1) {
        this.channels[index] = {
          ...this.channels[index],
          ...params,
        };
      } else {
        res.success = false;
      }
      return Promise.resolve(res);
    },

    // 👉 Delete Channel
    deleteChannel({ id }) {
      //   return axios.delete(`/apps/channels/${id}`);
      let res = {
        success: true,
      };
      const index = this.channels.findIndex((c) => c.app_id === id);
      if (index > -1) {
        this.channels.splice(index, 1);
      } else {
        res.success = false;
      }
      return Promise.resolve(res);
    },
  },
});
