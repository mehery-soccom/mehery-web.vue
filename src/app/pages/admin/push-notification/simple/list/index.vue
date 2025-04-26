<script setup>
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";
import { VDataTableServer } from "vuetify/labs/VDataTable";

const pushNotificationStore = usePushNotificationStore();

const isLoading = ref(false);
const notifications = ref([]);
const totalNotifications = ref(0);
const searchQuery = ref("");
const dateRange = ref("");
const selectedStatus = ref();
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  groupBy: [],
  search: undefined,
});
const currentPage = ref(1);

currentPage.value = options.value.page;

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

// 👉 headers
const headers = [
  {
    title: "Name",
    key: "notification_name",
  },
  {
    title: "Channel ID",
    key: "app_id",
  },
  {
    title: "Platform(s)",
    key: "platforms",
  },
  {
    title: "Company Name",
    key: "company_name",
  },
  {
    title: "Company ID",
    key: "company_id",
  },
  {
    title: "Actions",
    key: "actions",
  },
];

onMounted(async () => {
  fetchSimpleNotifications();
});

const fetchSimpleNotifications = (
  query,
  currentStatus,
  firstDate,
  lastDate,
  option
) => {
  isLoading.value = true;
  pushNotificationStore
    .fetchSimpleNotifications
    // q: query,
    // status: currentStatus,
    // startDate: firstDate,
    // endDate: lastDate,
    // options: option,
    ()
    .then((response) => {
      notifications.value = response.results;
      totalNotifications.value = response.data.total;
      options.value.page = response.data.page;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<template>
  <VCard v-if="notifications" id="invoice-list">
    <VCardText class="d-flex align-center flex-wrap gap-4">
      <div class="me-3 d-flex gap-3"></div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <VBtn
          prepend-icon="tabler-plus"
          :to="{ name: 'admin-push-notification-simple-add' }"
        >
          New Notification
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTableServer
      v-model:items-per-page="options.itemsPerPage"
      v-model:page="options.page"
      :loading="isLoading"
      :items-length="totalNotifications"
      :headers="headers"
      :items="notifications"
      class="text-no-wrap"
      @update:options="options = $event"
    >
      <template #item.actions="{ item }">
        <IconBtn
          :to="{
            name: 'admin-push-notification-simple-add',
            params: { copy: item.raw.app_id },
          }"
        >
          <VIcon icon="mdi-copy" />
        </IconBtn>
      </template>
    </VDataTableServer>
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
</style>
