<!-- eslint-disable vue/no-mutating-props -->
<script setup>
const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  itemsOptions: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(["removePlatform", "fileUpload"]);

const localData = ref(structuredClone(toRaw(props.data)));

const handleFileUpload = (event) => {
  emit("fileUpload", event.target.files[0], props.index);
};

const removePlatform = () => {
  emit("removePlatform", props.index);
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
          <AppTextField
            v-model="data.bundle_id"
            label="Bundle ID"
            placeholder="Enter Bundle ID"
          />
        </VCol>
      </VRow>

      <VRow class="mt-0" v-if="data.platform_type === 'ios'">
        <VCol cols="12" md="6">
          <AppTextField
            v-model="data.team_id"
            label="Team ID"
            placeholder="Enter Team ID"
        /></VCol>

        <VCol cols="12" md="6">
          <AppTextField
            v-model="data.key_id"
            label="Key ID"
            placeholder="Enter Key ID"
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
            @change="handleFileUpload"
            accept="application/JSON, .p8"
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
