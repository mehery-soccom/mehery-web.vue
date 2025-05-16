<script setup>
import DemoDataTableKitchenSink from '@/app-insights360/views/tables/DemoDataTableKitchenSink.vue';
import { useProjectStore } from "@app-insights360/views/dashboards/analytics/useProjectStore";
import { ref } from 'vue';

const projectStore = useProjectStore();
const channelItems = ref()
const selectedChannelItem = ref('All Channels')
const tempCharts = ref([])
const tempTable = ref([])
const headers = [
  { title: 'TEMPLATE', key: 'templateCode', searchable: true },
  { title: 'CHANNEL', key: 'channelId', searchable: true },
  { title: 'CATEGORY', key: 'templateType', searchable: true },
  { title: 'SENT', key: 'total'},
  { title: 'DELIVERED', key: 'delivered', sortable: false },
  { title: 'READ', key: 'read', sortable: false },
  { title: 'REPLIED', key: 'responded', sortable: false },
  { title: 'FAILED', key: 'failed', sortable: false },
]

const fetchTemplateData = async (start, end, chan, bool) => {
  try {
    const response = await projectStore.fetchTemplateDatas(start, end, chan);
    if (response?.data?.data != null) {
      tempCharts.value = Object.entries(response?.data?.data).map(([channel, data]) => ({ title: channel, ...data }))
      tempTable.value = response?.data?.results;
      if(!bool) channelItems.value = ['All Channels', ...Object.keys(response?.data?.data || {})];
      console.log("ana", tempCharts.value, tempTable.value);
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
    const start = selectedDates[0].getTime();
    const endDate = new Date(selectedDates[1])
    endDate.setHours(23, 59, 59, 999)
    const end = endDate.getTime()
    console.log("all date closed", start, end)
    fetchTemplateData(start, end, selectedChannelItem.value, false);
  }
}

const allAnalytics = () => {
  console.log("channs", selectedChannelItem, dateRange.value)
  let startStr = ''; let endStr = '';
  if (dateRange.value.includes('to')) [startStr, endStr] = dateRange.value.split(' to ')
  else startStr = endStr = dateRange.value
  const [startDay, startMonth, startYear] = startStr.split('-').map(Number)
  const [endDay, endMonth, endYear] = endStr.split('-').map(Number)

  const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
  const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
  console.log("no date", startDate, endDate)
  fetchTemplateData(startDate.getTime(), endDate.getTime(), selectedChannelItem.value, true)
}

onMounted( async () => {
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
  oneWeekAgo.setHours(0, 0, 0, 0);
  fetchTemplateData(oneWeekAgo.getTime(), now.getTime(), 'All Channels', false);
})
</script>

<template>
  <VRow>
    <div style="width: 100%;display: flex; justify-content: flex-end;">
      <VMenu transition="scale-transition" style="min-width: 200px !important;">
        <template #activator="{ props }">
          <VBtn v-bind="props">
            {{ selectedChannelItem || 'Select an option' }}
          </VBtn>
        </template>

        <VList>
          <VListItem
            v-for="(item, index) in channelItems"
            :key="index"
            @click="() => { selectedChannelItem = item; allAnalytics(); }">
            <VListItemTitle>{{ item }}</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <AppDateTimePicker style="width: 250px; margin-left: auto; margin: 0 12px;"
        v-model="dateRange" prepend-inner-icon="tabler-calendar"
        :config="{ mode: 'range', dateFormat: 'd-m-Y', position: 'auto right', onChange: onDateSelect,
          onValueUpdate: onDateUpdate, onClose: onDateClosed }"
      />
    </div>
    <VCol cols="12">
      <DemoDataTableKitchenSink :headers="headers" :productList="tempTable" />
    </VCol>
  </VRow>
</template>

<style lang="scss"></style>
