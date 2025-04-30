import axios from '@app/plugins/axios'
import { defineStore } from 'pinia'

export const useProjectStore = defineStore('ProjectStore', {
  actions: {
    // 👉 Fetch all project
    fetchProjects() {
      return axios.get('/dashboard/analytics/projects')
    },
  },
})
