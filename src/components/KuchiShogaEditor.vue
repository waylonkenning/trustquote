<template>
  <div class="kuchi-shoga-editor">
    <div class="editor-header">
      <h2>Kuchi Shōga Pattern Editor</h2>
      <div class="editor-controls">
        <button 
          data-testid="add-part"
          @click="showAddPart = true"
          class="btn-primary"
        >
          Add Part
        </button>
        <button 
          data-testid="pronunciation-guide"
          @click="showGuide = !showGuide"
          class="btn-secondary"
        >
          Pronunciation Guide
        </button>
      </div>
    </div>

    <!-- Add Part Dialog -->
    <div v-if="showAddPart" class="modal-overlay" @click="showAddPart = false">
      <div class="modal" @click.stop>
        <h3>Add Drum Part</h3>
        <div class="form-group">
          <label for="drum-type">Drum Type</label>
          <select 
            id="drum-type"
            data-testid="drum-type"
            v-model="newPartDrumType"
            class="input"
          >
            <option value="chu-daiko">Chu-daiko</option>
            <option value="shime-daiko">Shime-daiko</option>
            <option value="o-daiko">O-daiko</option>
            <option value="atarigane">Atarigane</option>
          </select>
        </div>
        
        <div v-if="composition.isEnsemble" class="form-group">
          <label for="drum-role">Role</label>
          <select 
            id="drum-role"
            data-testid="drum-role"
            v-model="newPartRole"
            class="input"
          >
            <option value="lead">Lead</option>
            <option value="accompaniment">Accompaniment</option>
            <option value="foundation">Foundation</option>
            <option value="accent">Accent</option>
          </select>
          <small class="role-description">{{ getRoleDescription(newPartRole) }}</small>
        </div>
        
        <div class="modal-actions">
          <button 
            data-testid="confirm-add-part"
            @click="addPart"
            class="btn-primary"
          >
            Add Part
          </button>
          <button @click="showAddPart = false" class="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Pronunciation Guide -->
    <PronunciationGuide v-if="showGuide" @close="showGuide = false" />

    <!-- Ensemble View Controls (if ensemble mode) -->
    <div v-if="composition.isEnsemble" class="ensemble-controls" data-testid="ensemble-controls">
      <div class="ensemble-tabs">
        <button 
          data-testid="ensemble-overview"
          :class="{ active: ensembleView === 'overview' }"
          @click="ensembleView = 'overview'"
          class="tab-button"
        >
          Overview
        </button>
        <button 
          data-testid="hierarchy-view"
          :class="{ active: ensembleView === 'hierarchy' }"
          @click="ensembleView = 'hierarchy'"
          class="tab-button"
        >
          Hierarchy
        </button>
        <button 
          data-testid="ensemble-mixer"
          :class="{ active: ensembleView === 'mixer' }"
          @click="ensembleView = 'mixer'"
          class="tab-button"
        >
          Mixer
        </button>
      </div>
      
      <div class="ensemble-actions">
        <button 
          data-testid="ensemble-play"
          @click="toggleEnsemblePlayback"
          class="btn-play"
          :class="{ playing: isEnsemblePlaying }"
        >
          {{ isEnsemblePlaying ? 'Stop' : 'Play' }}
        </button>
        <button 
          data-testid="ensemble-stop"
          @click="stopEnsemblePlayback"
          class="btn-stop"
        >
          Stop
        </button>
        <input 
          data-testid="ensemble-tempo"
          type="range"
          min="60"
          max="200"
          v-model="composition.tempo"
          class="tempo-slider"
        />
        <span class="tempo-display">{{ composition.tempo }} BPM</span>
      </div>
    </div>

    <!-- Ensemble Overview -->
    <div v-if="composition.isEnsemble && ensembleView === 'overview'" class="ensemble-grid" data-testid="ensemble-grid">
      <div class="ensemble-stats" data-testid="ensemble-stats">
        <div data-testid="total-parts">Parts: {{ composition.parts.length }}</div>
        <div data-testid="ensemble-complexity">Complexity: {{ getEnsembleComplexity() }}</div>
      </div>
      
      <div class="overview-grid">
        <div 
          v-for="part in composition.parts"
          :key="part.id"
          :data-testid="`overview-${part.drumType}`"
          class="overview-part"
        >
          <div data-testid="drum-icon" class="drum-icon">{{ getDrumIcon(part.drumType) }}</div>
          <h4>{{ part.drumType }}</h4>
          <div v-if="part.role" data-testid="role-indicator" class="role-badge">{{ capitalizeRole(part.role) }}</div>
          <div data-testid="pattern-preview" class="pattern-preview">{{ part.pattern || 'Empty' }}</div>
        </div>
      </div>
    </div>

    <!-- Ensemble Hierarchy View -->
    <div v-if="composition.isEnsemble && ensembleView === 'hierarchy'" class="ensemble-hierarchy" data-testid="ensemble-hierarchy">
      <div data-testid="hierarchy-order" class="hierarchy-list">
        <div 
          v-for="part in sortedByHierarchy"
          :key="part.id"
          class="hierarchy-item"
        >
          <div class="hierarchy-role">
            <span data-testid="drum-role">{{ capitalizeRole(part.role || 'unassigned') }}</span>
            <small :data-testid="`role-description-${part.role}`" class="role-description">
              {{ getRoleDescription(part.role) }}
            </small>
          </div>
          <div class="hierarchy-drum">{{ part.drumType }}</div>
        </div>
      </div>
    </div>

    <!-- Ensemble Mixer -->
    <div v-if="composition.isEnsemble && ensembleView === 'mixer'" class="mixer-panel" data-testid="mixer-panel">
      <div class="mixer-controls">
        <button data-testid="auto-balance" @click="autoBalance" class="btn-secondary">Auto Balance</button>
        <div data-testid="balance-indicator" class="balance-indicator">
          Balance: {{ getBalanceStatus() }}
        </div>
      </div>
      
      <div class="volume-controls">
        <div 
          v-for="part in composition.parts"
          :key="part.id"
          class="volume-control"
        >
          <label>{{ part.drumType }}</label>
          <input 
            :data-testid="`volume-${part.drumType}`"
            type="range"
            min="0"
            max="100"
            v-model="part.volume"
            class="volume-slider"
          />
          <span>{{ part.volume }}%</span>
        </div>
      </div>
    </div>

    <!-- Pattern Editor for each part -->
    <div 
      v-for="part in composition.parts" 
      :key="part.id" 
      :data-testid="`part-${part.drumType}`"
      class="part-editor"
      :class="{ 
        muted: part.isMuted, 
        solo: part.isSolo,
        'ensemble-mode': composition.isEnsemble 
      }"
    >
      <div class="part-header">
        <div class="part-title">
          <h3>{{ part.drumType }}</h3>
          <div v-if="part.role" data-testid="role-indicator" class="role-indicator">{{ capitalizeRole(part.role) }}</div>
        </div>
        
        <div class="part-controls">
          <div v-if="composition.isEnsemble" class="ensemble-part-controls">
            <button 
              :data-testid="`mute-button`"
              @click="toggleMute(part)"
              class="control-btn mute-btn"
              :class="{ active: part.isMuted }"
            >
              M
            </button>
            <button 
              :data-testid="`solo-button`"
              @click="toggleSolo(part)"
              class="control-btn solo-btn"
              :class="{ active: part.isSolo }"
            >
              S
            </button>
            <div v-if="isEnsemblePlaying" data-testid="playing-indicator" class="playing-indicator">♪</div>
          </div>
          
          <label class="checkbox-label">
            <input 
              data-testid="show-sticking"
              type="checkbox" 
              v-model="showSticking"
            />
            Show Hand Sticking
          </label>
        </div>
      </div>

      <PatternInput 
        :part="part"
        :show-sticking="showSticking"
        @pattern-updated="(pattern) => $emit('pattern-updated', part.id, pattern)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PatternInput from './PatternInput.vue'
