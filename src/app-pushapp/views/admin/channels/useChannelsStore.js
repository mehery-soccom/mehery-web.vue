import axios from "@app/plugins/axios";
import { defineStore } from "pinia";

export const useChannelsStore = defineStore("ChannelsStore", {
  state: () => ({
    channels: [],
  }),
  getters: {
    channelsCount: (state) => state.channels.length,
  },
  actions: {
    // 👉 Fetch all Channels
    async fetchChannels() {
      let apiRes = await axios.get("pushapp/api/channels");
      this.channels = apiRes.data.channels;
      let res = {
        results: apiRes.data.channels,
        data: {
          total: apiRes.data.total_channels,
          page: 1,
        },
      };
      console.log(res);
      return res;
    },

    // 👉 Fetch single Channel
    fetchChannel({ id }) {
      return axios.get(`pushapp/api/channel/${id}`);
    },

    // 👉 Create Channel
    createChannel(params) {
      return axios.post("pushapp/api/channel", params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // 👉 Update Channel
    updateChannel(id, params) {
      return axios.put(`pushapp/api/channel/${id}`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // 👉 Update Platform
    updatePlatform({ channel_id, platform_id }, params) {
      return axios.put(
        `pushapp/api/channel/${channel_id}/platform/${platform_id}/deactivate`,
        params
      );
    },

    // 👉 Delete Channel
    deleteChannel({ id }) {
      return axios.delete(`pushapp/api/channel/${id}?user_id=user123`);
    },
  },
});
