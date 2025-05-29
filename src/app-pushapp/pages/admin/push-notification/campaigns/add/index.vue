<script setup>
// import NotificationPreview from "@app/views/admin/push-notification/NotificationPreview.vue";
import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";
const { show } = inject("snackbar");

const route = useRoute();
const router = useRouter();
const channelsStore = useChannelsStore();
const pushNotificationStore = usePushNotificationStore();

const tab = ref("tab-details");
const isLoading = ref(false);
const notification = reactive({
  channel_id: null,
  platforms: [],
});
const ChannelList = ref([]);
const TemplateList = ref([]);

onMounted(async () => {
  let channelsRes = await channelsStore.fetchChannels();
  ChannelList.value = channelsRes.results;

  let templatesRes = await pushNotificationStore.fetchTemplates();
  TemplateList.value = templatesRes.results;

  const copy = route.query.copy;
  if (copy) {
    pushNotificationStore
      .fetchSimpleNotification({ id: copy })
      .then((response) => {
        const _notification = response.data.notification;
        Object.assign(notification, {
          ...notification,
          ..._notification,
        });
      })
      .catch((error) => {
        console.log(error);
        show({ message: "Something went wrong", color: "error" });
      });
  }
});

const onSend = async () => {
  try {
    isLoading.value = true;

    let template = TemplateList.value.find(
      (t) => t._id === notification.template
    );

    let payload = {
      ...template.style,
      buttons: template.options.buttons,

      filter: {
        platform: notification.platforms.join(" "),
        session_type: "all",
      },
      channel_id: notification.channel_id,
    };

    await pushNotificationStore.sendBulk(payload);

    show({ message: "Notification sent successfully", color: "success" });

    router.push({ name: "admin-push-notification-campaigns-list" });
  } catch (error) {
    console.error(error);

    show({ message: "Something went wrong. try again", color: "error" });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <v-row>
    <!-- Form Column -->
    <v-col cols="12" md="7">
      <v-card>
        <v-card-item>
          <v-card-title>Push Notification</v-card-title>
          <!-- <v-card-subtitle
            >This template will be used for sending Push
            Notification</v-card-subtitle
          > -->
        </v-card-item>

        <VTabs v-model="tab">
          <VTab value="tab-details"> Details </VTab>
          <VTab value="tab-segments"> Segments </VTab>
        </VTabs>

        <VCard flat>
          <VCardText>
            <VWindow v-model="tab" class="disable-tab-transition">
              <VWindowItem value="tab-details">
                <VForm>
                  <VRow>
                    <VCol cols="12" md="6">
                      <AppTextField
                        v-model="notification.name"
                        label="Notification Name"
                        placeholder="Enter Notification Name"
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="notification.template"
                        :items="TemplateList"
                        label="Template"
                        placeholder="Select a template"
                        item-title="code"
                        item-value="_id"
                        clearable
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props" class="px-4">
                            <div class="dropdown-option-meta text-caption">
                              {{ item.raw.type }}
                            </div>
                          </v-list-item>
                        </template>
                      </AppSelect>
                    </VCol>
                  </VRow>
                </VForm>
              </VWindowItem>

              <VWindowItem value="tab-segments">
                <VForm>
                  <VRow>
                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="notification.channel_id"
                        :items="ChannelList"
                        label="App"
                        placeholder="Select App"
                        item-title="channel_name"
                        item-value="channel_id"
                        clearable
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="notification.platforms"
                        :items="pushNotificationStore.platformList"
                        label="Platform"
                        placeholder="Select Platforms"
                        item-title="label"
                        item-value="value"
                        clearable
                        multiple
                        chips
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppTextField label="Target" value="All Users" disabled />
                    </VCol>
                  </VRow>
                </VForm>
              </VWindowItem>
            </VWindow>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex gap-4">
            <VBtn
              v-if="tab === 'tab-segments'"
              @click="onSend"
              :disabled="isLoading"
              >{{ isLoading ? "loading..." : "Send Now" }}</VBtn
            >
            <VBtn
              variant="tonal"
              color="secondary"
              :to="{ name: 'admin-push-notification-campaigns-list' }"
            >
              Cancel
            </VBtn>
          </VCardText>
        </VCard>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
.dropdown-option-meta {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem;
}
</style>
