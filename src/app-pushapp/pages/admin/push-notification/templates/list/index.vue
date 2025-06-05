<script setup>
import MyDataTable from "@/@common/components/MyDataTable.vue";
import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";
const { show } = inject("snackbar");

const DEFAULT_TEST_NOTIFICATION = {
  data: `{
    "progress_percent": "0.25"
}`,
  channel_id: null,
  user_id: "",
  activity_id: "",
};

const channelsStore = useChannelsStore();
const pushNotificationStore = usePushNotificationStore();
const isLoading = ref(false);
const items = ref([]);
// const totalItems = ref(0);
const ChannelList = ref([]);
const testNotification = reactive({
  ...DEFAULT_TEST_NOTIFICATION,
});
const headers = [
  {
    title: "Name",
    key: "desc",
  },
  {
    title: "Code",
    key: "code",
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
  let channelsRes = await channelsStore.fetchChannels();
  ChannelList.value = channelsRes.results;

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

const onSendStyled = async (template, update) => {
  try {
    isLoading.value = true;

    let _data = {};
    try {
      _data = JSON.parse(testNotification.data);
    } catch (error) {
      return show({ message: "Invalid json data", color: "error" });
    }
    const { progress_percent, ...data } = _data;

    let payload = {
      to: {
        filter: {
          user_id: testNotification.user_id,
        },
      },
      channel_id: testNotification.channel_id,
      style: { code: template.subType, ...template.style, progress_percent },
      template: {
        code: template.code,
        data,
        lang: "en",
      },
      options: {
        buttons: [],
      },

      type: template.type,
      activity_id: testNotification.activity_id,
    };

    let res = await pushNotificationStore.sendSingle(payload);
    if (update) {
      show({ message: "Notification updated successfully", color: "success" });
    } else {
      testNotification.activity_id = res.data.activity_id;
      show({ message: "Notification sent successfully", color: "success" });
    }
  } catch (error) {
    console.error(error);

    show({ message: "Something went wrong. try again", color: "error" });
  } finally {
    isLoading.value = false;
  }
};

const onDialogChange = (val) => {
  if (!val) Object.assign(testNotification, DEFAULT_TEST_NOTIFICATION);
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

        <IconBtn v-if="item.raw.type === 'styled'">
          <VIcon icon="mdi-monitor-eye" />
          <VTooltip activator="parent">Test</VTooltip>
          <v-dialog
            activator="parent"
            transition="dialog-bottom-transition"
            max-width="800px"
            @update:model-value="onDialogChange"
          >
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title>Test Live Activity</v-card-title>

                <v-card-text>
                  <VRow>
                    <VCol cols="12" md="4">
                      <AppSelect
                        v-model="testNotification.channel_id"
                        :items="ChannelList"
                        label="App"
                        placeholder="Select App"
                        item-title="channel_name"
                        item-value="channel_id"
                        clearable
                      />
                    </VCol>
                    <VCol cols="12" md="4"> </VCol>
                    <VCol cols="12" md="4"></VCol>
                    <VCol cols="12" md="4">
                      <AppTextField
                        v-model="testNotification.user_id"
                        label="Testing Device"
                        placeholder="Enter Testing Device ID"
                      />
                    </VCol>
                    <VCol cols="12" md="4">
                      <AppTextField
                        readonly
                        v-model="testNotification.activity_id"
                        label="Activity ID"
                        hint="Used to update live activity"
                        persistent-hint
                      />
                    </VCol>
                    <VCol cols="12" md="8">
                      <AppTextarea
                        v-model="testNotification.data"
                        label="Data"
                        auto-grow
                        rows="6"
                        spellcheck="false"
                        class="monospace"
                        placeholder='e.g. {"title": "Hello"}'
                      />
                    </VCol>
                  </VRow>
                </v-card-text>

                <v-card-actions class="justify-start">
                  <v-btn color="primary" @click="onSendStyled(item.raw, false)"
                    >Start Activity</v-btn
                  >
                  <v-btn color="primary" @click="onSendStyled(item.raw, true)"
                    >Update Activity</v-btn
                  >
                  <v-btn variant="text" @click="isActive.value = false"
                    >Cancel</v-btn
                  >
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </IconBtn>
      </template>
    </MyDataTable>
  </VCard>
</template>

<style lang="scss"></style>
