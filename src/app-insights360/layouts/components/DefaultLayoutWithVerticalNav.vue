<script setup>
import navItems from "@app-insights360/navigation/vertical";
import { useThemeConfig } from "@core/composable/useThemeConfig";

// Components
import Footer from "@app-insights360/layouts/components/Footer.vue";
// import NavBarI18n from '@app-insights360/layouts/components/NavBarI18n.vue'
import NavBarNotifications from "@app-insights360/layouts/components/NavBarNotifications.vue";
import NavbarShortcuts from "@app-insights360/layouts/components/NavbarShortcuts.vue";
import NavbarThemeSwitcher from "@app-insights360/layouts/components/NavbarThemeSwitcher.vue";
import NavSearchBar from "@app-insights360/layouts/components/NavSearchBar.vue";
import UserProfile from "@app-insights360/layouts/components/UserProfile.vue";

// @layouts plugin
import { VerticalNavLayout } from "@layouts";

const { appRouteTransition, isLessThanOverlayNavBreakpoint } = useThemeConfig();
const { width: windowWidth } = useWindowSize();
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          v-if="isLessThanOverlayNavBreakpoint(windowWidth)"
          id="vertical-nav-toggle-btn"
          class="ms-n3"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon size="26" icon="tabler-menu-2" />
        </IconBtn>

        <NavSearchBar class="ms-lg-n3" />

        <VSpacer />

        <!-- <NavBarI18n class="me-1" /> -->
        <NavbarThemeSwitcher class="me-1" />
        <NavbarShortcuts class="me-1" />
        <NavBarNotifications class="me-2" />
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <RouterView v-slot="{ Component }">
      <Transition :name="appRouteTransition" mode="out-in">
        <Component :is="Component" />
      </Transition>
    </RouterView>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <TheCustomizer />
  </VerticalNavLayout>
</template>
