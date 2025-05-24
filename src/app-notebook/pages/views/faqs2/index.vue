<script setup>
import { useProjectStore } from "@app-notebook/views/dashboards/analytics/useProjectStore";
import { avatarText } from "@core/utils/formatters";
import { paginationMeta } from "@fake-db/utils";
import { VDataTable } from "vuetify/labs/VDataTable";

const projectStore = useProjectStore();
const searchQuery = ref("");

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  groupBy: [],
  search: undefined,
});

const qapairs = ref([]);

// 👉 headers
const headers = [
  {
    title: "Question",
    key: "question",
  },
  {
    title: "Answer",
    key: "answer",
  },
  //   {
  //     title: "Team",
  //     key: "team",
  //   },
  //   {
  //     title: "Status",
  //     key: "status",
  //   },
  //   {
  //     title: "Actions",
  //     key: "actions",
  //     sortable: false,
  //   },
];

// 👉 Fetch qapairs
onMounted(() => {
  projectStore
    .fetchProjects()
    .then((response) => {
      qapairs.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
});
</script>

<template>
  <VCard v-if="qapairs">
    <VCardItem
      class="project-header d-flex flex-wrap justify-space-between py-4 gap-4"
    >
      <VCardTitle>qapairs</VCardTitle>

      <template #append>
        <div style="inline-size: 272px">
          <AppTextField v-model="searchQuery" placeholder="Search" />
        </div>
      </template>
    </VCardItem>

    <VDivider />

    <!-- SECTION Table -->
    <VDataTable
      v-model:page="options.page"
      :items-per-page="5"
      show-select
      :search="searchQuery"
      :headers="headers"
      :items="qapairs"
      class="text-no-wrap"
      @update:options="options = $event"
    >
      <!-- 👉 Name -->
      <template #item.name="{ item }">
        <div class="d-flex align-center gap-3 py-2">
          <VAvatar
            :variant="!item.raw.logo.length ? 'tonal' : undefined"
            :color="!item.raw.logo.length ? 'primary' : undefined"
            size="38"
          >
            <VImg v-if="item.raw.logo.length" :src="item.raw.logo" />
            <span v-else class="font-weight-medium">{{
              avatarText(item.raw.name)
            }}</span>
          </VAvatar>

          <div>
            <p class="font-weight-medium mb-0">
              {{ item.raw.name }}
            </p>
            <span class="text-disabled text-sm">{{ item.raw.date }}</span>
          </div>
        </div>
      </template>

      <!-- 👉 team -->
      <template #item.team="{ item }">
        <div class="v-avatar-group">
          <VAvatar
            v-for="(avatar, index) in item.raw.team"
            :key="index"
            :size="30"
            :image="avatar"
          />
        </div>
      </template>

      

      <template #bottom>
        <VDivider />

        <div
          class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-3 pa-5 pt-3"
        >
          <p class="text-sm text-disabled mb-0">
            {{ paginationMeta(options, qapairs.length) }}
          </p>

          <VPagination
            v-model="options.page"
            :total-visible="Math.ceil(qapairs.length / options.itemsPerPage)"
            :length="Math.ceil(qapairs.length / options.itemsPerPage)"
          >
            <template #next="slotProps">
              <VBtn
                v-bind="slotProps"
                :icon="false"
                variant="tonal"
                color="default"
              >
                Next
              </VBtn>
            </template>

            <template #prev="slotProps">
              <VBtn
                v-bind="slotProps"
                :icon="false"
                variant="tonal"
                color="default"
              >
                Previous
              </VBtn>
            </template>
          </VPagination>
        </div>
      </template>
    </VDataTable>
    <!-- !SECTION -->
  </VCard>
</template>

<style lang="scss">
.project-header .v-card-item__append {
  padding-inline-start: 0;
}
</style>
