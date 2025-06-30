<template>
  <div 
    v-if="showGate" 
    class="premium-gate-overlay"
    data-testid="premium-feature-gate"
    @click="closeModal"
  >
    <div class="premium-gate-modal" @click.stop>
      <div class="modal-header">
        <h2>{{ feature?.name || 'Premium Feature' }}</h2>
        <button 
          class="close-button"
          data-testid="close-modal"
          @click="closeModal"
        >
          ×
        </button>
      </div>

      <div class="modal-content">
        <div class="feature-icon">
          <component :is="featureIcon" />
        </div>

        <p class="feature-description">
          {{ feature?.description || `${featureName} is a premium feature` }}
        </p>

        <div class="premium-benefits">
          <h3>Premium includes:</h3>
          <ul>
            <li v-for="benefit in premiumBenefits" :key="benefit.id">
              <span class="benefit-icon">✓</span>
              {{ benefit.name }}
            </li>
          </ul>
        </div>

        <div class="pricing-summary">
          <div class="price-badge">
            <span class="currency">$</span>
            <span class="amount">9.99</span>
            <span class="period">/month</span>
          </div>
          <p class="trial-offer">Start with a 14-day free trial</p>
        </div>
      </div>

      <div class="modal-actions">
        <button 
          class="upgrade-button"
          data-testid="upgrade-to-premium"
          @click="handleUpgrade"
        >
          <span v-if="!isLoggedIn">Sign Up & Start Free Trial</span>
          <span v-else-if="canStartTrial">Start Free Trial</span>
          <span v-else>Upgrade to Premium</span>
        </button>

        <button 
          class="secondary-button"
          @click="showPricingDetails = true"
        >
          View All Features
        </button>
      </div>

      <div class="usage-indicator" v-if="showUsageStats">
        <div class="usage-stats">
          <div class="stat">
            <span class="stat-label">Compositions</span>
            <span class="stat-value">{{ usage.compositionsUsed }} / {{ usage.compositionsLimit }}</span>
            <div class="usage-bar">
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
        </div>
        <p class="upgrade-suggestion" v-if="usage.isApproachingLimit">
          You're approaching your free tier limit. Upgrade for unlimited access.
        </p>
      </div>
    </div>

    <!-- Pricing Details Modal -->
    <PricingModal 
      v-if="showPricingDetails"
      @close="showPricingDetails = false"
      @upgrade="handleUpgrade"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { subscriptionService } from '@/services/subscriptionService'
import { PREMIUM_FEATURES } from '@/types/subscription'
import PricingModal from './PricingModal.vue'

interface Props {
  featureId: string
  featureName?: string
  context?: Record<string, any>
  showUsageStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showUsageStats: true
})

const emit = defineEmits<{
  close: []
  upgrade: [featureId: string]
}>()

const showGate = ref(true)
const showPricingDetails = ref(false)

// Computed properties
const isLoggedIn = computed(() => subscriptionService.isLoggedIn)
const usage = computed(() => subscriptionService.usage)
const canStartTrial = computed(() => {
  const subscription = subscriptionService.subscription
  return !subscription.value?.trialEnd && subscription.value?.status !== 'trialing'
})

const feature = computed(() => 
  PREMIUM_FEATURES.find(f => f.id === props.featureId)
)

const featureIcon = computed(() => {
  // Return appropriate icon component based on feature category
  const iconMap: Record<string, string> = {
    'composition': 'CompositionIcon',
    'audio': 'AudioIcon', 
    'export': 'ExportIcon',
    'collaboration': 'CollaborationIcon'
  }
  return iconMap[feature.value?.category || 'composition'] || 'CompositionIcon'
})

const premiumBenefits = computed(() => 
  PREMIUM_FEATURES.filter(f => f.isPremium).slice(0, 6) // Show top 6 benefits
)

// Methods
const closeModal = () => {
  showGate.value = false
  emit('close')
}

const handleUpgrade = () => {
  emit('upgrade', props.featureId)
  
  if (!isLoggedIn.value) {
    // Redirect to sign up
    window.location.href = '/signup?upgrade=true&feature=' + props.featureId
  } else if (canStartTrial.value) {
    // Start free trial
    startFreeTrial()
  } else {
    // Redirect to checkout
    window.location.href = '/checkout?plan=premium'
  }
}

const startFreeTrial = async () => {
  try {
    await subscriptionService.startFreeTrial()
    closeModal()
  } catch (error) {
    console.error('Failed to start trial:', error)
  }
}

// Track premium gate event on mount
onMounted(() => {
  subscriptionService.triggerPremiumGate(props.featureId, props.context)
})

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.premium-gate-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.premium-gate-modal {
  background: #2a2a2a;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #3a3a3a;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #3a3a3a;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.close-button:hover {
  color: #ffffff;
  background: #3a3a3a;
}

.modal-content {
  padding: 0 24px;
}

.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-icon svg {
  width: 48px;
  height: 48px;
  color: #6366f1;
}

.feature-description {
  text-align: center;
  font-size: 16px;
  color: #cccccc;
  margin-bottom: 24px;
  line-height: 1.5;
}

.premium-benefits {
  margin-bottom: 24px;
}

.premium-benefits h3 {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.premium-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.premium-benefits li {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #cccccc;
}

.benefit-icon {
  color: #10b981;
  font-weight: bold;
  margin-right: 12px;
  width: 16px;
}

.pricing-summary {
  text-align: center;
  padding: 20px;
  background: #1f1f1f;
  border-radius: 8px;
  margin-bottom: 24px;
}

.price-badge {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 8px;
}

.currency {
  font-size: 20px;
  color: #888;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 4px;
}

.period {
  font-size: 16px;
  color: #888;
}

.trial-offer {
  font-size: 14px;
  color: #10b981;
  margin: 0;
}

.modal-actions {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upgrade-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.upgrade-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.secondary-button {
  background: transparent;
  color: #cccccc;
  border: 1px solid #3a3a3a;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.secondary-button:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.usage-indicator {
  margin-top: 16px;
  padding: 16px 24px;
  background: #1f1f1f;
  border-top: 1px solid #3a3a3a;
}

.usage-stats {
  margin-bottom: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
}

.usage-bar {
  height: 4px;
  background: #3a3a3a;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
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

.upgrade-suggestion {
  font-size: 12px;
  color: #f59e0b;
  margin: 0;
  text-align: center;
}

/* Data test ids for easier e2e testing */
[data-testid="premium-feature-gate"] {
  /* Styling handled above */
}

[data-testid="upgrade-to-premium"] {
  /* Styling handled above */
}

[data-testid="close-modal"] {
  /* Styling handled above */
}
</style>