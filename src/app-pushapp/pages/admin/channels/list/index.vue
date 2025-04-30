<script setup>
import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";
import { VDataTable } from "vuetify/labs/VDataTable";

const channelsStore = useChannelsStore();
const isLoading = ref(false);
const channels = ref([]);
// const totalChannels = ref(0);
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
  {
    title: "App Name",
    key: "channel_name",
  },
  {
    title: "Platform(s)",
    key: "platforms",
    sortable: false,
  },
  {
    title: "",
    key: "actions",
    sortable: false,
  },
];

onMounted(async () => {
  fetchChannels();
});

// 👉 watch for data table options like itemsPerPage,page,searchQuery,sortBy etc...
watchEffect(() => {});

// 👉 Fetch Channels
const fetchChannels = () => {
  isLoading.value = true;
  channelsStore
    .fetchChannels()
    .then((response) => {
      channels.value = response.results;
      // totalChannels.value = response.data.total;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const deleteChannel = (id, dialogCloseRef) => {
  isLoading.value = true;
  channelsStore
    .deleteChannel({ id })
    .then(() => {
      fetchChannels();
      dialogCloseRef.value = false;
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

//   fetchChannels();
// };
</script>

<template>
  <VCard v-if="channels" id="invoice-list">
    <VCardText class="d-flex align-center flex-wrap gap-4">
      <div class="me-3 d-flex gap-3"></div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <!-- 👉 Create -->
        <VBtn prepend-icon="tabler-plus" :to="{ name: 'admin-channels-add' }">
          Create App
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <!-- SECTION Datatable -->
    <!-- <VDataTableServer
      class="text-no-wrap my-data-table"
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="channels"
      :items-length="totalChannels"
      :loading="isLoading"
      @update:options="onUpdateOptions"
    > -->
    <VDataTable
      class="text-no-wrap mb-3 my-data-table"
      :headers="headers"
      :items="channels"
      :loading="isLoading"
    >
      <!-- channel id -->
      <template #item.channel_name="{ item }">
        <RouterLink
          :to="{
            name: 'admin-channels-preview-id',
            params: { id: item.raw.channel_id },
          }"
        >
          {{ item.raw.channel_name }}
        </RouterLink>
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
        <IconBtn>
          <VIcon icon="tabler-trash" />
          <v-dialog activator="parent" max-width="340">
            <template v-slot:default="{ isActive }">
              <v-card
                class=""
                prepend-icon="mdi-alert"
                text="Are you certain, you want to delete ?"
                title="Confirm"
              >
                <template v-slot:actions>
                  <v-btn
                    class="ml-auto"
                    text="Yes"
                    @click="deleteChannel(item.raw.channel_id, isActive)"
                  ></v-btn>
                  <v-btn
                    class="ml-auto"
                    text="No"
                    @click="isActive.value = false"
                  ></v-btn>
                </template>
              </v-card>
            </template>
          </v-dialog>
        </IconBtn>

        <IconBtn
          :to="{
            name: 'admin-channels-edit-id',
            params: { id: item.raw.channel_id },
          }"
        >
          <VIcon icon="mdi-pencil-outline" />
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
