<script setup>
import MyDataTable from "@/@common/components/MyDataTable.vue";
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";

const { show } = inject("snackbar");
const pushNotificationStore = usePushNotificationStore();
const isLoading = ref(false);
const items = ref([]);
// const totalItems = ref(0);
const headers = [
  {
    title: "Template",
    key: "code",
  },
  {
    title: "Description",
    key: "desc",
  },
  {
    title: "Type",
    key: "type",
  },
  {
    title: "",
    key: "actions",
    sortable: false,
  },
];

onMounted(async () => {
  fetchTemplates();
});

// 👉 Fetch Templates
const fetchTemplates = () => {
  isLoading.value = true;
  pushNotificationStore
    .fetchTemplates()
    .then((response) => {
      items.value = response.results;
      // totalItems.value = response.data.total;
    })
    .catch((error) => {
      show({ message: "Something went wrong", color: "error" });
      items.value = [];
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 👉 Delete Template
const deleteTemplate = (id, dialogCloseRef) => {
  isLoading.value = true;
  pushNotificationStore
    .deleteTemplate({ id })
    .then(() => {
      fetchTemplates();
      dialogCloseRef.value = false;
      show({ message: "Template deleted successfully", color: "success" });
    })
    .catch((error) => {
      show({ message: "Something went wrong", color: "error" });
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-center flex-wrap gap-4">
      <div class="me-3 d-flex gap-3"></div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <!-- 👉 Create -->
        <VBtn
          prepend-icon="tabler-plus"
          :to="{ name: 'admin-push-notification-templates-add' }"
        >
          Create Template
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <MyDataTable :headers="headers" :items="items" :loading="isLoading">
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
                    @click="deleteTemplate(item.raw._id, isActive)"
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
          <VTooltip activator="parent">Delete</VTooltip>
        </IconBtn>

        <IconBtn
          :to="{
            name: 'admin-push-notification-templates-edit-id',
            params: { id: item.raw._id },
          }"
        >
          <VIcon icon="mdi-pencil-outline" />
          <VTooltip activator="parent">Edit</VTooltip>
        </IconBtn>

        <IconBtn
          :to="{
            name: 'admin-push-notification-templates-add',
            query: { copy: item.raw._id },
          }"
        >
          <VIcon icon="mdi-content-copy" />
          <VTooltip activator="parent">Duplicate</VTooltip>
        </IconBtn>
      </template>
    </MyDataTable>
  </VCard>
</template>

<style lang="scss"></style>