import PronunciationGuide from './PronunciationGuide.vue'
import type { Composition, DrumType, DrumRole, CompositionPart } from '@/types/composition'

interface Props {
  composition: Composition
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'pattern-updated': [partId: string, pattern: string]
  'part-added': [drumType: string, role?: DrumRole]
}>()

const showAddPart = ref(false)
const showGuide = ref(false)
const newPartDrumType = ref<DrumType>('chu-daiko')
const newPartRole = ref<DrumRole>('lead')
const showSticking = ref(false)
const ensembleView = ref<'overview' | 'hierarchy' | 'mixer'>('overview')
const isEnsemblePlaying = ref(false)

const addPart = () => {
  if (props.composition.isEnsemble) {
    emit('part-added', newPartDrumType.value, newPartRole.value)
  } else {
    emit('part-added', newPartDrumType.value)
  }
  showAddPart.value = false
}

const getRoleDescription = (role?: DrumRole) => {
  const descriptions = {
    lead: 'leads melodic patterns and calls',
    accompaniment: 'supports with counter-rhythms and fills',
    foundation: 'provides rhythmic foundation and stability',
    accent: 'adds metallic accents and emphasis'
  }
  return role ? descriptions[role] : 'No role assigned'
}

const capitalizeRole = (role: DrumRole | string) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const getDrumIcon = (drumType: DrumType) => {
  const icons = {
    'chu-daiko': '🥁',
    'shime-daiko': '🪘',
    'o-daiko': '🥁',
    'atarigane': '🔔'
  }
  return icons[drumType]
}

