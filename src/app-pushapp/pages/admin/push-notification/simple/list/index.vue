<script setup>
import NotificationQuickAnalytics from "@app/views/admin/push-notification/NotificationQuickAnalytics.vue";
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";
import { VDataTable } from "vuetify/labs/VDataTable";

const pushNotificationStore = usePushNotificationStore();
const isLoading = ref(false);
const notifications = ref([]);
// const totalNotifications = ref(0);
// const itemsPerPage = ref(10);
const colors = {
  android: {
    color: "info",
    text: "Android",
  },
  ios: {
    color: "success",
    text: "IOS",
  },
  huawei: {
    color: "primary",
    text: "Huawei",
  },
};
const headers = [
  { title: "", key: "data-table-expand" },
  {
    title: "Notification",
    key: "notification",
  },
  {
    title: "Status",
    key: "status",
  },
  {
    title: "Platform(s)",
    key: "platforms",
    sortable: false,
  },
  {
    title: "Start / Send",
    key: "start",
  },
  {
    title: "End",
    key: "end",
  },
  {
    title: "Sends",
    key: "sends",
    sortable: false,
  },
  {
    title: "Opens",
    key: "opens",
    sortable: false,
  },
  {
    title: "",
    key: "actions",
    sortable: false,
  },
];

onMounted(async () => {
  fetchSimpleNotifications();
});

// 👉 watch for data table options like itemsPerPage,page,searchQuery,sortBy etc...
watchEffect(() => {});

// 👉 Fetch
const fetchSimpleNotifications = () => {
  isLoading.value = true;
  pushNotificationStore
    .fetchSimpleNotifications()
    .then((response) => {
      notifications.value = response.results;
      notifications.value = [
        {
          id: "680dbc058ef6189fa647b0b0",
          notification: "hello world",
          status: "completed",
          platforms: [
            {
              active: true,
              bundle_id: "com.mehery.admin.meheryAdmin",
              file_path:
                "configs/uploads/mehery1234_1745730565438_ios_1745730565440.p8",
              key_id: "DACSCD48Y8",
              platform_id: "mehery1234_1745730565438_ios_1745730565440",
              platform_type: "ios",
              team_id: "6CRFUK7DVC",
              _id: "680dbc058ef6189fa647b0b1",
            },
            {
              active: true,
              bundle_id: "com.mehery.admin.mehery_admin",
              file_path:
                "configs/uploads/mehery1234_1745730565438_android_1745730565442.json",
              platform_id: "mehery1234_1745730565438_android_1745730565442",
              platform_type: "android",
              _id: "680dbc058ef6189fa647b0b2",
            },
          ],
          start: "-",
          end: "-",
          sends: 100,
          opens: 20,
        },
        {
          id: "680dbc058ef6189fa647b0b1",
          notification: "hello world 2",
          status: "In-progress",
          platforms: [
            {
              active: true,
              bundle_id: "com.mehery.admin.meheryAdmin",
              file_path:
                "configs/uploads/mehery1234_1745730565438_ios_1745730565440.p8",
              key_id: "DACSCD48Y8",
              platform_id: "mehery1234_1745730565438_ios_1745730565440",
              platform_type: "ios",
              team_id: "6CRFUK7DVC",
              _id: "680dbc058ef6189fa647b0b1",
            },
            {
              active: true,
              bundle_id: "com.mehery.admin.mehery_admin",
              file_path:
                "configs/uploads/mehery1234_1745730565438_android_1745730565442.json",
              platform_id: "mehery1234_1745730565438_android_1745730565442",
              platform_type: "android",
              _id: "680dbc058ef6189fa647b0b2",
            },
          ],
          start: "-",
          end: "-",
          sends: 80,
          opens: 10,
        },
      ];
      // totalNotifications.value = response.data.total;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// const onUpdateOptions = (newValue) => {
//   console.log("onUpdateOptions", newValue);
//   // options.value = newValue;

//   fetchSimpleNotifications();
// };
</script>

<template>
  <VCard v-if="notifications" id="invoice-list">
    <VCardText class="d-flex align-center flex-wrap gap-4">
      <div class="me-3 d-flex gap-3"></div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <!-- 👉 Create -->
        <VBtn
          prepend-icon="tabler-plus"
          :to="{ name: 'admin-push-notification-simple-add' }"
        >
          New Notification
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <!-- SECTION Datatable -->
    <!-- <VDataTableServer
      class="text-no-wrap my-data-table"
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="notifications"
      :items-length="totalNotifications"
      :loading="isLoading"
      @update:options="onUpdateOptions"
    > -->
    <VDataTable
      class="text-no-wrap mb-3 my-data-table"
      :headers="headers"
      :items="notifications"
      :loading="isLoading"
      expand-on-click
    >
      <!-- Expanded Row Data -->
      <template #expanded-row="slotProps">
        <tr class="v-data-table__tr">
          <td :colspan="headers.length">
            <NotificationQuickAnalytics :data="slotProps.item.raw" />
          </td>
        </tr>
      </template>

      <!-- platforms -->
      <template #item.platforms="{ item }">
        <div class="d-flex gap-2">
          <VChip
            v-for="p in item.raw.platforms"
            :key="p.platform_type"
            label
            :color="colors[p.platform_type].color"
            class="font-weight-medium"
          >
            {{ colors[p.platform_type].text }}
          </VChip>
        </div>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <IconBtn
          :to="{
            name: 'admin-push-notification-simple-add',
            query: { copy: item.raw.id },
          }"
        >
          <VIcon icon="mdi-content-copy" />
          <VTooltip activator="parent">Duplicate</VTooltip>
        </IconBtn>
      </template>
      <!-- </VDataTableServer> -->
    </VDataTable>
    <!-- !SECTION -->
  </VCard>
</template>

<style lang="scss">
#invoice-list {
  .invoice-list-actions {
    inline-size: 8rem;
  }

  .invoice-list-filter {
    inline-size: 12rem;
  }
}
.my-data-table {
  .v-table__wrapper {
    min-height: 100px;
  }
}
</style>
