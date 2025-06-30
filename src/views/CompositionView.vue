<template>
  <div class="composition-view">
    <header class="composition-header">
      <h1>Taiko Composer</h1>
      <div class="composition-actions">
        <button 
          data-testid="create-composition"
          @click="showCreateDialog = true"
          class="btn-primary"
        >
          Create Composition
        </button>
        <button 
          data-testid="settings-menu"
          @click="showSettings = true"
          class="btn-secondary"
        >
          Settings
        </button>
      </div>
    </header>

    <main class="composition-main" v-if="currentComposition">
      <div v-if="currentComposition.isEnsemble" data-testid="ensemble-view" class="ensemble-view">
        <KuchiShogaEditor 
          :composition="currentComposition"
          @pattern-updated="updatePattern"
          @part-added="addPart"
        />
      </div>
      <div v-else class="single-composition-view">
        <KuchiShogaEditor 
          :composition="currentComposition"
          @pattern-updated="updatePattern"
          @part-added="addPart"
        />
      </div>
    </main>

    <!-- Create Composition Dialog -->
    <div v-if="showCreateDialog" class="modal-overlay" @click="showCreateDialog = false">
      <div class="modal" @click.stop>
        <h2>Create New Composition</h2>
        <div class="form-group">
          <label for="composition-title">Title</label>
          <input 
            id="composition-title"
            data-testid="composition-title"
            v-model="newCompositionTitle"
            placeholder="Composition Title"
            class="input"
          />
        </div>
        
        <div class="form-group">
          <label for="tempo-input">Tempo (BPM)</label>
          <input 
            id="tempo-input"
            data-testid="tempo-input"
            v-model.number="newCompositionTempo"
            type="number"
            min="60"
            max="200"
            placeholder="120"
            class="input"
          />
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              data-testid="enable-ensemble-mode"
              type="checkbox"
              v-model="enableEnsembleMode"
              class="checkbox"
            />
            Enable Ensemble Mode
            <span class="checkbox-description">
              Advanced coordination for multiple drum parts with role management
            </span>
          </label>
        </div>
        
        <div class="modal-actions">
          <button 
            data-testid="confirm-create"
            @click="createComposition"
            class="btn-primary"
          >
            Create
          </button>
          <button @click="closeCreateDialog" class="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Dialog -->
    <NotationSettings 
      v-if="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KuchiShogaEditor from '@/components/KuchiShogaEditor.vue'
import NotationSettings from '@/components/NotationSettings.vue'
import type { Composition } from '@/types/composition'

const showCreateDialog = ref(false)
const showSettings = ref(false)
const newCompositionTitle = ref('')
const newCompositionTempo = ref(120)
const enableEnsembleMode = ref(false)
const currentComposition = ref<Composition | null>(null)

const createComposition = () => {
  currentComposition.value = {
    id: Date.now().toString(),
    title: newCompositionTitle.value || 'Untitled Composition',
    parts: [],
    tempo: newCompositionTempo.value || 120,
    createdAt: new Date(),
    isEnsemble: enableEnsembleMode.value
  }
  closeCreateDialog()
}

const closeCreateDialog = () => {
  newCompositionTitle.value = ''
  newCompositionTempo.value = 120
  enableEnsembleMode.value = false
  showCreateDialog.value = false
}

const updatePattern = (partId: string, pattern: string) => {
  if (currentComposition.value) {
    const part = currentComposition.value.parts.find(p => p.id === partId)
    if (part) {
      part.pattern = pattern
    }
  }
}

const addPart = (drumType: string, role?: string) => {
  if (currentComposition.value) {
    const newPart = {
      id: Date.now().toString(),
      drumType: drumType as any,
      pattern: '',
      volume: getDefaultVolume(drumType as any),
      role: role as any,
      isMuted: false,
      isSolo: false,
      isManuallyMuted: false
    }
    currentComposition.value.parts.push(newPart)
  }
}

const getDefaultVolume = (drumType: string) => {
  switch (drumType) {
    case 'o-daiko': return 90
    case 'chu-daiko': return 75
    case 'shime-daiko': return 65
    case 'atarigane': return 55
    default: return 80
  }
}
</script>

<style scoped>
.composition-view {
  min-height: 100vh;
}

.composition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #2a2a2a;
  border-bottom: 1px solid #404040;
}

.composition-header h1 {
  color: #ff6b6b;
  font-size: 1.5rem;
  font-weight: bold;
}

.composition-actions {
  display: flex;
  gap: 1rem;
}

.composition-main {
  padding: 2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #404040;
  min-width: 400px;
}

.modal h2 {
  margin-bottom: 1rem;
  color: #ffffff;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #ff5252;
}

.btn-secondary {
  background: transparent;
  color: #ffffff;
  border: 1px solid #404040;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #404040;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #1a1a1a;
  color: #ffffff;
}

.input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: 500;
}

.checkbox-label {
  display: flex !important;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  margin: 0 !important;
  accent-color: #ff6b6b;
}

.checkbox-description {
  display: block;
  font-size: 0.875rem;
  color: #cccccc;
  font-weight: normal;
  margin-top: 0.25rem;
}
</style>