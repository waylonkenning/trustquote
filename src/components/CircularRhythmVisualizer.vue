<template>
  <div class="circular-rhythm-visualizer">
    <div class="visualizer-header">
      <h3>Circular Rhythm Visualization</h3>
      <div class="visualizer-controls">
        <button 
          data-testid="zoom-in"
          @click="zoomIn"
          class="control-btn"
        >
          🔍+
        </button>
        <button 
          data-testid="zoom-out"
          @click="zoomOut"
          class="control-btn"
        >
          🔍-
        </button>
        <button 
          data-testid="reset-zoom"
          @click="resetZoom"
          class="control-btn"
        >
          Reset
        </button>
        <button 
          data-testid="export-circular-image"
          @click="exportImage"
          class="control-btn"
        >
          📸 Export
        </button>
      </div>
    </div>

    <div class="visualizer-options">
      <label class="option-checkbox">
        <input 
          data-testid="show-tempo-indicator"
          type="checkbox" 
          v-model="showTempoIndicator"
        />
        Show Tempo Indicator
      </label>
      <label class="option-checkbox">
        <input 
          data-testid="show-subdivisions"
          type="checkbox" 
          v-model="showSubdivisions"
        />
        Show Subdivisions
      </label>
      <label class="option-checkbox">
        <input 
          data-testid="show-relationships"
          type="checkbox" 
          v-model="showRelationships"
        />
        Show Pattern Relationships
      </label>
      <label class="option-checkbox">
        <input 
          data-testid="show-measures"
          type="checkbox" 
          v-model="showMeasures"
        />
        Show Measures
      </label>
      <label class="option-checkbox">
        <input 
          data-testid="show-phrases"
          type="checkbox" 
          v-model="showPhrases"
        />
        Show Phrases
      </label>
      <button 
        data-testid="color-scheme-settings"
        @click="showColorSchemeModal = true"
        class="control-btn"
      >
        🎨 Colors
      </button>
    </div>

    <div 
      data-testid="circular-rhythm-container"
      class="circular-container"
      :class="containerClasses"
      ref="containerRef"
    >
      <svg 
        data-testid="circular-beat-grid"
        class="circular-svg"
        :viewBox="`0 0 ${svgSize} ${svgSize}`"
        :width="svgSize * zoomLevel"
        :height="svgSize * zoomLevel"
        ref="svgRef"
      >
        <!-- Background circles -->
        <g class="background-circles">
          <circle 
            v-for="(circle, index) in backgroundCircles"
            :key="`bg-${index}`"
            :cx="centerX"
            :cy="centerY"
            :r="circle.radius"
            :class="circle.class"
            fill="none"
            stroke="#333"
            stroke-width="1"
            opacity="0.3"
          />
        </g>

        <!-- Subdivision markers -->
        <g v-if="showSubdivisions" data-testid="subdivision-markers">
          <g data-testid="quarter-divisions">
            <line 
              v-for="i in 4"
              :key="`quarter-${i}`"
              :x1="centerX"
              :y1="centerY"
              :x2="centerX + Math.cos((i * 90 - 90) * Math.PI / 180) * maxRadius"
              :y2="centerY + Math.sin((i * 90 - 90) * Math.PI / 180) * maxRadius"
              stroke="#666"
              stroke-width="2"
              opacity="0.5"
            />
          </g>
          <g data-testid="eighth-divisions">
            <line 
              v-for="i in 8"
              :key="`eighth-${i}`"
              :x1="centerX + Math.cos((i * 45 - 90) * Math.PI / 180) * (maxRadius * 0.8)"
              :y1="centerY + Math.sin((i * 45 - 90) * Math.PI / 180) * (maxRadius * 0.8)"
              :x2="centerX + Math.cos((i * 45 - 90) * Math.PI / 180) * maxRadius"
              :y2="centerY + Math.sin((i * 45 - 90) * Math.PI / 180) * maxRadius"
              stroke="#555"
              stroke-width="1"
              opacity="0.3"
            />
          </g>
          <g data-testid="sixteenth-divisions">
            <line 
              v-for="i in 16"
              :key="`sixteenth-${i}`"
              :x1="centerX + Math.cos((i * 22.5 - 90) * Math.PI / 180) * (maxRadius * 0.9)"
              :y1="centerY + Math.sin((i * 22.5 - 90) * Math.PI / 180) * (maxRadius * 0.9)"
              :x2="centerX + Math.cos((i * 22.5 - 90) * Math.PI / 180) * maxRadius"
              :y2="centerY + Math.sin((i * 22.5 - 90) * Math.PI / 180) * maxRadius"
              stroke="#444"
              stroke-width="0.5"
              opacity="0.2"
            />
          </g>
        </g>

        <!-- Measure divisions -->
        <g v-if="showMeasures" data-testid="measure-divisions">
          <line 
            v-for="(measure, index) in measureMarkers"
            :key="`measure-${index}`"
            :data-testid="`measure-marker-${index}`"
            :x1="centerX"
            :y1="centerY"
            :x2="measure.x"
            :y2="measure.y"
            stroke="#ff6b6b"
            stroke-width="3"
            opacity="0.6"
          />
        </g>

        <!-- Phrase divisions -->
        <g v-if="showPhrases" data-testid="phrase-divisions">
          <path 
            v-for="(phrase, index) in phraseArcs"
            :key="`phrase-${index}`"
            :d="phrase.path"
            fill="none"
            :stroke="phrase.color"
            stroke-width="4"
            opacity="0.4"
          />
        </g>

        <!-- Drum part circles -->
        <g class="drum-circles">
          <g 
            v-for="part in composition.parts"
            :key="part.id"
            :data-testid="`${part.drumType}-circle`"
            :data-radius="getPartRadius(part)"
          >
            <circle 
              data-testid="center-circle"
              :cx="centerX"
              :cy="centerY"
              :r="getPartRadius(part)"
              fill="none"
              :stroke="getPartColor(part.drumType)"
              stroke-width="2"
              opacity="0.6"
            />
            
            <!-- Beat markers for this part -->
            <g data-testid="beat-markers">
              <circle 
                v-for="(beat, beatIndex) in getPartBeats(part)"
                :key="`${part.id}-beat-${beatIndex}`"
                :data-testid="`circular-beat-${beatIndex}`"
                :data-angle="beat.angle"
                :data-radius="getPartRadius(part)"
                :cx="beat.x"
                :cy="beat.y"
                :r="beatRadius"
                :class="getBeatClasses(beat)"
                :fill="getBeatColor(beat)"
                stroke="#fff"
                stroke-width="2"
                @click="onBeatClick(part.id, beatIndex)"
                style="cursor: pointer"
              />
              
              <!-- Syllable text -->
              <text 
                v-for="(beat, beatIndex) in getPartBeats(part)"
                v-if="beat.syllable"
                :key="`${part.id}-text-${beatIndex}`"
                :x="beat.x"
                :y="beat.y + 4"
                text-anchor="middle"
                class="beat-text"
                fill="#fff"
                font-size="10"
                font-weight="bold"
              >
                {{ beat.syllable }}
              </text>
            </g>
          </g>
        </g>

        <!-- Pattern relationship lines -->
        <g v-if="showRelationships" data-testid="pattern-connections">
          <line 
            v-for="(connection, index) in patternConnections"
            :key="`connection-${index}`"
            :data-testid="`connection-line-${index}`"
            :x1="connection.x1"
            :y1="connection.y1"
            :x2="connection.x2"
            :y2="connection.y2"
            stroke="#ffd93d"
            stroke-width="2"
            opacity="0.6"
            stroke-dasharray="4,4"
          />
        </g>

        <!-- Tempo indicator -->
        <g v-if="showTempoIndicator" class="tempo-indicator">
          <circle 
            data-testid="tempo-center"
            :cx="centerX"
            :cy="centerY"
            r="8"
            fill="#ff6b6b"
          />
          <line 
            data-testid="tempo-hand"
            :class="{ rotating: isPlaying }"
            :x1="centerX"
            :y1="centerY"
            :x2="centerX + Math.cos(tempoAngle) * (maxRadius * 0.7)"
            :y2="centerY + Math.sin(tempoAngle) * (maxRadius * 0.7)"
            stroke="#ff6b6b"
            stroke-width="3"
            stroke-linecap="round"
          />
        </g>

        <!-- Playback indicator -->
        <circle 
          v-if="isPlaying"
          data-testid="playback-indicator"
          :class="{ animating: isPlaying }"
          :cx="playbackPosition.x"
          :cy="playbackPosition.y"
          r="12"
          fill="rgba(255, 107, 107, 0.8)"
          stroke="#fff"
          stroke-width="2"
        />
      </svg>
    </div>

    <!-- Syllable selector modal -->
    <div v-if="showSyllableSelector" class="modal-overlay" @click="closeSyllableSelector">
      <div class="syllable-selector" data-testid="syllable-selector" @click.stop>
        <h4>Select Syllable</h4>
        <div class="syllable-grid">
          <button 
            v-for="syllable in availableSyllables"
            :key="syllable"
            :data-testid="`select-${syllable}`"
            @click="selectSyllable(syllable)"
            class="syllable-btn"
            :class="`timbre-${mapSyllableToTimbre(syllable)}`"
          >
            {{ syllable }}
          </button>
        </div>
        <button @click="selectSyllable('')" class="syllable-btn clear-btn">
          Clear
        </button>
      </div>
    </div>

    <!-- Color scheme modal -->
    <ColorSchemeModal 
      v-if="showColorSchemeModal"
      @close="showColorSchemeModal = false"
      @scheme-changed="updateColorScheme"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useKuchiShoga } from '@/composables/useKuchiShoga'
