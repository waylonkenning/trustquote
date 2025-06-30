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
        <select 
          data-testid="drum-type"
          v-model="newPartDrumType"
          class="input"
        >
          <option value="chu-daiko">Chu-daiko</option>
          <option value="shime-daiko">Shime-daiko</option>
          <option value="o-daiko">O-daiko</option>
          <option value="atarigane">Atarigane</option>
        </select>
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

    <!-- Pattern Editor for each part -->
    <div 
      v-for="part in composition.parts" 
      :key="part.id" 
      :data-testid="`part-${part.drumType}`"
      class="part-editor"
    >
      <div class="part-header">
        <h3>{{ part.drumType }}</h3>
        <div class="part-controls">
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
import { ref } from 'vue'
import PatternInput from './PatternInput.vue'
import PronunciationGuide from './PronunciationGuide.vue'
import type { Composition, DrumType } from '@/types/composition'

interface Props {
  composition: Composition
}

defineProps<Props>()
const emit = defineEmits<{
  'pattern-updated': [partId: string, pattern: string]
  'part-added': [drumType: string]
}>()

const showAddPart = ref(false)
const showGuide = ref(false)
const showSticking = ref(false)
const newPartDrumType = ref<DrumType>('chu-daiko')

const addPart = () => {
  emit('part-added', newPartDrumType.value)
  showAddPart.value = false
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
</style>