<script setup>
import NotificationPreview from "@app/views/admin/push-notification/NotificationPreview.vue";
import { usePushNotificationStore } from "@app/views/admin/push-notification/usePushNotificationStore";
const { show } = inject("snackbar");

const DEFAULT_IMAGE_URL = `https://media.licdn.com/dms/image/v2/D4D22AQFUmh8m0Xg9Iw/feedshare-shrink_800/B4DZX.a7mYH4Ag-/0/1743730228531?e=1748476800&v=beta&t=836J66x0qjuiwEVD7ZgCUCxLm8z7QI5JI3qD6y_4ROY`;
const DEFAULT_LOGO_URL = `https://cdn.jsdelivr.net/gh/mehery-soccom/mehery-content@main/static/app/logo/bg-x-icon.png`;

const route = useRoute();
const router = useRouter();
const pushNotificationStore = usePushNotificationStore();

const tab = ref("tab-details");
const isLoading = ref(false);
const template = reactive({
  type: "simple",
  subType: null,
  desc: "",
  code: "",
  style: {
    title: "",
    message: "",
    image_url: DEFAULT_IMAGE_URL,
    logo_url: DEFAULT_LOGO_URL,
    category: null,
  },
});
const view = ref({
  platform: "ios",
  mode: "collapse",
  appearance: "light",
});
const buttonGroupValue = ref({});
const buttonGroupFields = computed(() => {
  if (template.style.category) {
    return (
      pushNotificationStore.buttonGroupList.find(
        (b) => b.value === template.style.category
      )?.fields || []
    );
  }
  return [];
});
const templatePreview = computed(() => {
  return {
    view: view.value,
    ...template,
    options: {
      buttons: buttonGroupFields.value,
    },
    model: {
      data: {},
    },
  };
});

onMounted(async () => {
  const copy = route.query.copy;
  if (copy) {
    pushNotificationStore
      .fetchTemplate({ id: copy })
      .then((response) => {
        const _template = response.data.data;
        Object.assign(template, {
          ...template,
          ..._template,
        });
        let _buttonGroupValue = {};
        _template.options.buttons.map((b) => {
          _buttonGroupValue[b.button_text] = b.button_url;
        });
        buttonGroupValue.value = _buttonGroupValue;
      })
      .catch((error) => {
        console.log(error);
        show({ message: "Something went wrong", color: "error" });
      });
  }
});

const onCreate = async () => {
  try {
    isLoading.value = true;

    let payload = {
      ...template,
      options: {
        buttons: buttonGroupFields.value.map((b) => ({
          button_id: b.id,
          button_text: b.text,
          button_url: buttonGroupValue.value[b.text],
        })),
      },
      model: {
        data: {},
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

watch(
  () => view.value.platform,
  () => {
    view.value.mode = "collapse";
  }
);
</script>

<template>
  <v-row>
    <!-- template Column -->
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
        </VTabs>

        <VCard flat>
          <VCardText>
            <VWindow v-model="tab" class="disable-tab-transition">
              <VWindowItem value="tab-details">
                <VForm>
                  <VRow>
                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="template.type"
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

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-if="template.type === 'styled'"
                        v-model="template.subType"
                        :items="[{ label: 'Delivery', value: 'delivery' }]"
                        label="Sub Type"
                        placeholder="Select Sub Type"
                        item-title="label"
                        item-value="value"
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppTextField
                        v-model="template.desc"
                        label="Description"
                        placeholder="Enter Description"
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppTextField
                        v-model="template.code"
                        label="Code"
                        placeholder="Enter Code"
                      />
                    </VCol>

                    <VDivider class="mt-4" />

                    <VCol cols="12" md="12">
                      <AppTextField
                        v-model="template.style.title"
                        label="Title"
                        placeholder="Enter Notification Title"
                      />
                    </VCol>

                    <VCol cols="12" md="12">
                      <AppTextarea
                        v-model="template.style.message"
                        label="Message"
                        placeholder="Enter Notification Message"
                      />
                    </VCol>

                    <VCol cols="12" md="12">
                      <AppTextField
                        v-model="template.style.logo_url"
                        label="Logo URL ( public )"
                      />
                    </VCol>

                    <VCol cols="12" md="12">
                      <AppTextField
                        v-model="template.style.image_url"
                        label="Image URL ( public )"
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="template.style.category"
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
                        v-model="buttonGroupValue[b.text]"
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
          <v-btn-toggle v-model="view.platform" mandatory density="compact">
            <v-btn value="ios">iOS</v-btn>
            <v-btn value="android">Android</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="6">
          <v-btn-toggle v-model="view.mode" mandatory density="compact">
            <v-btn value="collapse">Collapse</v-btn>
            <v-btn value="expand">Expand</v-btn>
          </v-btn-toggle>
        </v-col>
      </VRow>
      <VRow>
        <v-col cols="12" class="d-flex justify-center">
          <NotificationPreview :template="templatePreview" />
        </v-col>
      </VRow>
    </VCol>
  </v-row>
</template>

<style scoped lang="scss"></style>
