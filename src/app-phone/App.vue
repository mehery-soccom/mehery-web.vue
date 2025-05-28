<script setup>
import { onMounted } from "vue";
import Dailer from "./views/Dailer.vue";
// import Phone from "./views/Phone.vue";
// import Home from "./views/Home.vue";

onMounted(() => {
  console.log("Phone App mounted");
});
</script>

<template>
  <Dailer></Dailer>
  <br />
  <!-- <Home /> -->
  <br />
  <!-- <Phone /> -->
</template>

<style lang="scss">
.body {
  background-color: white;
}
</style>
