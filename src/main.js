/* eslint-disable import/order */
import '@/@fake-db/db'
import '@/@iconify/icons-bundle'
import '@core/scss/template/index.scss'

import App from '@app/App.vue'
import router from '@app/router'
import ability from '@app/plugins/casl/ability'
import i18n from '@app/plugins/i18n'
import layoutsPlugin from '@app/plugins/layouts'
import vuetify from '@app/plugins/vuetify'
import { loadFonts } from '@app/plugins/webfontloader'
import '@app/styles/styles.scss'

import { abilitiesPlugin } from '@casl/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

loadFonts()


// Create vue app
const app = createApp(App)


// Use plugins
app.use(vuetify)
app.use(createPinia())
app.use(router)
app.use(layoutsPlugin)
app.use(i18n)
app.use(abilitiesPlugin, ability, {
  useGlobalProperties: true,
})

// Mount vue app
app.mount('#app')
