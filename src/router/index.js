import { createRouter, createWebHistory } from 'vue-router'
// Assurez-vous d'avoir ces fichiers dans votre dossier src/views/
import External from '../views/External.vue'
import Logbook from '../views/Logbook.vue' 
import Import from '../views/Import.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/external' }, // Redirection par défaut
    { path: '/external', name: 'External', component: External },
    { path: '/logbook', name: 'Logbook', component: Logbook },
    { path: '/import', name: 'Import', component: Import },
    { path: '/settings', name: 'Settings', component: Settings },
  ]
})

export default router