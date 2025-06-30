<template>
  <div class="pattern-input">
    <div class="pattern-editor" data-testid="pattern-editor">
      <div class="editor-tabs">
        <button 
          data-testid="view-text"
          :class="{ active: viewMode === 'text' }"
          @click="viewMode = 'text'"
          class="tab-button"
        >
          Text Input
        </button>
        <button 
          data-testid="view-visual"
          :class="{ active: viewMode === 'visual' }"
          @click="viewMode = 'visual'"
          class="tab-button"
        >
          Linear Grid
        </button>
        <button 
          data-testid="view-circular"
          :class="{ active: viewMode === 'circular' }"
          @click="viewMode = 'circular'"
          class="tab-button"
        >
          Circular View
        </button>
      </div>

      <!-- Text Input Mode -->
      <div v-if="viewMode === 'text'" class="text-input-container">
        <div class="input-wrapper">
          <textarea
            data-testid="text-input"
            v-model="patternText"
            @input="handleTextInput"
            @keydown="handleKeydown"
            placeholder="Enter kuchi shōga pattern (e.g., don ka doko tsu)"
            class="pattern-textarea"
            rows="3"
          ></textarea>
          
          <!-- Autocomplete suggestions -->
          <div v-if="showAutocomplete" data-testid="autocomplete" class="autocomplete">
            <div 
              v-for="suggestion in suggestions"
              :key="suggestion.name"
              :data-testid="`suggestion-${suggestion.name}`"
              @click="applySuggestion(suggestion)"
              class="suggestion-item"
            >
              <strong>{{ suggestion.name }}</strong>
              <span>{{ suggestion.pattern }}</span>
            </div>
          </div>
        </div>

        <!-- Validation errors -->
        <div v-if="validationError" data-testid="validation-error" class="error">
          {{ validationError }}
        </div>

        <!-- Pattern display with syllables -->
        <div class="syllable-display">
          <div 
            v-for="(syllable, index) in parsedSyllables"
            :key="index"
            :data-testid="`syllable-${syllable.syllable}`"
            class="syllable-item"
          >
            <span class="syllable-text">{{ syllable.syllable }}</span>
            <span v-if="showSticking && syllable.hand" 
                  :data-testid="`sticking-${syllable.hand}`"
                  class="sticking-indicator">
              {{ syllable.hand }}
            </span>
          </div>
        </div>
      </div>

      <!-- Visual Notation Mode -->
      <div v-if="viewMode === 'visual'" class="visual-notation" data-testid="visual-notation">
        <div class="beat-grid">
          <div 
            v-for="(beat, index) in visualBeats"
            :key="index"
            :data-testid="`beat-${index + 1}`"
            :data-syllable="beat.syllable"
            class="beat-cell"
            :class="{ active: beat.syllable }"
            @click="toggleBeat(index)"
          >
            <div class="beat-number">{{ index + 1 }}</div>
            <div v-if="beat.syllable" class="beat-syllable">
              {{ beat.syllable }}
            </div>
          </div>
        </div>
      </div>

      <!-- Circular Visualization Mode -->
      <div v-if="viewMode === 'circular'" class="circular-view-container">
        <CircularRhythmVisualizer 
          :composition="{ id: 'temp', title: 'temp', parts: [part], tempo: tempo, createdAt: new Date() }"
          :is-playing="isPlaying"
          :current-beat="0"
          :tempo="tempo"
          @beat-updated="handleCircularBeatUpdate"
        />
      </div>

      <!-- Playback controls -->
      <div class="playback-controls">
        <button 
          data-testid="play-pattern"
          @click="togglePlayback"
          class="play-button"
          :class="{ playing: isPlaying }"
        >
          {{ isPlaying ? 'Stop' : 'Play' }}
        </button>
        <button 
          data-testid="stop-pattern"
          @click="stopPlayback"
          class="stop-button"
        >
          Stop
        </button>
        <label class="loop-control">
          <input 
            data-testid="loop-toggle"
            type="checkbox"
            v-model="loopEnabled"
            :class="{ active: loopEnabled }"
          />
          Loop
        </label>
        <div class="tempo-control">
          <label>Tempo:</label>
          <input 
            data-testid="tempo-slider"
            type="range"
            min="60"
            max="200"
            v-model="tempo"
            class="tempo-slider"
          />
          <span data-testid="tempo-display">{{ tempo }} BPM</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useKuchiShoga } from '@/composables/useKuchiShoga'
