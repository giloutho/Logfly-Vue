<template>
  <v-dialog v-model="dialogVisible" max-width="600">
    <v-card>
      <v-card-title class="airspace-title">
        <span class="airspace-icon">👁️</span>
        <span>Display airspaces <a href="https://www.openaip.net/" target="_blank">[openAIP]</a></span>
        <span class="airspace-icon" style="float:right">👁️</span>
      </v-card-title>
      <v-card-text>
        <div class="airspace-section">
          <div class="airspace-label">Classes</div>
            <div class="airspace-row">
              <v-checkbox v-for="cls in classes" :key="cls.value" v-model="selectedClasses" :label="cls.label" :value="cls.value" hide-details density="compact" class="airspace-inline-checkbox" :ripple="false" />
            </div>
        </div>
        <div class="airspace-section">
          <div class="airspace-label">Types</div>
            <div class="airspace-row">
              <v-checkbox v-for="typ in types" :key="typ.value" v-model="selectedTypes" :label="typ.label" :value="typ.value" hide-details density="compact" class="airspace-inline-checkbox" :ripple="false" />
            </div>
        </div>
        <div class="airspace-section airspace-radio-section">
          <div class="airspace-label">Limite plancher</div>
            <div class="airspace-row">
              <v-radio-group v-model="selectedFloor" row class="airspace-inline-radio-group">
                <v-radio v-for="floor in floors" :key="floor" :label="floor+'m'" :value="floor" class="airspace-inline-radio" :ripple="false" />
              </v-radio-group>
            </div>
        </div>
        <div class="airspace-section airspace-radio-section">
          <div class="airspace-label">Radius</div>
            <div class="airspace-row">
              <v-radio-group v-model="selectedRadius" row class="airspace-inline-radio-group">
                <v-radio v-for="radius in radii" :key="radius" :label="radius+'km'" :value="radius" class="airspace-inline-radio" :ripple="false" />
              </v-radio-group>
            </div>
        </div>
        <div class="airspace-section airspace-display-btn">
          <v-btn color="primary" style="margin: 0 auto; display: block; min-width: 120px;" @click="onDisplayOpenAipClicked">Display</v-btn>
        </div>
        <div class="airspace-section airspace-check airspace-title" @click="onCheckTrack" style="cursor: pointer;">
          <span class="airspace-icon">🫣</span>
          <span>Check the track</span>
          <span class="airspace-icon" style="float:right">🫣</span>
        </div>
        <div class="airspace-section airspace-links">
          <a href="https://www.openaip.net/" target="_blank">OpenAip source</a>
          <a href="https://bazile.org/" target="_blank">Bazile source (fr)</a>
          <a href="#">Local file source</a>
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

import { ref, defineProps, defineEmits, watch } from 'vue'
const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(props.modelValue)
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const classes = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
  { label: 'E', value: 'E' },
  { label: 'F', value: 'F' },
  { label: 'G', value: 'G' }
]
const types = [
  { label: 'Prohibited', value: 'Prohibited' },
  { label: 'Restricted', value: 'Restricted' },
  { label: 'Danger', value: 'Danger' },
  { label: 'CTR', value: 'CTR' },
  { label: 'TMA', value: 'TMA' },
  { label: 'RMZ', value: 'RMZ' },
  { label: 'TMZ', value: 'TMZ' },
  { label: 'Gliding', value: 'Gliding' },
  { label: 'Autre', value: 'Autre' }
]
const floors = [500, 1000, 2000, 3000, 4000, 5000]
const radii = [50, 100, 150, 200, 300, 400, 500]

const selectedClasses = ref(['A', 'B', 'C', 'D'])
const selectedTypes = ref(['Prohibited', 'Restricted', 'Danger'])
const selectedFloor = ref(500)
const selectedRadius = ref(50)

function onCheckTrack() {
  // Action à définir
}

function onDisplayOpenAipClicked() {
    // Convertir selectedClasses.value en tableau d'index
    const classIndexes = Object.keys(selectedClasses.value)
    // 'SUA' Special Use Airspace with id 8 is always added
    classIndexes.push('8')  
    const typesIndexes = Object.keys(selectedTypes.value)
    const floor = selectedFloor.value
    const radius = selectedRadius.value * 1000
    console.log('Display OpenAip clicked', {
        classIndexes,
        typesIndexes,
        floor,
        radius
    })
  // Action à définir
    // const bloc1Checkboxes = Array.from(document.querySelectorAll('#cbA,#cbB, #cbC, #cbD, #cbE, #cbF, #cbG'))
    //     .filter(cb => cb.checked)
    //     .map(cb => cb.value)
    // // 'SUA' Special Use Airspace with id 8 is always added
    // bloc1Checkboxes.push('8')  
    // console.log('Selected classes (with SUA):', bloc1Checkboxes)
}
</script>

<style scoped>
.airspace-title {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: bold;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}
.airspace-icon {
  font-size: 1.3em;
}
.airspace-section {
  margin-bottom: 12px;
}
.airspace-radio-section {
  margin-bottom: 4px;
}
.airspace-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.airspace-inline-checkbox {
  margin-right: 0;
  margin-bottom: 0;
  min-width: 60px;
}
.airspace-inline-radio-group {
  width: 100%;
  margin: 0 !important;
}
.airspace-inline-radio-group :deep(.v-selection-control-group) {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  gap: 8px !important;
}
.airspace-inline-radio {
  flex: 0 0 auto !important;
  margin: 0 !important;
  padding: 0 !important;
}
.airspace-inline-radio :deep(.v-selection-control) {
  min-height: 32px !important;
  margin: 0 !important;
  padding: 0 !important;
}
.airspace-inline-radio :deep(.v-label) {
  white-space: nowrap !important;
}
.airspace-label {
  font-weight: 500;
  margin-bottom: 4px;
  color: #1976d2;
}
.airspace-check {
  margin-top: 18px;
}
.airspace-links {
  display: flex;
  gap: 18px;
  margin-top: 10px;
  font-size: 0.98em;
}
.airspace-display-btn {
  margin: 16px 0;
  text-align: center;
}
</style>
