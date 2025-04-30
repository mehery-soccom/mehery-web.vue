<script setup>
import "@core/scss/template/index.scss";

import "@app-notebook/styles/styles.scss";

import { loadFonts } from "@app-notebook/plugins/webfontloader";
loadFonts();

import { useTheme } from "vuetify";

import ScrollToTop from "@core/components/ScrollToTop.vue";
import { useThemeConfig } from "@core/composable/useThemeConfig";

import SnackbarProvider from "@app-notebook/plugins/SnackbarProvider.vue";
import { hexToRgb } from "@layouts/utils";

const {
  syncInitialLoaderTheme,
  syncVuetifyThemeWithTheme: syncConfigThemeWithVuetifyTheme,
  isAppRtl,
  handleSkinChanges,
} = useThemeConfig();

const { global } = useTheme();

// ℹ️ Sync current theme with initial loader theme
syncInitialLoaderTheme();
syncConfigThemeWithVuetifyTheme();
handleSkinChanges();
</script>

<template>
  <VLocaleProvider :rtl="isAppRtl">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <SnackbarProvider>
      <VApp
        :style="`--v-global-theme-primary: ${hexToRgb(
          global.current.value.colors.primary
        )}`"
      >
        <RouterView />
        <ScrollToTop />
      </VApp>
    </SnackbarProvider>
  </VLocaleProvider>
</template>