import CircularRhythmVisualizer from './CircularRhythmVisualizer.vue'
import type { CompositionPart } from '@/types/composition'

interface Props {
  part: CompositionPart
  showSticking: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'pattern-updated': [pattern: string]
}>()

const { 
  validatePattern, 
  parseSyllables, 
  getPatternSuggestions,
  playPattern,
  stopAudio
} = useKuchiShoga()

const viewMode = ref<'text' | 'visual' | 'circular'>('text')
const patternText = ref(props.part.pattern || '')
const validationError = ref('')
const showAutocomplete = ref(false)
const suggestions = ref<Array<{ name: string; pattern: string }>>([])
const isPlaying = ref(false)
const loopEnabled = ref(false)
const tempo = ref(120)

const parsedSyllables = computed(() => {
  const result = parseSyllables(patternText.value)
  return result.syllables
})

const visualBeats = computed(() => {
  const maxBeats = 16
  const beats = new Array(maxBeats).fill(null).map((_, i) => ({ syllable: '', beat: i + 1 }))
  
  // For visual mode, parse the pattern as positional beats
  if (patternText.value.trim()) {
    const parts = patternText.value.split(' ')
    for (let i = 0; i < Math.min(parts.length, maxBeats); i++) {
      if (parts[i] && parts[i].trim()) {
        beats[i].syllable = parts[i].trim()
      }
    }
  }
  
  return beats
})

const handleTextInput = async () => {
  const validation = validatePattern(patternText.value)
  validationError.value = validation.error || ''
  
  emit('pattern-updated', patternText.value)
  
  // Show autocomplete for pattern names
  const lastWord = patternText.value.split(' ').pop() || ''
  if (lastWord.length > 2 && !validation.error) {
    suggestions.value = getPatternSuggestions(lastWord)
    showAutocomplete.value = suggestions.value.length > 0
  } else {
    showAutocomplete.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showAutocomplete.value = false
  }
}

const applySuggestion = (suggestion: { name: string; pattern: string }) => {
  patternText.value = suggestion.pattern
  showAutocomplete.value = false
  handleTextInput()
}

const toggleBeat = (beatIndex: number) => {
  // For visual mode, we need to work with positional beats directly
  // Current approach: treat the pattern as a sequence of space-separated positions
  
  // Convert current pattern to a fixed-length array
  const maxBeats = 16
  const beatArray: string[] = new Array(maxBeats).fill('')
  
  // If we have existing text, try to parse it positionally
  if (patternText.value.trim()) {
    // Split by spaces but preserve empty positions
    const parts = patternText.value.split(' ')
    for (let i = 0; i < Math.min(parts.length, maxBeats); i++) {
      if (parts[i] && parts[i].trim()) {
        beatArray[i] = parts[i].trim()
      }
    }
  }
  
  // Toggle the clicked beat
  if (beatArray[beatIndex]) {
    beatArray[beatIndex] = '' // Remove syllable if present
  } else {
    beatArray[beatIndex] = 'don' // Add default syllable
  }
  
  // Convert back to text, preserving only the filled positions
  // but maintaining relative spacing
  const activeBeatPositions = []
  for (let i = 0; i < maxBeats; i++) {
    if (beatArray[i]) {
      activeBeatPositions.push({ pos: i, syllable: beatArray[i] })
    }
  }
  
  if (activeBeatPositions.length === 0) {
    patternText.value = ''
  } else {
    // Create a compact representation: just the syllables in order
    patternText.value = activeBeatPositions.map(beat => beat.syllable).join(' ')
  }
  
  handleTextInput()
}

