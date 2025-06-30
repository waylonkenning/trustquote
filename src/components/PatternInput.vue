<template>
  <div class="pattern-input">
    <div class="pattern-editor" data-testid="pattern-editor">
      <div class="editor-tabs">
        <button 
          data-testid="view-text"
          :class="{ active: viewMode === 'text' }"
          @click="setViewMode('text')"
          class="tab-button"
        >
          Text Input
        </button>
        <button 
          data-testid="view-visual"
          :class="{ active: viewMode === 'visual' }"
          @click="setViewMode('visual')"
          class="tab-button"
        >
          Linear Grid
        </button>
        <button 
          data-testid="view-circular"
          :class="{ active: viewMode === 'circular' }"
          @click="setViewMode('circular')"
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

      <!-- Debug viewMode -->
      <div class="debug-viewmode" data-testid="debug-viewmode">Current viewMode: {{ viewMode }}</div>

      <!-- Circular Visualization Mode -->
      <div v-if="viewMode === 'circular'" class="circular-view-container" data-testid="circular-view-wrapper">
        <div class="circular-debug">Debug: Circular view is active, viewMode: {{ viewMode }}</div>
        <div class="basic-circular-view" data-testid="circular-rhythm-container">
          <svg 
            data-testid="circular-beat-grid"
            class="circular-svg"
            viewBox="0 0 400 400"
            width="400"
            height="400"
          >
            <!-- Background circle -->
            <circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              stroke="#333"
              stroke-width="2"
            />
            
            <!-- Center point -->
            <circle
              data-testid="center-circle"
              cx="200"
              cy="200"
              r="8"
              fill="#ff6b6b"
            />
            
            <!-- Beat markers with minimal reactivity -->
            <g data-testid="beat-markers">
              <circle cx="200" cy="50" r="12" :fill="getBeatFill(0)" stroke="#fff" stroke-width="2" data-testid="circular-beat-0" @click="onBeatClick(0)" style="cursor: pointer"/>
              <circle cx="306" cy="94" r="12" :fill="getBeatFill(1)" stroke="#fff" stroke-width="2" data-testid="circular-beat-1" @click="onBeatClick(1)" style="cursor: pointer"/>
              <circle cx="350" cy="200" r="12" :fill="getBeatFill(2)" stroke="#fff" stroke-width="2" data-testid="circular-beat-2" @click="onBeatClick(2)" style="cursor: pointer"/>
              <circle cx="306" cy="306" r="12" :fill="getBeatFill(3)" stroke="#fff" stroke-width="2" data-testid="circular-beat-3" @click="onBeatClick(3)" style="cursor: pointer"/>
              <circle cx="200" cy="350" r="12" :fill="getBeatFill(4)" stroke="#fff" stroke-width="2" data-testid="circular-beat-4" @click="onBeatClick(4)" style="cursor: pointer"/>
              <circle cx="94" cy="306" r="12" :fill="getBeatFill(5)" stroke="#fff" stroke-width="2" data-testid="circular-beat-5" @click="onBeatClick(5)" style="cursor: pointer"/>
              <circle cx="50" cy="200" r="12" :fill="getBeatFill(6)" stroke="#fff" stroke-width="2" data-testid="circular-beat-6" @click="onBeatClick(6)" style="cursor: pointer"/>
              <circle cx="94" cy="94" r="12" :fill="getBeatFill(7)" stroke="#fff" stroke-width="2" data-testid="circular-beat-7" @click="onBeatClick(7)" style="cursor: pointer"/>
              
              <!-- Beat labels -->
              <text v-if="getBeatSyllable(0)" x="200" y="54" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(0) }}</text>
              <text v-if="getBeatSyllable(1)" x="306" y="98" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(1) }}</text>
              <text v-if="getBeatSyllable(2)" x="350" y="204" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(2) }}</text>
              <text v-if="getBeatSyllable(3)" x="306" y="310" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(3) }}</text>
              <text v-if="getBeatSyllable(4)" x="200" y="354" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(4) }}</text>
              <text v-if="getBeatSyllable(5)" x="94" y="310" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(5) }}</text>
              <text v-if="getBeatSyllable(6)" x="50" y="204" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(6) }}</text>
              <text v-if="getBeatSyllable(7)" x="94" y="98" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">{{ getBeatSyllable(7) }}</text>
            </g>
          </svg>
          
          <div class="circular-info">
            <p>Pattern: {{ patternText || 'Empty' }}</p>
            <p>8-beat circular layout</p>
          </div>
        </div>
      </div>

      <!-- Playback controls -->
      <div class="playback-controls">
        <div class="primary-controls">
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
            <div v-if="loopEnabled && isPlaying" data-testid="loop-indicator" class="loop-indicator">∞</div>
          </label>
        </div>
        
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
        
        <div class="volume-control">
          <label>Volume:</label>
          <input 
            data-testid="volume-slider"
            type="range"
            min="0"
            max="100"
            v-model="volume"
            class="volume-slider"
          />
          <span data-testid="volume-display">{{ volume }}%</span>
          <div data-testid="volume-meter" class="volume-meter">
            <div class="volume-bar" :style="{ width: volume + '%' }"></div>
          </div>
        </div>
        
        <div class="playback-status">
          <div data-testid="playback-status" class="status-text">
            {{ isPlaying ? 'Playing' : 'Stopped' }}
          </div>
          <div v-if="isPlaying" data-testid="beat-indicator" class="beat-indicator">
            Beat: <span data-testid="current-beat">{{ currentBeat + 1 }}</span>
          </div>
          <div data-testid="playback-progress" v-if="isPlaying" class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        
        <div class="audio-status">
          <div data-testid="audio-context-status" class="context-status">
            Audio: {{ audioContextStatus }}
          </div>
        </div>
      </div>
      
      <!-- Audio Settings -->
      <div class="audio-settings" data-testid="audio-settings">
        <details>
          <summary>Audio Settings</summary>
          <div class="settings-grid">
            <label class="setting-control">
              <input 
                data-testid="audio-feedback-toggle"
                type="checkbox"
                v-model="audioFeedbackEnabled"
              />
              Audio Feedback
            </label>
            
            <label class="setting-control">
              <input 
                data-testid="metronome-toggle"
                type="checkbox"
                v-model="metronomeEnabled"
                @change="toggleMetronome"
              />
              Metronome
            </label>
            
            <div class="setting-control">
              <label>Metronome Volume:</label>
              <input 
                data-testid="metronome-volume"
                type="range"
                min="0"
                max="100"
                v-model="metronomeVolume"
                class="setting-slider"
              />
              <span>{{ metronomeVolume }}%</span>
            </div>
            
            <div class="setting-control">
              <label>Pitch Adjustment:</label>
              <input 
                data-testid="pitch-adjustment"
                type="range"
                min="-12"
                max="12"
                v-model="pitchAdjustment"
                class="setting-slider"
              />
              <span data-testid="pitch-display">{{ pitchAdjustment > 0 ? '+' : '' }}{{ pitchAdjustment }} semitones</span>
            </div>
            
            <div class="setting-control">
              <label>Playback Rate:</label>
              <input 
                data-testid="playback-rate"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                v-model="playbackRate"
                class="setting-slider"
              />
              <span data-testid="playback-rate-display">{{ playbackRate }}x</span>
            </div>
            
            <div class="setting-control">
              <label>Master Volume:</label>
              <input 
                data-testid="master-volume"
                type="range"
                min="0"
                max="100"
                v-model="masterVolume"
                class="setting-slider"
                @input="updateMasterVolume"
              />
              <span>{{ masterVolume }}%</span>
            </div>
            
            <div :data-testid="`drum-timbre-${part.drumType}`" class="timbre-settings">
              <h5>{{ part.drumType }} Timbre</h5>
              <div class="timbre-controls">
                <div :data-testid="`frequency-${part.drumType}`" class="timbre-control">
                  <label>Base Frequency:</label>
                  <span>{{ getDrumBaseFrequency() }}Hz</span>
                </div>
                <div :data-testid="`envelope-${part.drumType}`" class="timbre-control">
                  <label>Envelope:</label>
                  <span>{{ getDrumEnvelope() }}</span>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
      
      <!-- Individual Syllable Playback -->
      <div v-if="parsedSyllables.length > 0" class="syllable-playback">
        <h4>Individual Syllables:</h4>
        <div class="syllable-buttons">
          <button 
            v-for="(syllable, index) in uniqueSyllables"
            :key="syllable"
            :data-testid="`play-syllable-${syllable}`"
            @click="playSingleSyllable(syllable)"
            class="syllable-play-btn"
          >
            {{ syllable }}
          </button>
        </div>
        <div v-if="audioFeedbackEnabled" data-testid="audio-feedback-indicator" class="feedback-indicator">
          {{ lastPlayedSyllable ? `Played: ${lastPlayedSyllable}` : '' }}
        </div>
      </div>
      
      <!-- Metronome Indicators -->
      <div v-if="metronomeEnabled && isPlaying" class="metronome-display">
        <div data-testid="metronome-beat" class="metronome-beat" :class="{ accent: isAccentBeat }">
          ♪
        </div>
        <div data-testid="metronome-accent" v-if="isAccentBeat" class="metronome-accent">
          ♫
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useKuchiShoga } from '@/composables/useKuchiShoga'
import { audioService } from '@/services/audioService'
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
// Keep track of visual beat state separately
const visualBeatState = ref(new Map<number, string>())
const isPlaying = ref(false)
const loopEnabled = ref(false)
const tempo = ref(120)
const volume = ref(props.part.volume || 80)
const currentBeat = ref(0)
const audioContextStatus = ref('not-initialized')
const audioFeedbackEnabled = ref(true)
const metronomeEnabled = ref(false)
const metronomeVolume = ref(30)
const pitchAdjustment = ref(0)
const playbackRate = ref(1.0)
const masterVolume = ref(70)

