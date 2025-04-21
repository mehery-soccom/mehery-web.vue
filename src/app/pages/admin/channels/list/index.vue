<script setup>
import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";
import { VDataTableServer } from "vuetify/labs/VDataTable";

const channelsStore = useChannelsStore();

const isLoading = ref(false);
const channels = ref([]);
const totalChannels = ref(0);
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

// 👉 headers
const headers = [
  {
    title: "Channel Name",
    key: "app_name",
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

// 👉 Fetch Channels
const fetchChannels = (query, currentStatus, firstDate, lastDate, option) => {
  isLoading.value = true;
  channelsStore
    .fetchChannels({
      q: query,
      status: currentStatus,
      startDate: firstDate,
      endDate: lastDate,
      options: option,
    })
    .then((response) => {
      channels.value = response.results;
      totalChannels.value = response.data.total;
      options.value.page = response.data.page;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const deleteChannel = (id) => {
  isLoading.value = true;
  channelsStore
    .deleteChannel({ id })
    .then(() => {
      fetchChannels(
        searchQuery.value,
        selectedStatus.value,
        dateRange.value?.split("to")[0],
        dateRange.value?.split("to")[1],
        options.value
      );
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 👉 watch for data table options like itemsPerPage,page,searchQuery,sortBy etc...
watchEffect(() => {
  const [start, end] = dateRange.value ? dateRange.value.split("to") : "";

  fetchChannels(
    searchQuery.value,
    selectedStatus.value,
    start,
    end,
    options.value
  );
});
</script>

<template>
  <VCard v-if="channels" id="invoice-list">
    <VCardText class="d-flex align-center flex-wrap gap-4">
      <div class="me-3 d-flex gap-3">
        <!-- <AppSelect
          :model-value="options.itemsPerPage"
          :items="[
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
            { value: -1, title: 'All' },
          ]"
          style="width: 6.25rem"
          @update:model-value="options.itemsPerPage = parseInt($event, 10)"
        /> -->
      </div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <!-- 👉 Search  -->
        <!-- <div class="invoice-list-filter">
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Channel"
            density="compact"
          />
        </div> -->
        <!-- 👉 Create channel -->
        <VBtn prepend-icon="tabler-plus" :to="{ name: 'admin-channels-add' }">
          Create Channel
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <!-- SECTION Datatable -->
    <VDataTableServer
      v-model:items-per-page="options.itemsPerPage"
      v-model:page="options.page"
      :loading="isLoading"
      :items-length="totalChannels"
      :headers="headers"
      :items="channels"
      class="text-no-wrap"
      @update:options="options = $event"
    >
      <!-- channel id -->
      <template #item.app_id="{ item }">
        <RouterLink
          :to="{
            name: 'admin-channels-preview-id',
            params: { id: item.raw.app_id },
          }"
        >
          #{{ item.raw.app_id }}
        </RouterLink>
      </template>

      <!-- platforms -->
      <template #item.platforms="{ item }">
        <div class="d-flex align-center">
          <div class="d-flex flex-column">
            <h6 class="text-body-1 font-weight-medium mb-0">
              {{ item.raw.platforms.map((p) => p.platform_type).join(", ") }}
            </h6>
          </div>
        </div>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <IconBtn @click="deleteChannel(item.raw.app_id)">
          <VIcon icon="tabler-trash" />
        </IconBtn>

        <IconBtn
          :to="{
            name: 'admin-channels-edit-id',
            params: { id: item.raw.app_id },
          }"
        >
          <VIcon icon="mdi-pencil-outline" />
        </IconBtn>
      </template>

      <!-- pagination -->
      <!-- <template #bottom>
        <VDivider />
        <div
          class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3"
        >
          <p class="text-sm text-disabled mb-0">
            {{ paginationMeta(options, totalChannels) }}
          </p>

          <VPagination
            v-model="options.page"
            :length="Math.ceil(totalChannels / options.itemsPerPage)"
            :total-visible="
              $vuetify.display.xs
                ? 1
                : Math.ceil(totalChannels / options.itemsPerPage)
            "
          >
            <template #prev="slotProps">
              <VBtn
                variant="tonal"
                color="default"
                v-bind="slotProps"
                :icon="false"
              >
                Previous
              </VBtn>
            </template>

            <template #next="slotProps">
              <VBtn
                variant="tonal"
                color="default"
                v-bind="slotProps"
                :icon="false"
              >
                Next
              </VBtn>
            </template>
          </VPagination>
        </div>
      </template> -->
    </VDataTableServer>
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
</style>
