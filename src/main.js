import { WEBAPP } from "@core/constants";
import { createVueApp } from "./bootstrap.js";

if (!window.__VUE_APP_MOUNTED__) {
  window.__VUE_APP_MOUNTED__ = true;

  (async (cmap, cname) => {
    try {
      console.log(`
        ################################# CDN DETAILS #################################
        APP :: ${WEBAPP}
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

    let c = cmap[cname];
    const { app } = await createVueApp(c);
    app.mount("#app");
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
      phone: {
        app: () => import("@app-phone/App.vue"),
      },
    },
    WEBAPP
  );
}