const parsedSyllables = computed(() => {
  const result = parseSyllables(patternText.value)
  return result.syllables
})

const circularComposition = computed(() => {
  // Ensure the part has all required fields for CircularRhythmVisualizer
  const safePart = {
    id: props.part.id || 'temp-part',
    drumType: props.part.drumType || 'chu-daiko',
    pattern: patternText.value || '',
    volume: props.part.volume || 80
  }
  
  return {
    id: 'temp-composition',
    title: 'Pattern Editor',
    parts: [safePart],
    tempo: tempo.value,
    createdAt: new Date()
  }
})

const simpleBeats = computed(() => {
  const centerX = 200
  const centerY = 200
  const radius = 150
  const numBeats = 8
  const beats = []
  
  // Simple safe parsing
  const text = patternText.value || ''
  const parts = text.split(' ')
  
  for (let i = 0; i < numBeats; i++) {
    const angle = (i / numBeats) * 2 * Math.PI - Math.PI / 2 // Start at top
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    
    // Simple syllable extraction
    let syllable = ''
    if (text.includes('-')) {
      // Positional pattern
      syllable = parts[i] && parts[i] !== '-' ? parts[i] : ''
    } else {
      // Consecutive pattern
      syllable = parts[i] || ''
    }
    
    beats.push({
      x,
      y,
      syllable,
      beat: i + 1
    })
  }
  
  return beats
})

