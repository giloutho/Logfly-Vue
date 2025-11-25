<template>
  <section>
    <h1>Logbook</h1>
    <p>Bienvenue sur la page du carnet de vol.</p>
    
    <v-btn color="primary" @click="openDialog = true">
      Ouvrir carnet
    </v-btn>
    
    <v-btn v-if="db" color="success" @click="testUpdate" style="margin-left: 10px;">
      Test Update
    </v-btn>
    
    <v-btn v-if="db" color="secondary" @click="saveDb" style="margin-left: 10px;">
      Sauvegarder
    </v-btn>
    
    <v-dialog v-model="openDialog" max-width="500">
      <v-card>
        <v-card-title>Sélectionner un fichier SQLite</v-card-title>
        <v-card-text>
          <input type="file" accept=".db,.sqlite,.sqlite3" @change="onFileChange" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="openDialog = false">Annuler</v-btn>
          <v-btn text @click="loadDatabase" :disabled="!selectedFile">Ouvrir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <div v-if="loading" style="margin-top: 20px;">
      <v-progress-circular indeterminate color="primary" /> Chargement de la base...
    </div>
    
    <div v-if="queryResult" style="margin-top: 20px;">
      <h3>Résultat de la requête test :</h3>
      <pre>{{ queryResult }}</pre>
    </div>
    
    <div v-if="error" style="margin-top: 20px; color: red;">
      <b>Erreur :</b> {{ error }}
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { readSqliteFile, openDatabase, executeQuery, closeDatabase, saveDatabase } from '@/utils/database/sql-manager.js'

const openDialog = ref(false)
const selectedFile = ref(null)
const loading = ref(false)
const queryResult = ref(null)
const error = ref('')
const db = ref(null)

function onFileChange(event) {
  selectedFile.value = event.target.files[0]
}

async function loadDatabase() {
  if (!selectedFile.value) return
  
  loading.value = true
  error.value = ''
  queryResult.value = null
  openDialog.value = false
  
  try {
    // Lire le fichier
    const fileBuffer = await readSqliteFile(selectedFile.value)
    
    // Ouvrir la base
    db.value = await openDatabase(fileBuffer)
    
    // Requête de test : lister les tables
    const result = executeQuery(db.value, "SELECT name FROM sqlite_master WHERE type='table';")
    
    if (result.success) {
      queryResult.value = result.data
      console.log('Tables de la base :', result.data)
    } else {
      error.value = result.message
    }
  } catch (e) {
    error.value = e.message || 'Erreur lors du chargement de la base'
  } finally {
    loading.value = false
  }
}

function testUpdate() {
  if (!db.value) return
  
  try {
    // Exemple d'UPDATE (à adapter selon ta structure de base)
    // Pour le test, on crée une table temporaire et on fait un update
    executeQuery(db.value, "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT);")
    executeQuery(db.value, "INSERT OR REPLACE INTO test (id, name) VALUES (1, 'Test initial');")
    executeQuery(db.value, "UPDATE test SET name='Test modifié' WHERE id=1;")
    
    // Vérifier le résultat
    const result = executeQuery(db.value, "SELECT * FROM test;")
    queryResult.value = result.data
    console.log('Résultat après UPDATE :', result.data)
  } catch (e) {
    error.value = e.message || 'Erreur lors de l\'UPDATE'
  }
}

function saveDb() {
  if (!db.value) return
  
  try {
    const filename = selectedFile.value?.name || 'carnet_modifie.db'
    saveDatabase(db.value, filename)
    console.log('Base sauvegardée :', filename)
  } catch (e) {
    error.value = e.message || 'Erreur lors de la sauvegarde'
  }
}
</script>

<style scoped>
section {
  padding: 2rem;
  text-align: center;
}
h1 {
  color: #1976d2;
  margin-bottom: 1rem;
}
</style>