import ColorSchemeModal from './ColorSchemeModal.vue'
import type { Composition, CompositionPart } from '@/types/composition'

interface Props {
  composition: Composition
  isPlaying: boolean
  currentBeat: number
  tempo: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'beat-updated': [partId: string, beatIndex: number, syllable: string]
}>()

const { parseSyllables, mapSyllableToTimbre } = useKuchiShoga()

// Component state
const containerRef = ref<HTMLElement>()
const svgRef = ref<SVGElement>()
const zoomLevel = ref(1)
const showTempoIndicator = ref(false)
const showSubdivisions = ref(false)
const showRelationships = ref(false)
const showMeasures = ref(false)
const showPhrases = ref(false)
const showSyllableSelector = ref(false)
const showColorSchemeModal = ref(false)
const selectedBeat = ref<{ partId: string; beatIndex: number } | null>(null)
const colorScheme = ref('default')

// SVG dimensions
const svgSize = ref(400)
const centerX = computed(() => svgSize.value / 2)
const centerY = computed(() => svgSize.value / 2)
const maxRadius = computed(() => svgSize.value * 0.4)
const beatRadius = ref(12)

// Tempo animation
const tempoAngle = ref(-Math.PI / 2) // Start at top
let tempoAnimationFrame: number | null = null

const availableSyllables = ['don', 'ka', 'doko', 'tsu', 'ko', 'su', 'ra', 'te']