const setViewMode = (mode: 'text' | 'visual' | 'circular') => {
  console.log('setViewMode called with:', mode)
  console.log('Current viewMode before:', viewMode.value)
  viewMode.value = mode
  console.log('ViewMode after assignment:', viewMode.value)
}

const getBeatSyllable = (beatIndex: number) => {
  const text = patternText.value || ''
  const parts = text.split(' ')
  
  if (text.includes('-')) {
    // Positional pattern
    return parts[beatIndex] && parts[beatIndex] !== '-' ? parts[beatIndex] : ''
  } else {
    // Consecutive pattern
    return parts[beatIndex] || ''
  }
}

const getBeatFill = (beatIndex: number) => {
  const syllable = getBeatSyllable(beatIndex)
  return syllable ? '#ff6b6b' : '#333'
}

const onBeatClick = async (beatIndex: number) => {
  console.log('Beat clicked:', beatIndex)
  
  // Simple beat toggle for now
  const text = patternText.value || ''
  const parts = text.split(' ')
  const maxBeats = 8
  
  // Ensure we have enough parts
  while (parts.length < maxBeats) {
    parts.push('-')
  }
  
  // Toggle the beat
  if (parts[beatIndex] && parts[beatIndex] !== '-') {
    parts[beatIndex] = '-' // Remove syllable
  } else {
    parts[beatIndex] = 'don' // Add default syllable
    
    // Play audio feedback if enabled
    if (audioFeedbackEnabled.value) {
      await playSingleSyllable('don')
    }
  }
  
  patternText.value = parts.join(' ')
  handleTextInput()
}

const visualBeats = computed(() => {
  const maxBeats = 16
  const beats = new Array(maxBeats).fill(null).map((_, i) => ({ syllable: '', beat: i + 1 }))
  
  // Use the visual beat state to populate the grid
  visualBeatState.value.forEach((syllable, position) => {
    if (position < maxBeats) {
      beats[position].syllable = syllable
    }
  })
  
  return beats
})

