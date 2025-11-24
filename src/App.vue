

<template>
  <v-app>
    <v-app-bar color="primary" dark height="48">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="display-md-none" />
      <v-toolbar-title>Logfly Vue</v-toolbar-title>
      <v-spacer />
      <div class="display-none display-md-flex">
        <v-btn :to="'/external'" variant="text" class="nav-btn">
          Trace externe
        </v-btn>
        <v-btn :to="'/logbook'" variant="text" class="nav-btn">
          Carnet de vol
        </v-btn>
        <v-btn :to="'/import'" variant="text" class="nav-btn">
          Import
        </v-btn>
        <v-btn :to="'/settings'" variant="text" class="nav-btn">
          Paramètres
        </v-btn>
      </div>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app temporary class="display-md-none">
      <v-list>
        <v-list-item :to="'/external'">
          <v-list-item-title class="nav-btn">Trace externe</v-list-item-title>
        </v-list-item>
        <v-list-item :to="'/logbook'">
          <v-list-item-title class="nav-btn">Carnet de vol</v-list-item-title>
        </v-list-item>
        <v-list-item :to="'/import'">
          <v-list-item-title class="nav-btn">Import</v-list-item-title>
        </v-list-item>
        <v-list-item :to="'/settings'">
          <v-list-item-title class="nav-btn">Paramètres</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(false)
// Vuetify et router sont déjà configurés dans main.js
</script>

<style scoped>
/* Style minimal pour le layout */
v-main {
  padding: 2rem;
}
.v-app-bar {
  min-height: 48px !important;
  height: 48px !important;
}
.nav-btn {
  font-size: 0.75rem !important;
  letter-spacing: 0.5px;
  padding: 0 8px;
}
</style>
