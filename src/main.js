import { abilitiesPlugin } from "@casl/vue";
import { createPinia } from "pinia";
import { createApp } from "vue";

import "@/@iconify/icons-bundle";

import vuetify from "@app/plugins/vuetify";

import ability from "@app/plugins/casl/ability"; // TODO - not needed
// import i18n from "@app/plugins/i18n";

(async (cmap, cname) => {
  let c = cmap[cname];
  console.log(`app name : ${JSON.stringify(cname)}`);
  if (!c) return console.log("Invalid APP", { cname });

  const _app = await c.app();
  const _router = await c.router();
  const _layoutsPlugin = await c.layoutsPlugin();

  const app = createApp(_app.default);

  app.use(_router.default);
  app.use(_layoutsPlugin.default);
  app.use(vuetify);
  app.use(createPinia());
  // app.use(i18n);
  app.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  });

  app.mount("#app");

  try {
    console.log(`
    ################################# CDN DETAILS #################################
    VERSION :: ${process.env?.VUE_APP_VERSION || "-"}
    BUILD TIME :: ${
      process.env?.VUE_APP_TIMESTAMP
        ? new Date(Number(process.env.VUE_APP_TIMESTAMP))
        : "-"
    }
    ###############################################################################
  `);
  } catch (error) {
    console.error(error);
  }
})(
  {
    pushapp: {
      app: () => import("@app/App.vue"),
      router: () => import("@app/router"),
      layoutsPlugin: () => import("@app/plugins/layouts"),
    },
    insights360: {
      app: () => import("@app-insights360/App.vue"),
      router: () => import("@app-insights360/router"),
      layoutsPlugin: () => import("@app-insights360/plugins/layouts"),
    },
    notebook: {
      app: () => import("@app-notebook/App.vue"),
      router: () => import("@app-notebook/router"),
      layoutsPlugin: () => import("@app-notebook/plugins/layouts"),
    },
  },
  window.CONST.APP // WEBAPP
);
