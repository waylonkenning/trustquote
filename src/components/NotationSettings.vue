<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="notation-settings" @click.stop data-testid="notation-settings">
      <div class="settings-header">
        <h3>Notation Settings</h3>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>
      
      <div class="settings-content">
        <div class="setting-group">
          <label class="setting-label">Regional Style</label>
          <select 
            data-testid="regional-style"
            v-model="selectedStyle"
            @change="handleStyleChange"
            class="setting-select"
          >
            <option 
              v-for="style in REGIONAL_STYLES"
              :key="style.code"
              :value="style.code"
            >
              {{ style.name }}
            </option>
          </select>
          <p class="setting-description">
            Choose the regional kuchi shōga style for your composition
          </p>
        </div>

        <div class="setting-group">
          <label class="setting-label">Syllable Customization</label>
          <div class="syllable-mapping">
            <div 
              v-for="(syllable, key) in currentSyllables"
              :key="key"
              class="syllable-row"
            >
              <span class="syllable-label">{{ key }}:</span>
              <input 
                v-model="currentSyllables[key]"
                @input="markCustomized"
                type="text"
                class="syllable-input"
                :placeholder="getDefaultSyllable(key)"
              />
            </div>
          </div>
          <p class="setting-description">
            Customize syllables to match your preferred notation style
          </p>
        </div>

        <div class="setting-group">
          <label class="setting-label">Display Options</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="showRomanization"
                @change="saveSettings"
              />
              Show romanization
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="showHandSticking"
                @change="saveSettings"
              />
              Show hand sticking by default
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="autoplayOnInput"
                @change="saveSettings"
              />
              Auto-play syllables on input
            </label>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">Audio Settings</label>
          <div class="audio-settings">
            <div class="volume-control">
              <label>Playback Volume:</label>
              <input 
                type="range"
                min="0"
                max="100"
                v-model="audioVolume"
                @input="saveSettings"
                class="volume-slider"
              />
              <span>{{ audioVolume }}%</span>
            </div>
            <div class="sample-selection">
              <label>Sample Set:</label>
              <select 
                v-model="selectedSampleSet"
                @change="saveSettings"
                class="setting-select"
              >
                <option value="traditional">Traditional</option>
                <option value="modern">Modern</option>
                <option value="synthesized">Synthesized</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Style conversion warning -->
        <div 
          v-if="showStyleConversion" 
          data-testid="style-conversion"
          class="conversion-warning"
        >
          <div class="warning-icon">⚠️</div>
          <div class="warning-content">
            <strong>Style Conversion Needed</strong>
            <p>Your current patterns use {{ previousStyle }} style. Would you like to convert them to {{ selectedStyleName }}?</p>
            <div class="warning-actions">
              <button @click="convertPatterns" class="btn-primary">Convert</button>
              <button @click="keepOriginal" class="btn-secondary">Keep Original</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-footer">
        <button 
          data-testid="save-settings"
          @click="saveAndClose"
          class="btn-primary"
        >
          Save Settings
        </button>
        <button @click="resetToDefaults" class="btn-secondary">
          Reset to Defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { REGIONAL_STYLES } from '@/types/composition'
import { useNotationSettings } from '@/composables/useNotationSettings'

defineEmits<{
  close: []
}>()

const {
  settings,
  updateSettings,
  resetSettings,
  convertStylePatterns
} = useNotationSettings()

const selectedStyle = ref(settings.value.regionalStyle)
const currentSyllables = ref({ ...settings.value.customSyllables })
const showRomanization = ref(settings.value.showRomanization)
const showHandSticking = ref(settings.value.showHandSticking)
const autoplayOnInput = ref(settings.value.autoplayOnInput)
const audioVolume = ref(settings.value.audioVolume)
const selectedSampleSet = ref(settings.value.sampleSet)

const showStyleConversion = ref(false)
const previousStyle = ref('')
const isCustomized = ref(false)

const selectedStyleName = computed(() => {
  return REGIONAL_STYLES.find(style => style.code === selectedStyle.value)?.name || 'Unknown'
})

const handleStyleChange = () => {
  const newStyle = REGIONAL_STYLES.find(style => style.code === selectedStyle.value)
  if (newStyle && selectedStyle.value !== settings.value.regionalStyle) {
    previousStyle.value = settings.value.regionalStyle
    showStyleConversion.value = true
    
    // Update syllables to match new style
    currentSyllables.value = { ...newStyle.syllables }
  }
}

const markCustomized = () => {
  isCustomized.value = true
}

const getDefaultSyllable = (key: string) => {
  const style = REGIONAL_STYLES.find(s => s.code === selectedStyle.value)
  return style?.syllables[key] || key
}

const convertPatterns = () => {
  convertStylePatterns(previousStyle.value, selectedStyle.value)
  showStyleConversion.value = false
}

const keepOriginal = () => {
  showStyleConversion.value = false
}

const saveSettings = () => {
  updateSettings({
    regionalStyle: selectedStyle.value,
    customSyllables: currentSyllables.value,
    showRomanization: showRomanization.value,
    showHandSticking: showHandSticking.value,
    autoplayOnInput: autoplayOnInput.value,
    audioVolume: audioVolume.value,
    sampleSet: selectedSampleSet.value,
    isCustomized: isCustomized.value
  })
}

const saveAndClose = () => {
  saveSettings()
  $emit('close')
}

const resetToDefaults = () => {
  resetSettings()
  // Reset local state
  selectedStyle.value = settings.value.regionalStyle
  currentSyllables.value = { ...settings.value.customSyllables }
  showRomanization.value = settings.value.showRomanization
  showHandSticking.value = settings.value.showHandSticking
  autoplayOnInput.value = settings.value.autoplayOnInput
  audioVolume.value = settings.value.audioVolume
  selectedSampleSet.value = settings.value.sampleSet
  isCustomized.value = false
}

onMounted(() => {
  // Load current settings
  selectedStyle.value = settings.value.regionalStyle
  currentSyllables.value = { ...settings.value.customSyllables }
})
</script>

<style scoped>
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

.notation-settings {
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #404040;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  min-width: 500px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #404040;
  background: #333333;
}

.settings-header h3 {
  color: #ff6b6b;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.close-button:hover {
  background: #404040;
}

.settings-content {
  padding: 1rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-label {
  display: block;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.setting-description {
  color: #999999;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.setting-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #1a1a1a;
  color: #ffffff;
}

.setting-select:focus {
  outline: none;
  border-color: #ff6b6b;
}

.syllable-mapping {
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 4px;
  padding: 1rem;
}

.syllable-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.syllable-row:last-child {
  margin-bottom: 0;
}

.syllable-label {
  color: #ff6b6b;
  font-weight: 500;
  min-width: 60px;
}

.syllable-input {
  flex: 1;
  padding: 0.375rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #2a2a2a;
  color: #ffffff;
}

.syllable-input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  accent-color: #ff6b6b;
}

.audio-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
}

.volume-slider {
  flex: 1;
  accent-color: #ff6b6b;
}

.sample-selection {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
}

.sample-selection select {
  flex: 1;
}

.conversion-warning {
  background: #2a1f1f;
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  color: #ff6b6b;
  display: block;
  margin-bottom: 0.5rem;
}

.warning-content p {
  color: #cccccc;
  margin-bottom: 1rem;
}

.warning-actions {
  display: flex;
  gap: 0.5rem;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #404040;
  background: #252525;
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
</style>