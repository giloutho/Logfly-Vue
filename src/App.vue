
<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Logfly Vue</v-toolbar-title>
      <v-spacer />
      <v-btn to="/external" variant="text" router>
        Trace externe
      </v-btn>
      <v-btn to="/logbook" variant="text" router>
        Carnet de vol
      </v-btn>
      <v-btn to="/import" variant="text" router>
        Import
      </v-btn>
      <v-btn to="/settings" variant="text" router>
        Paramètres
      </v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
// Vuetify et router sont déjà configurés dans main.js
</script>

<style scoped>
/* Style minimal pour le layout */
v-main {
  padding: 2rem;
}
</style>