const containerClasses = computed(() => {
  const classes = [`zoom-${Math.round(zoomLevel.value * 10)}`, colorScheme.value]
  if (zoomLevel.value > 1) classes.push('zoomed-in')
  if (zoomLevel.value < 1) classes.push('zoomed-out')
  if (zoomLevel.value === 1) classes.push('default-zoom')
  return classes
})

const backgroundCircles = computed(() => {
  const circles = []
  const numCircles = Math.max(props.composition.parts.length, 3)
  for (let i = 1; i <= numCircles; i++) {
    circles.push({
      radius: (maxRadius.value / numCircles) * i,
      class: `bg-circle-${i}`
    })
  }
  return circles
})

const measureMarkers = computed(() => {
  // Assuming 4/4 time, mark every 4 beats
  const markers = []
  const beatsPerMeasure = 4
  const maxBeats = 16 // Configurable
  
  for (let i = 0; i < maxBeats; i += beatsPerMeasure) {
    const angle = (i / maxBeats) * 2 * Math.PI - Math.PI / 2
    markers.push({
      x: centerX.value + Math.cos(angle) * maxRadius.value,
      y: centerY.value + Math.sin(angle) * maxRadius.value
    })
  }
  return markers
})

const phraseArcs = computed(() => {
  // Jo-Ha-Kyū structure: beginning, development, climax
  const totalBeats = 16
  const joEnd = totalBeats * 0.3
  const haEnd = totalBeats * 0.7
  
  const createArc = (startBeat: number, endBeat: number, color: string) => {
    const startAngle = (startBeat / totalBeats) * 2 * Math.PI - Math.PI / 2
    const endAngle = (endBeat / totalBeats) * 2 * Math.PI - Math.PI / 2
    const radius = maxRadius.value * 1.1
    
    const startX = centerX.value + Math.cos(startAngle) * radius
    const startY = centerY.value + Math.sin(startAngle) * radius
    const endX = centerX.value + Math.cos(endAngle) * radius
    const endY = centerY.value + Math.sin(endAngle) * radius
    
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0
    
    return {
      path: `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
      color
    }
  }
  
  return [
    createArc(0, joEnd, '#4CAF50'), // Jo - green
    createArc(joEnd, haEnd, '#FF9800'), // Ha - orange  
    createArc(haEnd, totalBeats, '#F44336') // Kyū - red
  ]
})

const patternConnections = computed(() => {
  // Find similar patterns and connect them
  const connections = []
  // This would analyze patterns and create connections
  // For now, simple placeholder
  return connections
})

const playbackPosition = computed(() => {
  if (!props.isPlaying || props.composition.parts.length === 0) {
    return { x: centerX.value, y: centerY.value }
  }
  
  const part = props.composition.parts[0]
  const beats = getPartBeats(part)
  const currentBeatData = beats[props.currentBeat % beats.length]
  
  return currentBeatData ? { x: currentBeatData.x, y: currentBeatData.y } : { x: centerX.value, y: centerY.value }
})

const getPartRadius = (part: CompositionPart) => {
  const index = props.composition.parts.indexOf(part)
  const totalParts = props.composition.parts.length
  return maxRadius.value * (0.3 + (index * 0.7) / Math.max(totalParts - 1, 1))
}

const getPartColor = (drumType: string) => {
  const colors = {
    'chu-daiko': '#ff6b6b',
    'shime-daiko': '#4ecdc4', 
    'o-daiko': '#45b7d1',
    'atarigane': '#ffd93d'
  }
  return colors[drumType as keyof typeof colors] || '#999'
}

const getPartBeats = (part: CompositionPart) => {
  const parsed = parseSyllables(part.pattern || '')
  const maxBeats = Math.max(parsed.beats, 8) // Minimum 8 beats
  const radius = getPartRadius(part)
  const beats = []
  
  for (let i = 0; i < maxBeats; i++) {
    const angle = (i / maxBeats) * 2 * Math.PI - Math.PI / 2
    const x = centerX.value + Math.cos(angle) * radius
    const y = centerY.value + Math.sin(angle) * radius
    
    const syllableData = parsed.syllables.find(s => s.beat === i + 1)
    
    beats.push({
      x,
      y,
      angle: angle * 180 / Math.PI,
      syllable: syllableData?.syllable || '',
      timbre: syllableData?.timbre || '',
      hand: syllableData?.hand || null,
      filled: !!syllableData?.syllable
    })
  }
  
  return beats
}

const getBeatClasses = (beat: any) => {
  const classes = ['beat-marker']
  if (beat.filled) classes.push('filled')
  if (beat.timbre) classes.push(`timbre-${beat.timbre}`)
  return classes.join(' ')
}

const getBeatColor = (beat: any) => {
  if (!beat.filled) return 'rgba(255, 255, 255, 0.3)'
  
  const colors = {
    don: '#ff6b6b',
    ka: '#4ecdc4',
    doko: '#45b7d1', 
    tsu: '#ffd93d'
  }
  return colors[beat.timbre as keyof typeof colors] || '#999'
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const exportImage = () => {
  if (!svgRef.value) return
  
  const svgData = new XMLSerializer().serializeToString(svgRef.value)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  
  canvas.width = svgSize.value
  canvas.height = svgSize.value
  
  img.onload = () => {
    ctx?.drawImage(img, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `circular-rhythm-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    })
  }
  
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
}

