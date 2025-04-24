<script setup>
import ChannelPlatformEditable from "./ChannelPlatformEditable.vue";

const props = defineProps({
  data: {
    type: null,
    required: true,
    default: {},
  },
});

const emit = defineEmits(["fileUpload"]);

const itemsOptions = (platform) => {
  return [
    {
      label: "Android",
      value: "android",
    },
    {
      label: "IOS",
      value: "ios",
    },
    {
      label: "Huawei",
      value: "huawei",
    },
  ].filter(
    (i) =>
      i.value === platform.platform_type ||
      !props.data.platforms.find((p) => i.value === p.platform_type)
  );
};

const addPlatform = () => {
  props.data.platforms.push({});
};

const removePlatform = (index) => {
  props.data.platforms.splice(index, 1); // TODO
};

const handleFileUpload = (file, index) => {
  props.data.platforms[index].file = file;
};
</script>

<template>
  <VCard>
    <v-card-item>
      <v-card-title>Channel Details</v-card-title>
      <!-- <v-card-subtitle>Details below</v-card-subtitle> -->
    </v-card-item>

    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <AppTextField
            v-model="data.app_name"
            label="Channel Name"
            placeholder="Enter Channel Name"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" md="6">
          <AppTextField
            v-model="data.company_name"
            label="Company Name"
            placeholder="Your Company Name"
          />
        </VCol>
        <VCol cols="12" md="6">
          <AppTextField
            v-model="data.company_id"
            label="Company ID"
            placeholder="Your Company ID"
          />
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <v-card-item>
      <template #append>
        <VBtn size="38" @click="addPlatform">
          <VIcon size="22" icon="tabler-plus" />
        </VBtn>
      </template>
      <v-card-title>Platform Details</v-card-title>
    </v-card-item>

    <VCardText class="add-products-form">
      <div
        v-for="(platform, index) in props.data.platforms"
        :key="'platform.' + index"
      >
        <ChannelPlatformEditable
          :index="index"
          :itemsOptions="itemsOptions(platform)"
          :data="platform"
          @remove-platform="removePlatform"
          @fileUpload="handleFileUpload"
        />
      </div>
    </VCardText>
  </VCard>
</template>

<style scss>
.add-products-form > :not(:first-child) {
  margin-top: 1.5rem;
}
</style>
