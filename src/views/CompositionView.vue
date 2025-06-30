<template>
  <div class="composition-view">
    <header class="composition-header">
      <h1>Taiko Composer</h1>
      
      <!-- User Account Section -->
      <div class="account-section">
        <div v-if="!isLoggedIn" class="anonymous-user-info">
          <div class="anonymous-status">
            <span class="anonymous-badge">Guest Mode</span>
            <span class="anonymous-note">Sign up to save your work</span>
          </div>
          <div class="auth-buttons">
            <button 
              data-testid="sign-in-button"
              @click="showSignIn = true"
              class="btn-secondary small"
            >
              Sign In
            </button>
            <button 
              data-testid="sign-up-button"
              @click="showSignUp = true"
              class="btn-primary small"
            >
              Sign Up
            </button>
          </div>
        </div>
        
        <div v-else class="user-menu-container">
          <!-- Usage Indicator -->
          <div v-if="isFree" class="usage-indicator" data-testid="composition-usage">
            <span class="usage-text">{{ usage.compositionsUsed }} / {{ usage.compositionsLimit }} compositions</span>
            <div class="usage-bar" data-testid="composition-usage-bar">
              <div 
                class="usage-progress"
                :style="{ width: `${usage.compositionsPercentage}%` }"
                :class="{
                  'warning': usage.isApproachingLimit,
                  'danger': usage.hasReachedLimit
                }"
              ></div>
            </div>
          </div>
          
          <!-- Premium Status Indicator -->
          <div v-if="isPremium" class="premium-indicator" data-testid="premium-status-indicator">
            <span class="premium-badge">Premium</span>
          </div>
          
          <div v-if="isTrialing" class="trial-indicator" data-testid="trial-status-indicator">
            <span class="trial-badge">Free Trial</span>
          </div>
          
          <!-- User Menu -->
          <div class="user-menu" data-testid="user-menu">
            <div class="user-avatar" data-testid="user-avatar">
              {{ currentUser?.name?.[0]?.toUpperCase() || 'U' }}
            </div>
            <span class="user-name" data-testid="user-name">{{ currentUser?.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="composition-actions">
        <button 
          data-testid="create-composition"
          @click="handleCreateComposition"
          class="btn-primary"
          :disabled="isLoggedIn && !canCreateComposition && isFree"
        >
          {{ currentComposition ? 'New Composition' : 'Create Composition' }}
        </button>
        
        <button 
          v-if="currentComposition && !isLoggedIn"
          data-testid="save-composition"
          @click="promptToSave"
          class="btn-primary save-prompt"
        >
          💾 Save Your Work
        </button>
        
        <button 
          v-if="currentComposition && isLoggedIn"
          data-testid="save-composition"
          @click="saveComposition"
          class="btn-secondary"
        >
          Save
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

    <!-- Composition Limit Warning -->
    <div v-if="showCompositionLimit" class="modal-overlay" data-testid="composition-limit-warning" @click="showCompositionLimit = false">
      <div class="modal limit-warning" @click.stop>
        <h2>Composition Limit Reached</h2>
        <p>You have reached the limit of {{ limits.maxCompositions }} compositions for free users.</p>
        
        <div class="upgrade-suggestion" data-testid="upgrade-suggestion">
          <h3>Upgrade to Premium for:</h3>
          <ul>
            <li>✓ Unlimited compositions</li>
            <li>✓ Multi-drum ensemble coordination</li>
            <li>✓ Advanced features and export options</li>
          </ul>
        </div>
        
        <div class="modal-actions">
          <button 
            data-testid="upgrade-to-premium"
            @click="handleUpgradeFromLimit"
            class="btn-primary"
          >
            Upgrade to Premium
          </button>
          <button @click="showCompositionLimit = false" class="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Create Composition Dialog -->
    <div v-if="showCreateDialog" class="modal-overlay" @click="showCreateDialog = false">
      <div class="modal" @click.stop>
        <h2>{{ currentComposition ? 'Create New Composition' : 'Create Your First Composition' }}</h2>
        <div class="form-group">
          <label for="composition-title">Title</label>
          <input 
            id="composition-title"
            data-testid="composition-title"
            v-model="newCompositionTitle"
            placeholder="My Taiko Piece"
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
              :disabled="!canUseEnsemble"
            />
            Enable Ensemble Mode
            <span v-if="!canUseEnsemble" class="premium-badge-inline">Premium</span>
            <span class="checkbox-description">
              Advanced coordination for multiple drum parts with role management
            </span>
          </label>
        </div>
        
        <div v-if="!isLoggedIn" class="guest-mode-notice">
          <p>🎯 <strong>Guest Mode:</strong> Your composition will be saved locally. Sign up to save permanently and access all features!</p>
        </div>
        
        <div class="modal-actions">
          <button 
            data-testid="confirm-create"
            @click="createComposition"
            class="btn-primary"
          >
            {{ isLoggedIn ? 'Create' : 'Start Composing' }}
          </button>
          <button @click="closeCreateDialog" class="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Save Prompt Modal for Anonymous Users -->
    <div v-if="showSavePrompt" class="modal-overlay" data-testid="save-prompt-modal" @click="showSavePrompt = false">
      <div class="modal save-prompt-modal" @click.stop>
        <div class="save-prompt-header">
          <h2>💾 Save Your Composition</h2>
          <p>Don't lose your creative work! Sign up to save permanently.</p>
        </div>
        
        <div class="composition-preview">
          <h3>{{ currentComposition?.title || 'Untitled Composition' }}</h3>
          <div class="composition-stats">
            <span>{{ compositionStats.patterns }} patterns</span>
            <span>{{ compositionStats.duration }} duration</span>
            <span>{{ currentComposition?.tempo || 120 }} BPM</span>
          </div>
        </div>
        
        <div class="save-options">
          <div class="save-option primary-option">
            <h4>🚀 Sign Up & Save Forever</h4>
            <p>Keep your compositions safe and access premium features</p>
            <button 
              data-testid="signup-and-save"
              @click="signUpAndSave"
              class="btn-primary"
            >
              Sign Up & Save
            </button>
          </div>
          
          <div class="save-option">
            <h4>📥 Download for Now</h4>
            <p>Save locally (you'll need to re-import later)</p>
            <button 
              data-testid="download-composition"
              @click="downloadComposition"
              class="btn-secondary"
            >
              Download JSON
            </button>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showSavePrompt = false" class="btn-tertiary">
            Continue Without Saving
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Dialog -->
    <NotationSettings 
      v-if="showSettings"
      @close="showSettings = false"
    />

    <!-- Premium Gate -->
    <PremiumGate
      v-if="showPremiumGate"
      :feature-id="currentGateFeature"
      :context="gateContext"
      @close="closePremiumGate"
      @upgrade="handleUpgrade"
    />

    <!-- Authentication Modals -->
    <LoginModal 
      v-if="showSignIn" 
      @close="showSignIn = false"
      @showSignup="showSignIn = false; showSignUp = true"
      @loginSuccess="handleAuthSuccess"
    />
    
    <SignupModal 
      v-if="showSignUp" 
      @close="showSignUp = false"
      @showLogin="showSignUp = false; showSignIn = true"
      @registrationSuccess="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import KuchiShogaEditor from '@/components/KuchiShogaEditor.vue'
import NotationSettings from '@/components/NotationSettings.vue'
import PremiumGate from '@/components/PremiumGate.vue'
import LoginModal from '@/components/LoginModal.vue'
import SignupModal from '@/components/SignupModal.vue'
import { useFreemium } from '@/composables/useFreemium'
import type { Composition } from '@/types/composition'

const router = useRouter()

// Freemium composable
const {
  isLoggedIn,
  isPremium,
  isTrialing,
  isFree,
  currentUser,
  usage,
  limits,
  canCreateComposition,
  canAccessFeature,
  checkCompositionLimit,
  incrementCompositionCount,
  showPremiumGate,
  currentGateFeature,
  gateContext,
  closePremiumGate
} = useFreemium()

// Component state
const showCreateDialog = ref(false)
const showSettings = ref(false)
const showCompositionLimit = ref(false)
const showSignIn = ref(false)
const showSignUp = ref(false)
const showSavePrompt = ref(false)
const newCompositionTitle = ref('')
const newCompositionTempo = ref(120)
const enableEnsembleMode = ref(false)
const currentComposition = ref<Composition | null>(null)

// Debug logging
watchEffect(() => {
  console.log('CompositionView state:', {
    isLoggedIn: isLoggedIn.value,
    currentUser: currentUser.value,
    hasAuthToken: !!localStorage.getItem('auth_token'),
    hasUserData: !!localStorage.getItem('user_data')
  })
})

// Computed properties
const canUseEnsemble = computed(() => canAccessFeature('ensemble-coordination'))

const compositionStats = computed(() => {
  if (!currentComposition.value) return { patterns: 0, duration: '0s' }
  
  const patternCount = currentComposition.value.parts.reduce((count, part) => 
    count + (part.patterns?.length || 0), 0
  )
  
  // Rough duration calculation based on tempo and pattern length
  const avgPatternLength = 8 // assume 8 beats per pattern
  const beatsPerSecond = (currentComposition.value.tempo || 120) / 60
  const durationSeconds = Math.round((patternCount * avgPatternLength) / beatsPerSecond)
  
  return {
    patterns: patternCount,
    duration: durationSeconds > 60 
      ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`
      : `${durationSeconds}s`
  }
})

// Methods
const handleCreateComposition = () => {
  // Anonymous users can always create (stored locally)
  if (!isLoggedIn.value) {
    showCreateDialog.value = true
    return
  }
  
  // Logged in users need to check limits
  if (checkCompositionLimit()) {
    showCreateDialog.value = true
  } else {
    showCompositionLimit.value = true
  }
}

const createComposition = () => {
  // For logged in users, check limits
  if (isLoggedIn.value && !checkCompositionLimit()) {
    showCreateDialog.value = false
    showCompositionLimit.value = true
    return
  }

  currentComposition.value = {
    id: Date.now().toString(),
    title: newCompositionTitle.value || 'My Taiko Piece',
    parts: [],
    tempo: newCompositionTempo.value || 120,
    createdAt: new Date(),
    isEnsemble: enableEnsembleMode.value,
    userId: currentUser.value?.id,
    isPremiumFeature: enableEnsembleMode.value && !canUseEnsemble.value,
    isAnonymous: !isLoggedIn.value
  }
  
  // Save to localStorage for anonymous users
  if (!isLoggedIn.value) {
    saveToLocalStorage()
  } else {
    // Increment composition count for usage tracking (logged in users only)
    incrementCompositionCount()
  }
  
  closeCreateDialog()
}

const closeCreateDialog = () => {
  newCompositionTitle.value = ''
  newCompositionTempo.value = 120
  enableEnsembleMode.value = false
  showCreateDialog.value = false
}

const handleUpgradeFromLimit = () => {
  showCompositionLimit.value = false
  router.push('/pricing')
}

const handleUpgrade = () => {
  router.push('/pricing')
}

// Anonymous user methods
const promptToSave = () => {
  showSavePrompt.value = true
}

const signUpAndSave = () => {
  // Store composition data for after signup
  if (currentComposition.value) {
    localStorage.setItem('pending_composition', JSON.stringify(currentComposition.value))
  }
  showSavePrompt.value = false
  router.push('/signup?save=true')
}

const downloadComposition = () => {
  if (!currentComposition.value) return
  
  const dataStr = JSON.stringify(currentComposition.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${currentComposition.value.title}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
  showSavePrompt.value = false
}

const saveComposition = () => {
  if (!currentComposition.value || !isLoggedIn.value) return
  
  // Save to backend (implementation depends on your backend)
  console.log('Saving composition:', currentComposition.value)
  // TODO: Implement actual save to backend
}

const saveToLocalStorage = () => {
  if (!currentComposition.value) return
  
  const existingCompositions = JSON.parse(localStorage.getItem('anonymous_compositions') || '[]')
  const updatedCompositions = [currentComposition.value, ...existingCompositions.slice(0, 4)] // Keep max 5
  localStorage.setItem('anonymous_compositions', JSON.stringify(updatedCompositions))
}

const updatePattern = (partId: string, pattern: string) => {
  if (currentComposition.value) {
    const part = currentComposition.value.parts.find(p => p.id === partId)
    if (part) {
      part.pattern = pattern
    }
    
    // Auto-save for anonymous users
    if (!isLoggedIn.value) {
      saveToLocalStorage()
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
    
    // Auto-save for anonymous users
    if (!isLoggedIn.value) {
      saveToLocalStorage()
    }
  }
}

const handleAuthSuccess = (user: any) => {
  showSignIn.value = false
  showSignUp.value = false
  
  // Check if there's a pending composition to save
  const pendingComposition = localStorage.getItem('pending_composition')
  if (pendingComposition) {
    try {
      const composition = JSON.parse(pendingComposition)
      composition.userId = user.id
      composition.isAnonymous = false
      currentComposition.value = composition
      
      // Save to backend and remove from localStorage
      saveComposition()
      localStorage.removeItem('pending_composition')
    } catch (error) {
      console.error('Failed to restore pending composition:', error)
    }
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
  gap: 2rem;
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

/* Freemium Features */
.account-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.user-menu-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.usage-indicator {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.usage-text {
  font-size: 0.75rem;
  color: #cccccc;
  white-space: nowrap;
}

.usage-bar {
  width: 80px;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  overflow: hidden;
}

.usage-progress {
  height: 100%;
  background: #6366f1;
  transition: width 0.3s ease;
}

.usage-progress.warning {
  background: #f59e0b;
}

.usage-progress.danger {
  background: #ef4444;
}

.premium-indicator,
.trial-indicator {
  display: flex;
  align-items: center;
}

.premium-badge {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trial-badge {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-menu:hover {
  background: #404040;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  color: #ffffff;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.premium-badge-inline {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 0.5rem;
}

.limit-warning {
  border: 2px solid #f59e0b;
}

.limit-warning h2 {
  color: #f59e0b;
}

.upgrade-suggestion {
  background: #1f1f1f;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.upgrade-suggestion h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.upgrade-suggestion ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.upgrade-suggestion li {
  color: #10b981;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .composition-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .account-section {
    order: -1;
    width: 100%;
  }
  
  .user-menu-container {
    justify-content: space-between;
    width: 100%;
  }
  
  .usage-indicator {
    align-items: flex-start;
  }
  
  .user-name {
    max-width: none;
  }
}

/* Anonymous User Styles */
.anonymous-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.anonymous-status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.anonymous-badge {
  background: #374151;
  color: #d1d5db;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.anonymous-note {
  font-size: 0.75rem;
  color: #9ca3af;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary.small,
.btn-primary.small {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.save-prompt {
  animation: pulse 2s infinite;
  background: linear-gradient(135deg, #10b981, #059669) !important;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Guest Mode Notice */
.guest-mode-notice {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.guest-mode-notice p {
  color: #92400e;
  margin: 0;
  font-size: 0.875rem;
}

/* Save Prompt Modal */
.save-prompt-modal {
  max-width: 500px;
  width: 90%;
}

.save-prompt-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.save-prompt-header h2 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.save-prompt-header p {
  color: #9ca3af;
  margin: 0;
}

.composition-preview {
  background: #1f2937;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.composition-preview h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}

.composition-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.composition-stats span {
  color: #6b7280;
  font-size: 0.875rem;
  background: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.save-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.save-option {
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.save-option.primary-option {
  border-color: #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
}

.save-option h4 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.save-option p {
  color: #9ca3af;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.btn-tertiary {
  background: transparent;
  color: #6b7280;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-tertiary:hover {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .anonymous-user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .save-prompt-modal {
    margin: 1rem;
    max-width: none;
  }
  
  .composition-stats {
    gap: 0.5rem;
  }
  
  .save-options {
    gap: 0.75rem;
  }
}
</style>