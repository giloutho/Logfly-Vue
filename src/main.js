import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. Importations Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Importation des icônes

// 2. Création de l'instance Vuetify
const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VBtn: {
      // pour éviter une erreur Vuetify liée aux "ripples" (effet visuel au clic sur les boutons) 
      ripple: false
    }
  },
  icons: {
    defaultSet: 'mdi', // Utilisation des MDI par défaut
  },
})

const app = createApp(App)

// 3. Utilisation de Vuetify et Vue Router
app.use(router)
app.use(vuetify)

app.mount('#app')
