<script setup>
import ChannelEditable from "@app/views/admin/channels/ChannelEditable.vue";

const channelData = ref({
  platforms: [{}],
});

const onCancel = () => {
  console.log("Cancelled");
};

const onCreate = () => {
  console.log("Created");
};
</script>

<template>
  <VRow>
    <VCol cols="12" md="9">
      <VRow>
        <VCol cols="12">
          <ChannelEditable :data="channelData" />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" class="text-right">
          <div class="px-6">
            <VBtn @click="onCreate"> Create </VBtn>
            <VBtn
              class="mr-3"
              variant="tonal"
              color="secondary"
              @click="onCancel"
            >
              Cancel
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>
