<template>
  <v-row>
    <!-- Form Column -->
    <v-col cols="12" md="7">
      <v-card>
        <v-card-item>
          <v-card-title>Push Simple Template</v-card-title>
          <v-card-subtitle
            >This template will be used for sending Push
            Notification</v-card-subtitle
          >
        </v-card-item>

        <VTabs v-model="tab">
          <VTab value="tab-basic-details"> Basic Details </VTab>
        </VTabs>

        <VCard flat>
          <VCardText>
            <VWindow v-model="tab" class="disable-tab-transition">
              <VWindowItem value="tab-basic-details">
                <VForm>
                  <VRow>
                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="form.app_id"
                        :items="ChannelList"
                        label="Channel"
                        placeholder="Select Channel"
                        item-title="label"
                        item-value="value"
                        clearable
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="form.platforms"
                        :items="PlatformList"
                        label="Platform"
                        placeholder="Select Platforms"
                        item-title="label"
                        item-value="value"
                        clearable
                        multiple
                        chips
                      />
                    </VCol>

                    <VCol cols="12" md="12">
                      <AppTextField
                        v-model="form.title"
                        label="Title"
                        placeholder="Enter Notification Title"
                      />
                    </VCol>

                    <VCol cols="12" md="12">
                      <AppTextarea
                        v-model="form.message"
                        label="Message"
                        placeholder="Enter Notification Message"
                      />
                    </VCol>

                    <VCol cols="12" md="12">
                      <AppTextField v-model="form.logo_url" label="Logo URL" />
                    </VCol>

                    <VCol cols="12" md="12">
                      <AppTextField
                        v-model="form.image_url"
                        label="Image URL"
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="form.buttonGroup"
                        :items="ButtonGroupList"
                        label="CTA Group"
                        placeholder="Select Button Group"
                        item-title="label"
                        item-value="value"
                        clearable
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="12"
                      v-if="buttonGroupFields.length"
                      v-for="b in buttonGroupFields"
                    >
                      <AppTextField
                        v-model="form.buttonGroupValue[b.text]"
                        :label="'Button > ' + b.text"
                        placeholder="Enter URL"
                      />
                    </VCol>
                  </VRow>
                </VForm>
              </VWindowItem>
            </VWindow>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex gap-4">
            <VBtn @click="onSend" :disabled="isLoading">{{
              isLoading ? "loading..." : "Send Now"
            }}</VBtn>
            <!-- <VBtn color="secondary" variant="tonal"> Cancel </VBtn> -->
          </VCardText>
        </VCard>
      </v-card>
    </v-col>

    <!-- Preview Column -->
    <VCol cols="12" md="5">
      <VRow>
        <v-col cols="6" class="d-flex justify-center">
          <v-btn-toggle v-model="platform" mandatory density="compact">
            <v-btn value="ios">iOS</v-btn>
            <v-btn value="android">Android</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="6">
          <v-btn-toggle v-model="view" mandatory density="compact">
            <v-btn value="collapse">Collapse</v-btn>
            <v-btn value="expand">Expand</v-btn>
          </v-btn-toggle>
        </v-col>
      </VRow>
      <VRow>
        <v-col cols="12" class="d-flex justify-center">
          <NotificationPreview
            :platform="platform"
            :view="view"
            :form="form"
            :buttonGroupFields="buttonGroupFields"
          />
        </v-col>
      </VRow>
    </VCol>
  </v-row>
</template>

<script setup>
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";
import NotificationPreview from "@app/views/admin/push-notification/NotificationPreview.vue";
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";
const pushNotificationStore = usePushNotificationStore();
const channelsStore = useChannelsStore();
const { show } = inject("snackbar");
const isLoading = ref(false);

const DEFAULT_IMAGE_URL = `https://media.licdn.com/dms/image/v2/D4D22AQFUmh8m0Xg9Iw/feedshare-shrink_800/B4DZX.a7mYH4Ag-/0/1743730228531?e=1748476800&v=beta&t=836J66x0qjuiwEVD7ZgCUCxLm8z7QI5JI3qD6y_4ROY`;
const DEFAULT_LOGO_URL = `https://cdn.jsdelivr.net/gh/mehery-soccom/mehery-content@main/static/app/logo/bg-x-icon.png`;

const form = reactive({
  app_id: null,
  platforms: [],
  title: "",
  message: "",
  image_url: DEFAULT_IMAGE_URL,
  logo_url: DEFAULT_LOGO_URL,
  buttonGroup: null,
  buttonGroupValue: {},
});
const platform = ref("ios");
const view = ref("collapse");
const tab = ref("tab-basic-details");
const ChannelList = ref([]);

onMounted(async () => {
  // Code that needs to run after the component is mounted
  console.log("Component mounted");

  let res = await channelsStore.fetchChannels();
  ChannelList.value = res.results.map((c) => ({
    label: c.app_name || c.app_id,
    value: c.app_id,
  }));
});

const PlatformList = [
  { label: "IOS", value: "ios" },
  { label: "Android", value: "android" },
  { label: "Huawei", value: "huawei" },
];

const ButtonGroupList = [
  {
    label: "Yes | No",
    value: "BULK_NOTIFICATION",
    fields: [
      { text: "Yes", id: "YES_BTN" },
      { text: "No", id: "NO_BTN" },
    ],
  },
  {
    label: "Subscribe | Unsubscribe",
    value: "BULK_NOTIFICATION",
    fields: [
      { text: "Subscribe", id: "SUBSCRIBE_BTN" },
      { text: "Unsubscribe", id: "UNSUBSCRIBE_BTN" },
    ],
  },
];

const buttonGroupFields = computed(() => {
  if (form.buttonGroup) {
    return (
      ButtonGroupList.find((b) => b.value === form.buttonGroup)?.fields || []
    );
  }
  return [];
});

const onSend = async () => {
  try {
    isLoading.value = true;

    let payload = {
      title: form.title,
      message: form.message,
      channel_id: form.app_id,
      image_url: form.image_url,
      category: form.buttonGroup,
      buttons: buttonGroupFields.value.map((b) => ({
        button_id: b.id,
        button_text: b.text,
        button_url: form.buttonGroupValue[b.text],
      })),
      filter: {
        platform: form.platforms.join(" "),
        session_type: "all",
      },
    };

    await pushNotificationStore.sendBulk(payload);

    show({ message: "Notification sent successfully", color: "success" });
  } catch (error) {
    console.error(error);

    show({ message: "Something went wrong. try again", color: "error" });
  } finally {
    isLoading.value = false;
  }
};

// watch(form, (newValue) => {
//   console.log("watch : form", newValue);
// });

watch(platform, (newValue) => {
  view.value = "collapse";
});
</script>

<style scoped lang="scss"></style>
