<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="color-scheme-modal" @click.stop>
      <div class="modal-header">
        <h3>Color Scheme Settings</h3>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>
      
      <div class="modal-content">
        <div class="scheme-grid">
          <div 
            v-for="scheme in colorSchemes"
            :key="scheme.id"
            :data-testid="`${scheme.id}-scheme`"
            class="scheme-option"
            :class="{ active: selectedScheme === scheme.id }"
            @click="selectScheme(scheme.id)"
          >
            <div class="scheme-preview">
              <div 
                v-for="color in scheme.colors"
                :key="color"
                class="color-swatch"
                :style="{ backgroundColor: color }"
              ></div>
            </div>
            <div class="scheme-info">
              <h4>{{ scheme.name }}</h4>
              <p>{{ scheme.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="accessibility-note">
          <h4>Accessibility Features</h4>
          <ul>
            <li><strong>High Contrast:</strong> Enhanced visibility for low vision users</li>
            <li><strong>Colorblind Friendly:</strong> Uses colors distinguishable by all types of color vision</li>
            <li><strong>Monochrome:</strong> Relies on patterns and shapes rather than color</li>
          </ul>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="applyScheme" class="btn-primary">
          Apply
        </button>
        <button @click="$emit('close')" class="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  close: []
  'scheme-changed': [scheme: string]
}>()

const selectedScheme = ref('default')

const colorSchemes = [
  {
    id: 'default',
    name: 'Default',
    description: 'Standard color palette with good contrast',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d']
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum contrast for better visibility',
    colors: ['#000000', '#ffffff', '#ffff00', '#ff0000']
  },
  {
    id: 'colorblind-friendly',
    name: 'Colorblind Friendly',
    description: 'Colors that work for all types of color vision',
    colors: ['#0173b2', '#de8f05', '#029e73', '#cc78bc']
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Grayscale palette focusing on patterns',
    colors: ['#000000', '#333333', '#666666', '#999999']
  }
]

const selectScheme = (schemeId: string) => {
  selectedScheme.value = schemeId
}

const applyScheme = () => {
  emit('scheme-changed', selectedScheme.value)
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

.color-scheme-modal {
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #404040;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  min-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #404040;
  background: #333333;
}

.modal-header h3 {
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

.modal-content {
  padding: 1rem;
}

.scheme-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.scheme-option {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #404040;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scheme-option:hover {
  border-color: #666666;
  background: #252525;
}

.scheme-option.active {
  border-color: #ff6b6b;
  background: #2a2020;
}

.scheme-preview {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #666;
}

.scheme-info {
  flex: 1;
}

.scheme-info h4 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.scheme-info p {
  color: #cccccc;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.accessibility-note {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #404040;
}

.accessibility-note h4 {
  color: #ff6b6b;
  margin: 0 0 0.5rem 0;
}

.accessibility-note ul {
  color: #cccccc;
  margin: 0;
  padding-left: 1.5rem;
}

.accessibility-note li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.accessibility-note strong {
  color: #ffffff;
}

.modal-footer {
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