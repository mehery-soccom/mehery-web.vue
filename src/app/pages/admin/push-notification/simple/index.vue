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
                      <AppTextField
                        v-model="form.image_url"
                        label="Image URL"
                      />
                    </VCol>

                    <VCol cols="12" md="6">
                      <AppSelect
                        v-model="form.buttonGroup"
                        :items="ButtonGroupList"
                        label="CTA Buttons"
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
                        v-model="form.buttonGroupValue[b.label]"
                        :label="b.label"
                        placeholder="Enter Value"
                      />
                    </VCol>
                  </VRow>
                </VForm>
              </VWindowItem>
            </VWindow>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex gap-4">
            <VBtn>Send Now</VBtn>
            <VBtn color="secondary" variant="tonal"> Cancel </VBtn>
          </VCardText>
        </VCard>
      </v-card>
    </v-col>

    <!-- Preview Column -->
    <VCol cols="12" md="5">
      <VRow>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn-toggle v-model="platform" mandatory density="compact">
            <v-btn value="ios">iOS</v-btn>
            <v-btn value="android">Android</v-btn>
          </v-btn-toggle>
        </v-col>
      </VRow>
      <VRow>
        <v-col cols="12" class="d-flex justify-center">
          <NotificationPreview
            :platform="platform"
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
import NotificationPreview from "@app/views/admin/push-notification/NotificationPreview.vue";

const DEFAULT_IMAGE_URL = `https://cdn.jsdelivr.net/gh/mehery-soccom/mehery-content@main/static/app/logo/bg-x-icon.png`;

const form = reactive({
  app_id: null,
  platforms: [],
  filter: {},
  title: "",
  message: "",
  image_url: DEFAULT_IMAGE_URL,
  buttonGroup: null,
  buttonGroupValue: {},
});
const platform = ref("ios");
const tab = ref("tab-basic-details");

const ChannelList = [
  { label: "agent app", value: "app_id_1" },
  { label: "oa app", value: "app_id_2" },
];

const PlatformList = [
  { label: "IOS", value: "ios" },
  { label: "Android", value: "android" },
];

const ButtonGroupList = [
  {
    label: "Yes | No",
    value: "yes",
    fields: [{ label: "Yes" }, { label: "No" }],
  },
  {
    label: "Subscribe | Unsubscribe",
    value: "subscribe",
    fields: [{ label: "Subscribe" }, { label: "Unsubscribe" }],
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

// watch(form, (newValue) => {
//   console.log("watch : form", newValue);
// });
</script>

<style scoped lang="scss"></style>
