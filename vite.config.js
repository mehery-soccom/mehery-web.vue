import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { fileURLToPath } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import DefineOptions from "unplugin-vue-define-options/vite"; // @ts-expect-error Known error: https://github.com/sxzz/unplugin-vue-macros/issues/257#issuecomment-1410752890
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),

    vuetify({
      styles: {
        configFile: "src/app/styles/variables/_vuetify.scss",
      },
    }),

    Pages({
      dirs: ["./src/app/pages"],

      // ℹ️ We need three routes using single routes so we will ignore generating route for this SFC file
      onRoutesGenerated: (routes) => [
        // Email filter
        {
          path: "/apps/email/:filter",
          name: "apps-email-filter",
          component: "/src/app/pages/apps/email/index.vue",
          meta: {
            navActiveLink: "apps-email",
            layoutWrapperClasses: "layout-content-height-fixed",
          },
        },

        // Email label
        {
          path: "/apps/email/label/:label",
          name: "apps-email-label",
          component: "/src/app/pages/apps/email/index.vue",
          meta: {
            // contentClass: 'email-application',
            navActiveLink: "apps-email",
            layoutWrapperClasses: "layout-content-height-fixed",
          },
        },
        ...routes,
      ],
    }),
    Layouts({
      layoutsDirs: "./src/app/layouts/",
    }),

    /*
    without :

    <template>
      <div>
        <HelloWorld msg="Hello Vue 3.0 + Vite" />
      </div>
    </template>

    <script>
      import HelloWorld from './src/components/HelloWorld.vue'

      export default {
        name: 'App',
        components: {
          HelloWorld,
        },
      }
    </script>


    with :

    <template>
      <div>
        <HelloWorld msg="Hello Vue 3.0 + Vite" />
      </div>
    </template>

    <script>
      export default {
        name: 'App',
      }
    </script>
    */
    Components({
      dirs: [
        "src/@core/components",
        "src/app/views/demos",
        "src/app/components",
      ],
      dts: false,
    }),
    /*
    without :

    import { computed, ref } from 'vue'

    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    

    with :

    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    */
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/core",
        "@vueuse/math",
        "vue-i18n",
        "pinia",
      ],
      vueTemplate: true,
      dts: false,
    }),

    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [
        fileURLToPath(
          new URL("./src/app/plugins/i18n/locales/**", import.meta.url)
        ),
      ],
    }),

    /*
    Options API can be declared using the defineOptions in <script setup>,
    specifically to be able to set name, props, emits, and render inside of one function.

    <script setup>
      defineOptions({
        name: 'Foo',
        inheritAttrs: false,
        props: {
          foo: number
        }
      })
    </script>

    <template>
      <Bar :foo="1" />
    </template>
    */
    DefineOptions(),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@themeConfig": fileURLToPath(
        new URL("./themeConfig.js", import.meta.url)
      ),
      apexcharts: fileURLToPath(
        new URL("node_modules/apexcharts-clevision", import.meta.url)
      ),

      // framework
      "@core": fileURLToPath(new URL("./src/@core", import.meta.url)),
      "@fake-db": fileURLToPath(new URL("./src/@fake-db", import.meta.url)),
      "@layouts": fileURLToPath(new URL("./src/@layouts", import.meta.url)),
      "@validators": fileURLToPath(
        new URL("./src/@core/utils/validators", import.meta.url)
      ),

      // custom
      "@app": fileURLToPath(new URL("./src/app", import.meta.url)),
      "@app-configured-variables": fileURLToPath(
        new URL("./src/app/styles/variables/_template.scss", import.meta.url)
      ),
    },
  },
  build: {
    // lib: {
    //   name: "myApp",
    //   entry: ["src/main.js"],
    // },
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
    chunkSizeWarningLimit: 5000,
  },
  server: {},
  optimizeDeps: {
    exclude: ["vuetify"],
    entries: ["./src/**/*.vue"],
  },
});
