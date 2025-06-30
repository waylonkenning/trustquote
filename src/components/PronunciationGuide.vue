<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="pronunciation-guide" @click.stop>
      <div class="guide-header">
        <h3>Kuchi Shōga Pronunciation Guide</h3>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>
      
      <div class="guide-content">
        <div class="syllable-grid">
          <div 
            v-for="syllable in syllables"
            :key="syllable.name"
            :data-testid="`guide-${syllable.name}`"
            class="syllable-card"
          >
            <div class="syllable-name">{{ syllable.name }}</div>
            <div class="syllable-pronunciation">{{ syllable.pronunciation }}</div>
            <div class="syllable-description">{{ syllable.description }}</div>
            <div class="syllable-technique">{{ syllable.technique }}</div>
            <button 
              :data-testid="`play-${syllable.name}`"
              @click="playAudio(syllable.name)"
              class="play-audio-button"
              :disabled="!syllable.hasAudio"
            >
              🔊 Play
            </button>
          </div>
        </div>
        
        <div class="guide-notes">
          <h4>Usage Notes</h4>
          <ul>
            <li><strong>don</strong> - Deep, resonant strike in the center of the drum</li>
            <li><strong>ka</strong> - Sharp, high-pitched strike on the rim</li>
            <li><strong>doko</strong> - Compound pattern combining don and ka</li>
            <li><strong>tsu</strong> - Light, quick strike</li>
          </ul>
          
          <h4>Regional Variations</h4>
          <p>Different taiko schools may use slightly different syllables. You can customize these in Settings.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  close: []
}>()

const syllables = ref([
  {
    name: 'don',
    pronunciation: 'dohn',
    description: 'Deep center strike',
    technique: 'Strike the center of the drum with full arm motion',
    hasAudio: true
  },
  {
    name: 'ka',
    pronunciation: 'kah', 
    description: 'Sharp rim strike',
    technique: 'Strike the rim with wrist motion',
    hasAudio: true
  },
  {
    name: 'doko',
    pronunciation: 'doh-koh',
    description: 'Compound don-ka pattern',
    technique: 'Combine center and rim strikes in sequence',
    hasAudio: true
  },
  {
    name: 'tsu',
    pronunciation: 'tsoo',
    description: 'Light quick strike',
    technique: 'Light strike with minimal follow-through',
    hasAudio: true
  }
])

const playAudio = (syllableName: string) => {
  // In a real implementation, this would play actual audio files
  // For now, we'll use Web Audio API or preloaded audio samples
  console.log(`Playing audio for: ${syllableName}`)
  
  // Placeholder implementation - would load and play actual taiko samples
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(syllableName)
    utterance.rate = 0.8
    utterance.pitch = 0.8
    speechSynthesis.speak(utterance)
  }
}
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

.pronunciation-guide {
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #404040;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #404040;
  background: #333333;
}

.guide-header h3 {
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

.guide-content {
  padding: 1rem;
}

.syllable-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.syllable-card {
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.syllable-name {
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 0.5rem;
}

.syllable-pronunciation {
  font-size: 1.1rem;
  color: #cccccc;
  font-style: italic;
  margin-bottom: 0.5rem;
}

.syllable-description {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.syllable-technique {
  color: #999999;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.play-audio-button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.play-audio-button:hover:not(:disabled) {
  background: #45a049;
}

.play-audio-button:disabled {
  background: #666666;
  cursor: not-allowed;
}

.guide-notes {
  background: #252525;
  border-radius: 8px;
  padding: 1rem;
}

.guide-notes h4 {
  color: #ff6b6b;
  margin-bottom: 0.5rem;
}

.guide-notes ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.guide-notes li {
  color: #cccccc;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.guide-notes p {
  color: #cccccc;
  line-height: 1.4;
  margin: 0.5rem 0;
}

.guide-notes strong {
  color: #ff6b6b;
}
</style>