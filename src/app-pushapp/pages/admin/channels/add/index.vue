<script setup>
import ChannelEditable from "@app/views/admin/channels/ChannelEditable.vue";
import { useChannelsStore } from "@app/views/admin/channels/useChannelsStore";

const { show } = inject("snackbar");
// const route = useRoute();
const router = useRouter();
const channelsStore = useChannelsStore();
const isLoading = ref(false);
const channelData = ref({
  platforms: [{ active: true }],
});
// const paramId = route.params.id;

onMounted(async () => {
  // if (paramId) {
  //   channelsStore
  //     .fetchChannel({ id: paramId })
  //     .then((response) => {
  //       channelData.value = response.data.channel;
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       show({ message: "Something went wrong", color: "error" });
  //     });
  // } else {
  //   show({ message: "Channel ID missing", color: "error" });
  // }
});

const onCreate = async () => {
  try {
    isLoading.value = true;

    const formData = new FormData();
    formData.append("channel_name", channelData.value.channel_name);
    // formData.append("company_id", channelData.value.company_id);
    // formData.append("company_name", channelData.value.company_name);
    channelData.value.platforms.map((p) => {
      formData.append(`${p.platform_type}_file`, p.file);
      formData.append(`${p.platform_type}_bundle_id`, p.bundle_id);
      if (p.platform_type === "ios") {
        formData.append(`key_id`, p.key_id);
        formData.append(`team_id`, p.team_id);
      }
    });

    await channelsStore.createChannel(formData);
    show({ message: "Channel created successfully", color: "success" });
    router.push({ name: "admin-channels-list" });
  } catch (error) {
    console.error(error);
    show({ message: "Something went wrong", color: "error" });
  } finally {
    isLoading.value = false;
  }
};

// const onUpdate = async () => {};
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
            <VBtn @click="onCreate" class="mr-3" :disabled="isLoading">{{
              isLoading ? "loading..." : "Create"
            }}</VBtn>
            <!-- <VBtn @click="onUpdate" class="mr-3" :disabled="isLoading">{{
              isLoading ? "loading..." : "Update"
            }}</VBtn> -->
            <VBtn
              variant="tonal"
              color="secondary"
              :to="{ name: 'admin-channels-list' }"
            >
              Cancel
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>
