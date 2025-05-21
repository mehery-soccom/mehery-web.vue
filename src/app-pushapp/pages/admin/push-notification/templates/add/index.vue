<script setup>
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";
import NotificationPreview from "@app/views/admin/push-notification/NotificationPreview.vue";
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";

const route = useRoute();
const router = useRouter();
const pushNotificationStore = usePushNotificationStore();
const channelsStore = useChannelsStore();
const { show } = inject("snackbar");
const isLoading = ref(false);

const DEFAULT_IMAGE_URL = `https://media.licdn.com/dms/image/v2/D4D22AQFUmh8m0Xg9Iw/feedshare-shrink_800/B4DZX.a7mYH4Ag-/0/1743730228531?e=1748476800&v=beta&t=836J66x0qjuiwEVD7ZgCUCxLm8z7QI5JI3qD6y_4ROY`;
const DEFAULT_LOGO_URL = `https://cdn.jsdelivr.net/gh/mehery-soccom/mehery-content@main/static/app/logo/bg-x-icon.png`;

const form = reactive({
  type: "simple",
  desc: "",
  code: "",

  title: "",
  message: "",
  image_url: DEFAULT_IMAGE_URL,
  logo_url: DEFAULT_LOGO_URL,
  buttonGroup: null,
  buttonGroupValue: {},

  channel_id: null,
  platforms: [],
});
const platform = ref("ios");
const view = ref("collapse");
const tab = ref("tab-details");
const ChannelList = ref([]);

onMounted(async () => {
  let res = await channelsStore.fetchChannels();
  ChannelList.value = res.results.map((c) => ({
    label: c.channel_name || c.channel_id,
    value: c.channel_id,
  }));

  const copy = route.query.copy;
  if (copy) {
    pushNotificationStore
      .fetchSimpleNotification({ id: copy })
      .then((response) => {
        console.log(response.data.notification);
        const notification = response.data.notification;
        let _buttonGroupValue = {};
        notification.buttons.map((b) => {
          _buttonGroupValue[b.button_text] = b.button_url;
        });
        Object.assign(form, {
          ...form,
          ...notification,
          buttonGroup: notification.category,
          buttonGroupValue: _buttonGroupValue,
        });
      })
      .catch((error) => {
        console.log(error);
        show({ message: "Something went wrong", color: "error" });
      });
  }
});

const buttonGroupFields = computed(() => {
  if (form.buttonGroup) {
    return (
      pushNotificationStore.buttonGroupList.find(
        (b) => b.value === form.buttonGroup
      )?.fields || []
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
      channel_id: form.channel_id,
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

const onCreate = async () => {
  try {
    isLoading.value = true;

    let payload = {
      type: form.type,
      desc: form.desc,
      code: form.code,

      model: {
        data: {},
      },
      style: {
        title: form.title,
        message: form.message,
        image_url: form.image_url,
        category: form.buttonGroup,
      },
      options: {
        buttons: buttonGroupFields.value.map((b) => ({
          button_id: b.id,
          button_text: b.text,
          button_url: form.buttonGroupValue[b.text],
        })),
      },

      filter: {
        channel_id: form.channel_id,
        platform: form.platforms.join(" "),
        session_type: "all",
      },
    };

    await pushNotificationStore.createTemplate(payload);

    show({ message: "Template created successfully", color: "success" });

    router.push({ name: "admin-push-notification-templates-list" });
  } catch (error) {
    console.error(error);

    show({ message: "Something went wrong. try again", color: "error" });
  } finally {
    isLoading.value = false;
  }
};

watch(platform, (newValue) => {
  view.value = "collapse";
});
</script>

<template>
  <v-row>
    <!-- Form Column -->
    <v-col cols="12" md="7">
      <v-card>
        <v-card-item>
          <v-card-title>Create Template</v-card-title>
          <v-card-subtitle
            >This template will be used for sending Push
            Notification</v-card-subtitle
          >
        </v-card-item>

        <VTabs v-model="tab">
          <VTab value="tab-details"> Details </VTab>
          <!-- <VTab value="tab-segments"> Segments </VTab> -->
        </VTabs>

        <VCard flat>
          <VCardText>
            <VWindow v-model="tab" class="disable-tab-transition">
              <VWindowItem value="tab-details">
                <VForm>
                  <VRow>
                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="form.type"
                        :items="[
                          { label: 'Simple', value: 'simple' },
                          { label: 'Styled', value: 'styled' },
                        ]"
                        label="Type"
                        placeholder="Select Type"
                        item-title="label"
                        item-value="value"
                      />
                    </VCol>

                    <VCol cols="12" md="6"> </VCol>

                    <VCol cols="12" md="6">
                      <AppTextField
                        v-model="form.desc"
                        label="Description"
                        placeholder="Enter Description"
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppTextField
                        v-model="form.code"
                        label="Code"
                        placeholder="Enter Code"
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
                        :items="pushNotificationStore.buttonGroupList"
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

              <!-- <VWindowItem value="tab-segments">
                <VForm>
                  <VRow>
                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="form.channel_id"
                        :items="ChannelList"
                        label="App"
                        placeholder="Select App"
                        item-title="label"
                        item-value="value"
                        clearable
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="form.platforms"
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
              </VWindowItem> -->
            </VWindow>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex gap-4">
            <VBtn @click="onCreate" :disabled="isLoading">{{
              isLoading ? "loading..." : "Create"
            }}</VBtn>
            <VBtn
              variant="tonal"
              color="secondary"
              :to="{ name: 'admin-push-notification-templates-list' }"
            >
              Cancel
            </VBtn>
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

<style scoped lang="scss"></style>