const getEnsembleComplexity = () => {
  const partCount = props.composition.parts.length
  if (partCount <= 2) return 'simple'
  if (partCount <= 4) return 'moderate'
  return 'complex'
}

const getBalanceStatus = () => {
  // Simple balance check based on volume ranges
  const volumes = props.composition.parts.map(p => p.volume)
  const maxVolume = Math.max(...volumes)
  const minVolume = Math.min(...volumes)
  const range = maxVolume - minVolume
  
  return range <= 30 ? 'good' : 'needs-adjustment'
}

const sortedByHierarchy = computed(() => {
  const roleOrder = ['foundation', 'lead', 'accompaniment', 'accent']
  return [...props.composition.parts].sort((a, b) => {
    const aIndex = roleOrder.indexOf(a.role || 'accent')
    const bIndex = roleOrder.indexOf(b.role || 'accent')
    return aIndex - bIndex
  })
})

const toggleMute = (part: CompositionPart) => {
  part.isMuted = !part.isMuted
  part.isManuallyMuted = part.isMuted
  
  // If unmuting, clear solo on this part
  if (!part.isMuted) {
    part.isSolo = false
  }
}

const toggleSolo = (part: CompositionPart) => {
  const wasSolo = part.isSolo
  
  if (!wasSolo) {
    // Enable solo on this part
    // First clear all solo states
    props.composition.parts.forEach(p => {
      p.isSolo = false
    })
    
    // Set this part to solo and mute all others (but don't mark as manually muted)
    part.isSolo = true
    props.composition.parts.forEach(p => {
      if (p.id !== part.id) {
        p.isMuted = true
        // Don't change isManuallyMuted - preserve the manual state
      }
    })
  } else {
    // Clear solo state
    part.isSolo = false
    
    // Unmute all parts that were only muted due to solo (not manually muted)
    props.composition.parts.forEach(p => {
      if (p.id !== part.id && !p.isManuallyMuted) {
        p.isMuted = false
      }
    })
  }
}

const toggleEnsemblePlayback = () => {
  isEnsemblePlaying.value = !isEnsemblePlaying.value
  if (!isEnsemblePlaying.value) {
    stopEnsemblePlayback()
  }
}

const stopEnsemblePlayback = () => {
  isEnsemblePlaying.value = false
}

