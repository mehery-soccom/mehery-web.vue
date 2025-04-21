<!-- eslint-disable vue/no-mutating-props -->
<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(["removePlatform"]);

const itemsOptions = [
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
];

const localData = ref(structuredClone(toRaw(props.data)));

const removePlatform = () => {
  emit("removePlatform", this.data.platform_id);
};
</script>

<template>
  <VCard flat border class="d-flex flex-row">
    <!-- 👉 Left Form -->
    <div class="pa-5 flex-grow-1">
      <VRow>
        <VCol cols="12" md="6">
          <AppSelect
            v-model="data.platform_type"
            :items="itemsOptions"
            item-title="label"
            item-value="value"
            label="Platform Type"
            placeholder="Select Platform Type"
            class="mb-3"
          />
        </VCol>

        <VCol cols="12" md="6">
          <AppTextField v-model="data.bundle_id" label="Bundle ID" />
        </VCol>
      </VRow>

      <VRow class="mt-0">
        <VCol cols="12" md="6">
          <AppTextField v-model="data.team_id" label="Team ID"
        /></VCol>

        <VCol cols="12" md="6">
          <AppTextField v-model="data.key_id" label="Key ID"
        /></VCol>
      </VRow>

      <VRow>
        <VCol cols="12" md="6">
          <VFileInput
            class="mt-2"
            show-size
            counter
            prepend-icon
            append-inner-icon="$file"
            label="Certificate"
          />
        </VCol>
      </VRow>
    </div>

    <!-- 👉 Item Actions -->
    <div class="d-flex flex-column justify-space-between border-s pa-1">
      <IconBtn @click="removePlatform">
        <VIcon size="20" icon="tabler-x" />
      </IconBtn>
    </div>
  </VCard>
</template>