const handleTextInput = async () => {
  const validation = validatePattern(patternText.value)
  validationError.value = validation.error || ''
  
  // Sync visual state when text changes (but only if we're not in visual mode to avoid loops)
  if (viewMode.value !== 'visual') {
    syncVisualStateFromText()
  }
  
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
  syncVisualStateFromText()
  handleTextInput()
}

const syncTextFromVisualState = () => {
  // Convert visual state to text pattern using positional representation with dashes
  if (visualBeatState.value.size === 0) {
    patternText.value = ''
  } else {
    const maxPosition = Math.max(...Array.from(visualBeatState.value.keys()))
    const result: string[] = []
    
    for (let i = 0; i <= maxPosition; i++) {
      if (visualBeatState.value.has(i)) {
        result.push(visualBeatState.value.get(i)!)
      } else {
        result.push('-')
      }
    }
    
    patternText.value = result.join(' ')
  }
  handleTextInput()
}

const syncVisualStateFromText = () => {
  // Clear existing visual state
  visualBeatState.value.clear()
  
  // Parse text pattern and map to visual positions
  if (patternText.value.trim()) {
    const parts = patternText.value.split(' ')
    
    // Check if the pattern uses positional representation (contains dashes)
    if (patternText.value.includes('-')) {
      // Positional pattern - map directly by index
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] && parts[i].trim() && parts[i].trim() !== '-') {
          visualBeatState.value.set(i, parts[i].trim())
        }
      }
    } else {
      // Consecutive pattern - map to consecutive positions starting from 0
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] && parts[i].trim()) {
          visualBeatState.value.set(i, parts[i].trim())
        }
      }
    }
  }
}

const toggleBeat = async (beatIndex: number) => {
  // Toggle the beat in the visual state
  if (visualBeatState.value.has(beatIndex)) {
    visualBeatState.value.delete(beatIndex) // Remove syllable if present
  } else {
    visualBeatState.value.set(beatIndex, 'don') // Add default syllable
    
    // Play audio feedback if enabled
    if (audioFeedbackEnabled.value) {
      await playSingleSyllable('don')
    }
  }
  
  // Sync the text pattern with the visual state
  syncTextFromVisualState()
}

const uniqueSyllables = computed(() => {
  const syllables = parsedSyllables.value.map(s => s.syllable).filter(s => s !== '-')
  return [...new Set(syllables)]
})

const progressPercent = computed(() => {
  if (!isPlaying.value || !patternText.value) return 0
  const totalBeats = patternText.value.split(' ').filter(s => s.trim() !== '').length
  return totalBeats > 0 ? (currentBeat.value / totalBeats) * 100 : 0
})

const isAccentBeat = computed(() => {
  return currentBeat.value % 4 === 0
})

const lastPlayedSyllable = ref('')

const togglePlayback = async () => {
  if (isPlaying.value) {
    stopPlayback()
  } else {
    await startPlayback()
  }
}

const startPlayback = async () => {
  try {
    await audioService.initialize()
    audioContextStatus.value = audioService.getAudioContextState()
    
    if (metronomeEnabled.value) {
      audioService.startMetronome(tempo.value, metronomeVolume.value / 100)
    }
    
    audioService.setOnBeatCallback((beat) => {
      currentBeat.value = beat
    })
    
    isPlaying.value = true
    await audioService.playPattern(
      patternText.value,
      props.part.drumType,
      tempo.value * playbackRate.value,
      volume.value / 100,
      loopEnabled.value
    )
    
    if (!loopEnabled.value) {
      isPlaying.value = false
    }
  } catch (error) {
    console.error('Failed to start playback:', error)
    audioContextStatus.value = 'error'
  }
}

const stopPlayback = () => {
  isPlaying.value = false
  audioService.stopPattern()
  audioService.stopMetronome()
  currentBeat.value = 0
}