const togglePlayback = async () => {
  if (isPlaying.value) {
    stopPlayback()
  } else {
    isPlaying.value = true
    await playPattern(patternText.value, tempo.value, loopEnabled.value)
    if (!loopEnabled.value) {
      isPlaying.value = false
    }
  }
}

const stopPlayback = () => {
  isPlaying.value = false
  stopAudio()
}

const handleCircularBeatUpdate = (partId: string, beatIndex: number, syllable: string) => {
  // Convert beat update back to text pattern
  const beats = new Array(16).fill('')
  const currentParsed = parseSyllables(patternText.value)
  
  // Preserve existing syllables
  currentParsed.syllables.forEach(s => {
    if (s.beat <= 16) {
      beats[s.beat - 1] = s.syllable
    }
  })
  
  // Update the specific beat
  beats[beatIndex] = syllable
  
  // Convert back to text
  const newPattern = beats.filter(s => s).join(' ')
  patternText.value = newPattern
  handleTextInput()
}

// Watch for external pattern changes
watch(() => props.part.pattern, (newPattern) => {
  patternText.value = newPattern || ''
})
</script>

<style scoped>
.pattern-input {
  padding: 1rem;
}

.pattern-editor {
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 4px;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #404040;
}

.tab-button {
  flex: 1;
  padding: 0.75rem;
  background: #2a2a2a;
  color: #cccccc;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.tab-button:hover {
  background: #333333;
}

.tab-button.active {
  background: #ff6b6b;
  color: white;
}

.text-input-container {
  padding: 1rem;
}

.input-wrapper {
  position: relative;
}

.pattern-textarea {
  width: 100%;
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #404040;
  border-radius: 4px;
  padding: 0.75rem;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 1.4;
  resize: vertical;
}

.pattern-textarea:focus {
  outline: none;
  border-color: #ff6b6b;
}

.autocomplete {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.suggestion-item {
  padding: 0.5rem;
  cursor: pointer;
  border-bottom: 1px solid #404040;
}

.suggestion-item:hover {
  background: #333333;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item strong {
  color: #ff6b6b;
  display: block;
}

.suggestion-item span {
  color: #cccccc;
  font-size: 0.9rem;
}

.error {
  color: #ff4444;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.syllable-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #252525;
  border-radius: 4px;
}

.syllable-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: #333333;
  border-radius: 4px;
  min-width: 60px;
}

.syllable-text {
  font-weight: bold;
  color: #ff6b6b;
}

.sticking-indicator {
  font-size: 0.8rem;
  color: #cccccc;
  background: #404040;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
}

.visual-notation {
  padding: 1rem;
}

.beat-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  max-width: 600px;
}

.beat-cell {
  aspect-ratio: 1;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.beat-cell:hover {
  border-color: #ff6b6b;
}

.beat-cell.active {
  background: #ff6b6b;
  color: white;
}

.beat-number {
  font-size: 0.8rem;
  opacity: 0.7;
}

.beat-syllable {
  font-weight: bold;
  margin-top: 0.25rem;
}

.circular-view-container {
  min-height: 500px;
  padding: 1rem;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #252525;
  border-top: 1px solid #404040;
}

.play-button, .stop-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.play-button {
  background: #4caf50;
  color: white;
}

.play-button.playing {
  background: #ff9800;
}

.stop-button {
  background: #f44336;
  color: white;
}

.loop-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  cursor: pointer;
}

.loop-control input[type="checkbox"] {
  accent-color: #ff6b6b;
}

.loop-control input.active {
  accent-color: #4caf50;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
}

.tempo-slider {
  width: 100px;
  accent-color: #ff6b6b;
}
</style>