<template>
  <v-dialog :model-value="modelValue" @update:model-value="emitModelValue" max-width="600">
    <v-card>
      <v-card-title>Informations sur la trace</v-card-title>
      <v-card-text>
        <div v-if="anaResult && decodedData && decodedData.success">
          <pre style="background:#f8f8f8;border:1px solid #eee;padding:8px 12px;margin-bottom:12px;max-height:180px;overflow:auto;">{{ anaResult }}</pre>
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
              <div><b>Voile :</b> {{ anaResult.glider || '-' }}</div>
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
        <v-btn text @click="$emit('update:modelValue', false)">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  anaResult: Object,
  decodedData: Object
})
const emit = defineEmits(['update:modelValue'])
function emitModelValue(val) {
  emit('update:modelValue', val)
}
</script>
