import "@/@iconify/icons-bundle";

import { createApp } from "vue";
import { abilitiesPlugin } from "@casl/vue";
import { createPinia } from "pinia";

import vuetify from "@app/plugins/vuetify";
import ability from "@app/plugins/casl/ability"; // TODO - not needed
// import i18n from "@app/plugins/i18n";

export async function createVueApp(c) {
  if (!c) return console.log("Invalid APP", { cname });

  const _app = await c.app();
  const app = createApp(_app.default);

  if (c.router) {
    const _router = await c.router();
    app.use(_router.default);
  }

  if (c.layoutsPlugin) {
    const _layoutsPlugin = await c.layoutsPlugin();
    app.use(_layoutsPlugin.default);
  }

  app.use(vuetify);
  app.use(createPinia());
  // app.use(i18n);
  app.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  });

  return {
    app,
    // router
  };
}