const playSingleSyllable = async (syllable: string) => {
  try {
    await audioService.initialize()
    audioContextStatus.value = audioService.getAudioContextState()
    
    await audioService.playSyllable(
      syllable,
      props.part.drumType,
      volume.value / 100,
      pitchAdjustment.value
    )
    
    lastPlayedSyllable.value = syllable
    
    // Clear feedback after delay
    setTimeout(() => {
      if (lastPlayedSyllable.value === syllable) {
        lastPlayedSyllable.value = ''
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to play syllable:', error)
    audioContextStatus.value = 'error'
  }
}

const toggleMetronome = () => {
  if (metronomeEnabled.value && isPlaying.value) {
    audioService.startMetronome(tempo.value, metronomeVolume.value / 100)
  } else {
    audioService.stopMetronome()
  }
}

const updateMasterVolume = () => {
  audioService.setMasterVolume(masterVolume.value / 100)
}

const getDrumBaseFrequency = () => {
  const baseFreqs = {
    'chu-daiko': '80-120',
    'shime-daiko': '120-200', 
    'o-daiko': '60-100',
    'atarigane': '800-1200'
  }
  return baseFreqs[props.part.drumType] || '80-120'
}

const getDrumEnvelope = () => {
  const envelopes = {
    'chu-daiko': 'Medium attack, long sustain',
    'shime-daiko': 'Fast attack, short decay',
    'o-daiko': 'Slow attack, very long sustain', 
    'atarigane': 'Very fast attack, minimal sustain'
  }
  return envelopes[props.part.drumType] || 'Standard'
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

// Initialize audio service
onMounted(async () => {
  try {
    await audioService.initialize()
    audioContextStatus.value = audioService.getAudioContextState()
  } catch (error) {
    console.error('Failed to initialize audio:', error)
    audioContextStatus.value = 'error'
  }
})

onBeforeUnmount(() => {
  stopPlayback()
})

// Initialize visual state from the initial pattern
syncVisualStateFromText()

// Watch for external pattern changes
watch(() => props.part.pattern, (newPattern) => {
  patternText.value = newPattern || ''
  syncVisualStateFromText()
})

// Watch volume changes
watch(volume, (newVolume) => {
  emit('pattern-updated', patternText.value)
})

// Watch for tempo changes during playback
watch(tempo, (newTempo) => {
  if (isPlaying.value) {
    // Restart playback with new tempo
    stopPlayback()
    setTimeout(() => startPlayback(), 100)
  }
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

.primary-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
}

.volume-slider {
  width: 100px;
  accent-color: #ff6b6b;
}

.volume-meter {
  width: 50px;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.volume-bar {
  height: 100%;
  background: linear-gradient(to right, #4caf50, #ff9800, #f44336);
  transition: width 0.2s;
}

.playback-status {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #cccccc;
  font-size: 0.9rem;
}

.beat-indicator {
  color: #ff6b6b;
  font-weight: bold;
}

.progress-bar {
  width: 100px;
  height: 4px;
  background: #333;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff6b6b;
  transition: width 0.1s;
}

.audio-status {
  color: #cccccc;
  font-size: 0.8rem;
}

.context-status {
  padding: 0.25rem 0.5rem;
  background: #333;
  border-radius: 4px;
}

.audio-settings {
  background: #252525;
  border-top: 1px solid #404040;
}

.audio-settings summary {
  padding: 1rem;
  cursor: pointer;
  color: #cccccc;
  font-weight: 500;
}

.audio-settings summary:hover {
  color: #fff;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  font-size: 0.9rem;
}

.setting-control input[type="checkbox"] {
  accent-color: #ff6b6b;
}

.setting-slider {
  width: 80px;
  accent-color: #ff6b6b;
}

.syllable-playback {
  padding: 1rem;
  background: #252525;
  border-top: 1px solid #404040;
}

.syllable-playback h4 {
  margin-bottom: 0.5rem;
  color: #fff;
  font-size: 0.9rem;
}

.syllable-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.syllable-play-btn {
  padding: 0.5rem 1rem;
  background: #333;
  color: #ff6b6b;
  border: 1px solid #404040;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.syllable-play-btn:hover {
  background: #ff6b6b;
  color: white;
}

.feedback-indicator {
  color: #4caf50;
  font-size: 0.8rem;
  font-style: italic;
}

.metronome-display {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  z-index: 1000;
}

.metronome-beat {
  font-size: 1.5rem;
  color: #4caf50;
  animation: metronome-pulse 0.1s ease-out;
}

.metronome-beat.accent {
  color: #ff6b6b;
  font-size: 2rem;
}

.metronome-accent {
  color: #ff9800;
  font-size: 1.2rem;
}

.loop-indicator {
  color: #4caf50;
  font-size: 1.2rem;
  margin-left: 0.25rem;
}

@keyframes metronome-pulse {
  0% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.timbre-settings {
  grid-column: span 2;
  background: #333;
  padding: 1rem;
  border-radius: 4px;
}

.timbre-settings h5 {
  margin: 0 0 0.5rem 0;
  color: #ff6b6b;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.timbre-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.timbre-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timbre-control label {
  font-size: 0.8rem;
  color: #cccccc;
}

.timbre-control span {
  font-size: 0.8rem;
  color: #fff;
  font-weight: bold;
}
</style>