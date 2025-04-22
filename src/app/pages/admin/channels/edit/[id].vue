<script setup>
import ChannelEditable from "@app/views/admin/channels/ChannelEditable.vue";

import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";

const channelsStore = useChannelsStore();
const route = useRoute();
const channelData = ref({
  platforms: [{}],
});
const paramId = route.params.id;
if (paramId) {
  console.log("paramId", paramId);
  channelsStore
    .fetchChannel({ id: paramId })
    .then((response) => {
      console.log(response);
      channelData.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      // show error
    });
} else {
  // show error
}

const onCancel = () => {
  console.log("Cancelled");
};

const onUpdate = () => {
  console.log("Updated");
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
            <VBtn @click="onUpdate"> Update </VBtn>
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
