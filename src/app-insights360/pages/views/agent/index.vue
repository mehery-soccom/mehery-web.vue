<script setup>
import DemoDataTableKitchenSink from '@/app-insights360/views/tables/DemoDataTableKitchenSink.vue';
import { useProjectStore } from "@app-insights360/views/dashboards/analytics/useProjectStore";
import { ref } from 'vue';
import { useDatePickerFilters } from './../../../views/dashboards/analytics/useDatePickerFilters';

const { customPlugin } = useDatePickerFilters()
const projectStore = useProjectStore();
const tempTable = ref([])
const headers = [
  { title: 'Agent', key: 'agent', searchable: true, sortable: true },
  { title: 'Team', key: 'deptName', searchable: true },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'No. of Conv', key: 'totalConversations'},
  { title: 'Av Start Lag', key: 'averageStartLag'},
  { title: 'Av Response Time', key: 'averageResponseTime'},
  { title: 'Duration', key: 'averageAssignedDuration'},
  { title: 'Open', key: 'openConversations', sortable: true },
  { title: 'Resolved', key: 'resolvedConversations', sortable: true },
  { title: 'Expired', key: 'expiredConversations', sortable: true },
  { title: 'Feedback', key: 'averageSatisfaction', sortable: true },
]

const fetchAgentData = async (start, end) => {
  try {
    const response = await projectStore.fetchAgentDatas(start, end);
    if (response?.data?.results != null) {
      const resultsWithActivity = response.data.results.map(item => ({ ...item, activity: findStatus(item.session) }));
      tempTable.value = resultsWithActivity;
      console.log("ana", tempTable.value);
    }
  } catch (error) { console.error("analytics error", error); }
};

const oldDates = ref([])
const today = new Date();
var oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
const formattedStart = oneWeekAgo.toLocaleDateString('en-GB').split('/').join('-')
const formattedEnd = today.toLocaleDateString('en-GB').split('/').join('-')
const dates = `${formattedStart} to ${formattedEnd}`
var dateRange = ref(dates);

const onDateSelect = (selectedDates, dateStr) => {
  console.log('Selected:', selectedDates, dateStr)
}
const onDateUpdate = (selectedDates, dateStr) => {
  console.log('Updated:', selectedDates, dateStr)
}

const onDateClosed = (selectedDates, dateStr) => {
  console.log('Closed:', selectedDates, toRaw(oldDates.value), dateStr)
  if (selectedDates.length === 2 && toRaw(oldDates.value) != selectedDates) {
    oldDates.value = selectedDates;
    const start = new Date(selectedDates[0])
    start.setHours(0, 0, 0, 0)
    const endDate = new Date(selectedDates[1])
    endDate.setHours(23, 59, 59, 999)
    fetchAgentData(start.getTime(), endDate.getTime());
  }
}

const formatDuration = (seconds) => {
  // console.log("time vals", seconds)
  if (!seconds || isNaN(seconds)) return '-';
  seconds = seconds / 1000;

  if (seconds >= 86400) {
    const days = (seconds / 86400).toFixed(2);
    return `${days} d`;
  } else if (seconds >= 3600) {
    const hours = (seconds / 3600).toFixed(2);
    return `${hours} h`;
  } else if (seconds >= 60) {
    const minutes = (seconds / 60).toFixed(2);
    return `${minutes} m`;
  } else {
    return `${seconds.toFixed(0)} s`;
  }
};
const findStatus = (sess) =>{
  var awayStamp = new Date().getTime()-600000;
  var offlineStamp = awayStamp-600000*2;
  let activity = "offline";
  if(!sess) activity = 'offline'; 
  else { 
    const session = sess; 
    if(session && Object.keys(session).length > 0) session.isLoggedIn = (session.isLoggedIn && (session.lastOnlineStamp > offlineStamp));
    if(session && Object.keys(session).length > 0) session.isAway = session.isOnline && session.isLoggedIn && (session.lastOnlineStamp < awayStamp);
    if (!session || !session.isEnabled || !session.isLoggedIn) activity = "offline";
    else if (session.isAway) activity = "away";
    else if (session.isOnline) activity = "online";
    console.log("sess 2",sess, sess.isOnline, session.isAway, !session || !session.isEnabled || !session.isLoggedIn)
  }
  return activity;
}

const allAnalytics = () => {
  console.log("channs", dateRange.value)
  let startStr = ''; let endStr = '';
  if (dateRange.value.includes('to')) [startStr, endStr] = dateRange.value.split(' to ')
  else startStr = endStr = dateRange.value
  const [startDay, startMonth, startYear] = startStr.split('-').map(Number)
  const [endDay, endMonth, endYear] = endStr.split('-').map(Number)

  const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
  const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
  console.log("no date", startDate, endDate)
  fetchAgentData(startDate.getTime(), endDate.getTime())
}

onMounted( async () => {
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
  oneWeekAgo.setHours(0, 0, 0, 0);
  fetchAgentData(oneWeekAgo.getTime(), now.getTime());
})
</script>

<template>
  <VRow>
    <div style="width: 100%;display: flex; justify-content: flex-end;">
      <AppDateTimePicker style="width: 250px; margin-left: auto; margin: 0 12px;"
        v-model="dateRange" prepend-inner-icon="tabler-calendar"
        :config="{ mode: 'range', dateFormat: 'd-m-Y', position: 'auto right',
        onClose: onDateClosed, plugins: [customPlugin]}"
      />
    </div>
    <VCol cols="12">
      <DemoDataTableKitchenSink :headers="headers" :productList="tempTable" :title="'Agent Data'" >
        <template #item.averageStartLag="{ item }">
          {{ formatDuration(item.value.averageStartLag) }}
        </template>

        <template #item.averageResponseTime="{ item }">
          {{ formatDuration(item.value.averageResponseTime) }}
        </template>

        <template #item.averageAssignedDuration="{ item }">
          {{ formatDuration(item.value.averageAssignedDuration) }}
        </template>
        <!-- {{ findStatus(item.value.session) }} -->
        <template #item.status="{ item }">
          <span v-if="item.value.activity === 'online'" class="status-dot green-dot"></span>
          <span v-else-if="item.value.activity === 'away'" class="status-dot orange-dot"></span>
          <span v-else class="status-dot red-dot"></span>
        </template>
      </DemoDataTableKitchenSink>
    </VCol>
  </VRow>
</template>

<style>
.flatpickr-custom-btn {
  font-size: 12px;
  background: #eee;
  border: 1px solid #ccc;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.flatpickr-custom-btn:hover {
  background-color: #ddd;
}
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.green-dot {
  background-color: rgb(10, 200, 10);
}
.red-dot {
  background-color: red;
}
.orange-dot {
  background-color: orange;
}
</style>