const onBeatClick = (partId: string, beatIndex: number) => {
  selectedBeat.value = { partId, beatIndex }
  showSyllableSelector.value = true
}

const selectSyllable = (syllable: string) => {
  if (selectedBeat.value) {
    emit('beat-updated', selectedBeat.value.partId, selectedBeat.value.beatIndex, syllable)
    closeSyllableSelector()
  }
}

const closeSyllableSelector = () => {
  showSyllableSelector.value = false
  selectedBeat.value = null
}

const updateColorScheme = (scheme: string) => {
  colorScheme.value = scheme
  showColorSchemeModal.value = false
}

const animateTempo = () => {
  if (props.isPlaying) {
    const beatsPerSecond = props.tempo / 60
    const radiansPerSecond = beatsPerSecond * 2 * Math.PI
    tempoAngle.value += radiansPerSecond * 0.016 // ~60fps
    tempoAnimationFrame = requestAnimationFrame(animateTempo)
  }
}

watch(() => props.isPlaying, (playing) => {
  if (playing) {
    animateTempo()
  } else if (tempoAnimationFrame) {
    cancelAnimationFrame(tempoAnimationFrame)
    tempoAnimationFrame = null
  }
})

onMounted(() => {
  // Adjust SVG size based on container
  if (containerRef.value) {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      const size = Math.min(entry.contentRect.width, entry.contentRect.height)
      svgSize.value = Math.max(size - 40, 300)
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (tempoAnimationFrame) {
    cancelAnimationFrame(tempoAnimationFrame)
  }
})
</script>

<style scoped>
.circular-rhythm-visualizer {
  background: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #404040;
  overflow: hidden;
}

.visualizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #2a2a2a;
  border-bottom: 1px solid #404040;
}

