<script setup>
import { useTheme } from "vuetify";
import { getLatestBarChartConfig } from "@core/libs/chartjs/chartjsConfig";
import BarChart from "@core/libs/chartjs/components/BarChart";

const props = defineProps({
  colors: {
    type: Object,
    required: false,
  },
  data: {
    type: Object,
    required: true,
  },
});

const vuetifyTheme = useTheme();
const chartOptions = computed(() =>
  getLatestBarChartConfig(vuetifyTheme.current.value)
);

onMounted(async () => {
  console.log("NotificationQuickAnalytics mounted", props);
});

const _colors = {
  white: "#fff",
  yellow: "#ffe802",
  primary: "#836af9",
  areaChartBlue: "#2c9aff",
  barChartYellow: "#ffcf5c",
  polarChartGrey: "#4f5d70",
  polarChartInfo: "#299aff",
  lineChartYellow: "#d4e157",
  polarChartGreen: "#28dac6",
  lineChartPrimary: "#9e69fd",
  lineChartWarning: "#ff9800",
  horizontalBarInfo: "#26c6da",
  polarChartWarning: "#ff8131",
  scatterChartGreen: "#28c76f",
  warningShade: "#ffbd1f",
  areaChartBlueLight: "#84d0ff",
  areaChartGreyLight: "#edf1f4",
  scatterChartWarning: "#ff9f43",
  ...(props.colors || {}),
};

const _data = {
  labels: [
    // "7/12",
    // "8/12",
    // "9/12",
    // "10/12",
    // "11/12",
    // "12/12",
    // "13/12",
    // "14/12",
    // "15/12",
    // "16/12",
    // "17/12",
    // "18/12",
    // "19/12",
    "Sends",
    "Opens",
  ],
  datasets: [
    {
      maxBarThickness: 15,
      backgroundColor: _colors.barChartYellow,
      borderColor: "transparent",
      borderRadius: {
        topRight: 15,
        topLeft: 15,
      },
      //   data: [275, 90, 190, 205, 125, 85, 55, 87, 127, 150, 230, 280, 190],
      data: [props.data.sends, props.data.opens],
    },
  ],
};
</script>

<template>
  <div class="notification-quick-analytics d-flex justify-center">
    <div>
      <BarChart
        :height="250"
        :chart-data="_data"
        :chart-options="chartOptions"
      />
    </div>
  </div>
</template>

<style lang="scss">
// .notification-quick-analytics {}
</style>
