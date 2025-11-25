<template>
  <v-dialog :model-value="modelValue" @update:model-value="emitModelValue" max-width="500">
    <v-card>
      <v-card-title>Calcul du score</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedScore"
          :items="scores"
          label="Choisir une règle de scoring"
          outlined
        />
        <v-btn color="primary" text @click="onValidate" :disabled="loading" style="margin-top:16px;">Valider</v-btn>
        <div v-if="loading" style="margin-top:16px;">
          <v-progress-circular indeterminate color="primary" /> Calcul en cours…
        </div>
        <div v-if="scoreResult" style="margin-top:16px;">
          <b>Résultat :</b>
          <pre>{{ scoreResult }}</pre>
        </div>
        <div v-if="error" style="margin-top:16px;color:red;">
          <b>Erreur :</b> {{ error }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="emitModelValue(false)">Fermer</v-btn>
        <v-btn color="primary" text @click="onValidate">Valider</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  scores: Array,
  fixes: Array,
  date: String,
  scoringFn: Function
})
const emit = defineEmits(['update:modelValue'])
const selectedScore = ref(props.scores[0] || '')
const scoreResult = ref(null)
const loading = ref(false)
const error = ref('')
function emitModelValue(val) {
  emit('update:modelValue', val)
}
async function onValidate() {
  scoreResult.value = null
  error.value = ''
  loading.value = true
  try {
    const result = await props.scoringFn({
      date: props.date,
      fixes: props.fixes,
      league: selectedScore.value
    })
    scoreResult.value = result
  } catch (e) {
    error.value = e.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}
</script>