.visualizer-header h3 {
  color: #ff6b6b;
  margin: 0;
}

.visualizer-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: #404040;
  color: #ffffff;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.control-btn:hover {
  background: #555555;
}

.visualizer-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #252525;
  border-bottom: 1px solid #404040;
}

.option-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  font-size: 0.9rem;
  cursor: pointer;
}

.option-checkbox input[type="checkbox"] {
  accent-color: #ff6b6b;
}

.circular-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #1a1a1a;
  transition: all 0.3s ease;
}

.circular-svg {
  max-width: 100%;
  max-height: 100%;
  transition: all 0.3s ease;
}

.beat-marker {
  transition: all 0.2s ease;
}

.beat-marker:hover {
  stroke-width: 3;
  filter: brightness(1.2);
}

.beat-marker.filled {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}

.beat-text {
  pointer-events: none;
  user-select: none;
}

.tempo-indicator .rotating {
  animation: rotate 1s linear infinite;
  transform-origin: center;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.playback-indicator.animating {
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { r: 8; opacity: 1; }
  to { r: 16; opacity: 0.6; }
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

.syllable-selector {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #404040;
  min-width: 300px;
}

.syllable-selector h4 {
  color: #ffffff;
  margin-bottom: 1rem;
  text-align: center;
}

.syllable-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.syllable-btn {
  padding: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.syllable-btn.timbre-don {
  background: #ff6b6b;
  color: white;
}

.syllable-btn.timbre-ka {
  background: #4ecdc4;
  color: white;
}

.syllable-btn.timbre-doko {
  background: #45b7d1;
  color: white;
}

.syllable-btn.timbre-tsu {
  background: #ffd93d;
  color: black;
}

.syllable-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.clear-btn {
  background: #666666 !important;
  color: white !important;
  grid-column: span 4;
}

/* Color scheme classes */
.high-contrast {
  filter: contrast(1.5);
}

.colorblind-friendly .timbre-don {
  background: #0173b2 !important;
}

.colorblind-friendly .timbre-ka {
  background: #de8f05 !important;
}

.colorblind-friendly .timbre-doko {
  background: #029e73 !important;
}

.colorblind-friendly .timbre-tsu {
  background: #cc78bc !important;
}

.monochrome {
  filter: grayscale(1);
}

.monochrome .beat-marker {
  stroke: #ffffff !important;
}
</style>