<template>
  <section>
    <v-btn color="primary" @click="dialog = true">
      Choisir un fichier trace
    </v-btn>
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Choisir un fichier</v-card-title>
        <v-card-text>
          <input type="file" @change="onFileChange" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Annuler</v-btn>
          <v-btn text @click="validateFile">Valider</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div v-if="decodedData">
      <h2>Résultat du décodage :</h2>
      <div v-if="decodedData.success">
        <p><strong>Pilote :</strong> {{ decodedData.data.info.pilot }}</p>
        <p><strong>Date :</strong> {{ decodedData.data.info.date }}</p>
        <p><strong>Distance :</strong> {{ decodedData.data.stat.distance.toFixed(2) }} km</p>
        <p><strong>Durée :</strong> {{ decodedData.data.stat.duration.toFixed(0) }} s</p>
        <p><strong>Altitude max :</strong> {{ decodedData.data.stat.maxalt.gps }} m</p>
        <p><strong>Altitude min :</strong> {{ decodedData.data.stat.minialt.gps }} m</p>
        <p><strong>offsetUTC :</strong> {{ decodedData.data.info.offsetUTC }} h</p>
        <!-- Ajoute d'autres infos si besoin -->
        <details>
          <summary>Données brutes</summary>
          <pre>{{ decodedData.data }}</pre>
        </details>
      </div>
      <div v-else>
        <p style="color: red;">Erreur : {{ decodedData.message }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { igcDecoding } from '@/utils/igc/igc-decoder.js';

const dialog = ref(false)
const selectedFile = ref(null)
const fileContent = ref('')
const decodedData = ref(null)

function onFileChange(event) {
  selectedFile.value = event.target.files[0]
}

function validateFile() {
  if (selectedFile.value) {
    const reader = new FileReader()
    reader.onload = function(e) {
      fileContent.value = e.target.result
      decodedData.value = igcDecoding(fileContent.value)
      console.log('Décodé:', decodedData.value)
    }
    reader.readAsText(selectedFile.value)
    console.log(selectedFile.value.name)
  }
  dialog.value = false
}
</script>

<style scoped>
section {
  padding: 2rem;
  text-align: center;
}
h1 {
  color: #8e76e4;
  margin-bottom: 1rem;
}
</style>