const autoBalance = () => {
  // Auto-balance volumes based on drum characteristics
  props.composition.parts.forEach(part => {
    switch (part.drumType) {
      case 'o-daiko':
        part.volume = 90
        break
      case 'chu-daiko':
        part.volume = 75
        break
      case 'shime-daiko':
        part.volume = 65
        break
      case 'atarigane':
        part.volume = 55
        break
    }
  })
}
</script>

<style scoped>
.kuchi-shoga-editor {
  background: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #404040;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #2a2a2a;
  border-bottom: 1px solid #404040;
}

.editor-header h2 {
  color: #ff6b6b;
  font-size: 1.25rem;
}

.editor-controls {
  display: flex;
  gap: 0.5rem;
}

.part-editor {
  border-bottom: 1px solid #404040;
}

.part-editor:last-child {
  border-bottom: none;
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #252525;
}

.part-header h3 {
  color: #ffffff;
  text-transform: capitalize;
}

.part-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  accent-color: #ff6b6b;
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
  min-width: 300px;
}

.modal h3 {
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

.role-description {
  display: block;
  font-size: 0.8rem;
  color: #cccccc;
  margin-top: 0.25rem;
}

/* Ensemble Controls */
.ensemble-controls {
  background: #252525;
  border-bottom: 1px solid #404040;
  padding: 1rem;
}

.ensemble-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tab-button {
  background: transparent;
  color: #cccccc;
  border: 1px solid #404040;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #404040;
  color: #ffffff;
}

.tab-button.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.ensemble-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-play {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-play.playing {
  background: #ff9800;
}

.btn-stop {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.tempo-slider {
  width: 100px;
  accent-color: #ff6b6b;
}

.tempo-display {
  color: #cccccc;
  font-size: 0.9rem;
}

/* Ensemble Overview */
.ensemble-grid {
  padding: 1rem;
  background: #1a1a1a;
}

.ensemble-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #252525;
  border-radius: 4px;
}

.ensemble-stats > div {
  color: #cccccc;
  font-size: 0.9rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.overview-part {
  background: #252525;
  border: 1px solid #404040;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.drum-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.overview-part h4 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.role-badge {
  background: #ff6b6b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.pattern-preview {
  color: #cccccc;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  background: #1a1a1a;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

/* Ensemble Hierarchy */
.ensemble-hierarchy {
  padding: 1rem;
  background: #1a1a1a;
}

.hierarchy-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hierarchy-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #252525;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;
}

.hierarchy-role {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hierarchy-role span {
  color: #ffffff;
  font-weight: 500;
  text-transform: capitalize;
}

.hierarchy-drum {
  color: #cccccc;
  text-transform: capitalize;
}

/* Mixer Panel */
.mixer-panel {
  padding: 1rem;
  background: #1a1a1a;
}

.mixer-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #252525;
  border-radius: 4px;
}

.balance-indicator {
  color: #cccccc;
  font-size: 0.9rem;
}

.volume-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #252525;
  border-radius: 4px;
}

.volume-control label {
  min-width: 120px;
  color: #ffffff;
  text-transform: capitalize;
}

.volume-slider {
  flex: 1;
  accent-color: #ff6b6b;
}

.volume-control span {
  min-width: 40px;
  color: #cccccc;
  font-size: 0.9rem;
}

/* Part Editor Enhancements */
.part-editor.ensemble-mode {
  border-left: 3px solid transparent;
}

.part-editor.muted {
  opacity: 0.5;
  border-left-color: #f44336;
}

.part-editor.solo {
  border-left-color: #4caf50;
}

.part-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.role-indicator {
  background: #ff6b6b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.ensemble-part-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #404040;
  background: transparent;
  color: #cccccc;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #404040;
  color: #ffffff;
}

.control-btn.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.mute-btn.active {
  background: #f44336;
  border-color: #f44336;
}

.solo-btn.active {
  background: #4caf50;
  border-color: #4caf50;
}

.playing-indicator {
  color: #4caf50;
  font-size: 1.2rem;
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
</style>