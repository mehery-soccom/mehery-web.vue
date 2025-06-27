<script setup>
import { onMounted } from "vue";
import Phone from "./views/Phone.vue";
// import PhoneJssip from "./views/PhoneJssip.vue";
onMounted(() => {
  console.log("App mounted");
});
</script>

<template>
  <!-- <Dailer></Dailer> -->
  <!-- <br /> -->
  <!-- <Home /> -->
  <!-- <br /> -->
  <!-- <PhoneJssip /> -->
   <Phone />
</template>

<style lang="scss">
</style>
