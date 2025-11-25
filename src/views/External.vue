<template>
  <section>
    <div class="toolbar-row">
      <v-btn color="primary" @click="dialog = true">
        Choisir un fichier trace
      </v-btn>
      <template v-if="decodedData && decodedData.success">
        <v-btn class="toolbar-btn" color="default" @click="infosDialog = true" :disabled="!anaResult">Infos</v-btn>
            <v-dialog v-model="infosDialog" max-width="600">
              <v-card>
                <v-card-title>Informations sur la trace</v-card-title>
                <v-card-text>
                  <div v-if="anaResult && decodedData && decodedData.success">
                    <div style="display: flex; flex-wrap: wrap; gap: 32px;">
                      <div>
                        <div><b>Date :</b> {{ decodedData.data.info.date || '-' }}</div>
                        <div><b>Pilote :</b> {{ decodedData.data.info.pilot || '-' }}</div>
                        <div><b>Décollage :</b> {{ anaResult.takeoffTime || '-' }}</div>
                        <div><b>Atterrissage :</b> {{ anaResult.landingTime || '-' }}</div>
                        <div><b>Durée :</b> {{ anaResult.duration || '-' }}</div>
                        <div><b>Alt max GPS :</b> {{ decodedData.data.stat.maxalt.gps || '-' }} m</div>
                        <div><b>Vario max :</b> {{ decodedData.data.stat.maxclimb || '-' }} m/s</div>
                        <div><b>Gain max :</b> {{ anaResult.gainMax || '-' }} m</div>
                        <div><b>Meilleure transition :</b> {{ anaResult.bestTransition || '-' }} km</div>
                        <div><b>Vit moyenne transition :</b> {{ anaResult.avgTransitionSpeed || '-' }} km/h</div>
                        <div><b>Taux moyen montée :</b> {{ anaResult.avgClimbRate || '-' }} m/s</div>
                        <div><b>Délai d'extraction :</b> {{ anaResult.extractionDelay || '-' }}</div>
                        <div><b>Efficacité moyenne :</b> <span style="background:#f5e6d6;padding:2px 8px;border-radius:6px;">{{ anaResult.avgEfficiency || '-' }} %</span></div>
                      </div>
                      <div>
                        <div><b>Site :</b> {{ anaResult.site || '-' }}</div>
                        <div><b>Voile :</b> {{ decodedData.data.info.gliderType || '-' }}</div>
                        <div><b>Alti GPS :</b> {{ anaResult.altStartGps || '-' }} m</div>
                        <div><b>Alti GPS :</b> {{ anaResult.altEndGps || '-' }} m</div>
                        <div><b>Longueur :</b> {{ anaResult.length || '-' }} km</div>
                        <div><b>Alti Mini GPS :</b> {{ anaResult.altMinGps || '-' }} m</div>
                        <div><b>Vario mini :</b> {{ anaResult.varioMin || '-' }} m/s</div>
                        <div><b>Vitesse max :</b> {{ anaResult.speedMax || '-' }} km/h</div>
                      </div>
                    </div>
                    <div style="margin-top:18px;display:flex;gap:8px;align-items:center;">
                      <div style="background:#ffd966;padding:6px 18px;border-radius:8px;font-weight:bold;">{{ anaResult.thermicPercent || '-' }}%<br><span style="font-size:0.9em;">Thermique</span></div>
                      <div style="background:#b4c6e7;padding:6px 18px;border-radius:8px;font-weight:bold;">{{ anaResult.transitionPercent || '-' }}%<br><span style="font-size:0.9em;">Transition</span></div>
                      <div style="background:#d9ead3;padding:6px 18px;border-radius:8px;font-weight:bold;">{{ anaResult.otherPercent || '-' }}%<br><span style="font-size:0.9em;">Divers</span></div>
                    </div>
                  </div>
                  <div v-else-if="!anaResult">
                    <v-progress-circular indeterminate color="primary" />
                    <p style="margin-top:12px;">Chargement des données…</p>
                  </div>
                  <div v-else>
                    <p>Aucune donnée disponible.</p>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn text @click="infosDialog = false">Fermer</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
        <v-btn class="toolbar-btn" color="default">Chronologie</v-btn>
        <v-btn class="toolbar-btn" color="default">Espaces aériens</v-btn>
        <v-btn class="toolbar-btn" color="default">Score</v-btn>
        <v-btn class="toolbar-btn" color="default">Mesurer</v-btn>
        <v-btn class="toolbar-btn" color="default">Couper</v-btn>
      </template>
    </div>
    <div v-if="decodedData && decodedData.success" class="toolbar-separator"></div>
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
    <div v-if="decodedData && decodedData.success" class="map-wrapper">
      <div id="map" class="map-container"></div>
      <div id="graph-info" class="graph-info"></div>
      <div class="altitude-graph">
        <div id="chart" class="chart-container"></div>
      </div>
    </div>
    <div v-else-if="decodedData">
      <p style="color: red;">Erreur : {{ decodedData.message }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { igcDecoding } from '@/utils/igc/igc-decoder.js';
import { IgcAnalyze } from '@/utils/igc/igc-analyzer.js';
import { createAltitudeChart } from '@/utils/igc/igc-graph.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

const dialog = ref(false)
const infosDialog = ref(false)
const selectedFile = ref(null)
const fileContent = ref('')
const decodedData = ref(null)
const anaResult = ref(null)
let map = null
let chart = null

function onFileChange(event) {
  selectedFile.value = event.target.files[0]
}

watch(() => decodedData.value, (val) => {
  if (val && val.success && val.data.GeoJSON) {
    if (map) {
      map.remove()
      map = null
    }
    if (chart) {
      chart.destroy()
      chart = null
    }
    setTimeout(() => {
      map = L.map('map', {
        center: [val.data.GeoJSON.features[0].geometry.coordinates[0][1], val.data.GeoJSON.features[0].geometry.coordinates[0][0]],
        zoom: 13,
        maxZoom: 18,
        minZoom: 2
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)
      const geoLayer = L.geoJSON(val.data.GeoJSON).addTo(map)
      const bounds = geoLayer.getBounds()
      if (bounds.isValid()) map.fitBounds(bounds)
      // Création du graphe d'altitude avec event mousemove
      chart = createAltitudeChart(val.data.fixes, 'chart', {
        graphInfoDiv: document.getElementById('graph-info'),
        _feature: val.data.GeoJSON.features[0],
        fullmap: map,
        hoverMarker: null
      })
    }, 100)
  }
})

onMounted(() => {
  if (decodedData.value && decodedData.value.success && decodedData.value.data.GeoJSON) {
    map = L.map('map', {
      center: [decodedData.value.data.GeoJSON.features[0].geometry.coordinates[0][1], decodedData.value.data.GeoJSON.features[0].geometry.coordinates[0][0]],
      zoom: 13
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)
    const geoLayer = L.geoJSON(decodedData.value.data.GeoJSON).addTo(map)
    const bounds = geoLayer.getBounds()
    if (bounds.isValid()) map.fitBounds(bounds)
  }
})

async function validateFile() {
  if (selectedFile.value) {
    const reader = new FileReader()
    reader.onload = async function(e) {
      fileContent.value = e.target.result
      decodedData.value = await igcDecoding(fileContent.value)
 //     console.log('Décodé:', decodedData.value)
      if (decodedData.value.success && decodedData.value.data.fixes && decodedData.value.data.fixes.length > 0) {
        console.log('decodedData:', decodedData.value);
        anaResult.value = await IgcAnalyze(decodedData.value.data.fixes)
        console.log('Analyse:', anaResult.value)
      } else {
        anaResult.value = null
      }
    }
    reader.readAsText(selectedFile.value)
    console.log(selectedFile.value.name)
  }
  dialog.value = false
}
</script>

<style scoped>
section {
  padding: 0.5rem;
  text-align: left;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.toolbar-btn {
  font-size: 0.85rem;
  min-width: 80px;
  padding: 0 10px;
  background: #f5f5f5;
  color: #333;
  border-radius: 4px;
  box-shadow: none;
}
.toolbar-separator {
  width: 100%;
  height: 2px;
  background: #e0e0e0;
  margin-bottom: 8px;
}
h1 {
  color: #8e76e4;
  margin-bottom: 1rem;
}
.map-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.map-container {
  width: 100%;
  flex: 1;
  min-height: 0;
  z-index: 1;
}
.altitude-graph {
  width: 100%;
  height: 150px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
}
.chart-container {
  width: 100%;
  height: 100%;
  padding: 5px;
}
.graph-info {
  width: 100%;
  min-height: 28px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
  font-size: 1.05em;
  padding: 6px 12px;
  color: #333;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
</style>