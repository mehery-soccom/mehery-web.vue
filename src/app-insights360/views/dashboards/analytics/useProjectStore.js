import axios from "@app-insights360/plugins/axios";
import { defineStore } from "pinia";

export const useProjectStore = defineStore("ProjectStore", {
  actions: {
    // 👉 Fetch all project
    fetchProjects() {
      return axios.get("/dashboard/analytics/projects");
    },
    fetchChannels() {
      return axios.get(`/admin/admin/fetch-contact-type`);
    },
    fetchAgents() {
      return axios.get(`/admin/api/admins/agent?includeInActive=false`);
    },
    fetchTeams() {
      return axios.get(`/admin/api/admins/dept?includeInActive=false`);
    },
    fetchOpenChats(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/conversation-status/open?dateRange1=${start}&dateRange2=${end}`;
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchResolvedChats(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/conversation-status/resolved?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchSatScores(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/satisfaction-score?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchBotOpenChats(start, end, contact){
      let url = `/admin/nexus/admin/api/v1/dashboard/conversation-status/open?dateRange1=${start}&dateRange2=${end}&agent=BOT`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      return axios.get(url);
    },
    fetchBotResolvedChats(start, end, contact){
      let url = `/admin/nexus/admin/api/v1/dashboard/conversation-status/resolved?dateRange1=${start}&dateRange2=${end}&agent=BOT`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      return axios.get(url);
    },
    fetchBotSatScores(start, end, contact){
      let url = `/admin/nexus/admin/api/v1/dashboard/satisfaction-score?dateRange1=${start}&dateRange2=${end}&agent=BOT`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      return axios.get(url);
    },
    fetchLeadMsgs(start, end, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/lead-messenger?dateRange1=${start}&dateRange2=${end}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchStartLags(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/start-lag?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchAvgResponses(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/avg-response-time?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchAvgDurations(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/avg-duration?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchTotalConvs(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/all-conversations?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchUniqueConvs(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/unique-conversations?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchCampaignDatas(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/campaign-data?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
    fetchChartDatas(start, end, contact, agent, agentType){
      let url = `/admin/nexus/admin/api/v1/dashboard/charts?dateRange1=${start}&dateRange2=${end}`
      if(contact && contact != 'All Channels') url += `&contactType=${contact}`;
      if(agent && agentType && agent != 'all_teams') url += `&${agentType}=${agent}`;
      return axios.get(url);
    },
  },
});
