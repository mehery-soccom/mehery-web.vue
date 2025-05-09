<script setup>
import { getLineChartConfig } from '@core/libs/chartjs/chartjsConfig'
import LineChart from '@core/libs/chartjs/components/LineChart'
import { useTheme } from 'vuetify'

const props = defineProps({
  colors: {
    type: null,
    required: true,
  },
  data: {
    type: Object,
    required: false
  },
  chartOption: {
    type: Object,
    required: false
  },
})

const vuetifyTheme = useTheme()
const chartConfig = computed(() => getLineChartConfig(vuetifyTheme.current.value))
</script>

<template>
  <LineChart
    :chart-options="chartOption || chartConfig"
    :height="200"
    :chart-data="data"
  />
</template>
