<template>
  <div class="pricing-overlay" data-testid="pricing-modal" @click="closeModal">
    <div class="pricing-modal" @click.stop>
      <div class="modal-header">
        <h2>Choose Your Plan</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="pricing-content">
        <div class="billing-toggle">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="isAnnual"
              class="toggle-input"
            >
            <span class="toggle-slider"></span>
            <span class="toggle-text">
              Annual billing 
              <span class="savings-badge">Save 20%</span>
            </span>
          </label>
        </div>

        <div class="pricing-tiers">
          <!-- Free Tier -->
          <div class="pricing-tier free-tier" data-testid="free-tier-card">
            <div class="tier-header">
              <h3>Free</h3>
              <div class="tier-price" data-testid="free-tier-price">
                <span class="amount">$0</span>
                <span class="period">forever</span>
              </div>
            </div>
            
            <div class="tier-features" data-testid="free-tier-features">
              <h4>Perfect for getting started</h4>
              <ul>
                <li>✓ Basic kuchi shōga notation</li>
                <li>✓ Single drum compositions</li>
                <li>✓ Linear grid interface</li>
                <li>✓ Basic audio playback</li>
                <li>✓ Pronunciation guide</li>
                <li>✓ Up to 3 saved compositions</li>
              </ul>
            </div>

            <button 
              class="tier-button free-button"
              :disabled="currentPlan === 'free'"
            >
              {{ currentPlan === 'free' ? 'Current Plan' : 'Get Started' }}
            </button>
          </div>

          <!-- Premium Tier -->
          <div class="pricing-tier premium-tier featured" data-testid="premium-tier-card">
            <div class="popular-badge">Most Popular</div>
            
            <div class="tier-header">
              <h3>Premium</h3>
              <div class="tier-price" data-testid="premium-tier-price">
                <span class="amount">${{ premiumPrice }}</span>
                <span class="period">{{ isAnnual ? '/year' : '/month' }}</span>
              </div>
              <p class="price-note" v-if="isAnnual">
                ${{ monthlyPrice }}/month billed annually
              </p>
            </div>
            
            <div class="tier-features" data-testid="premium-tier-features">
              <h4>Everything in Free, plus:</h4>
              <ul>
                <li v-for="feature in premiumFeatures" :key="feature.id">
                  ✓ {{ feature.name }}
                </li>
              </ul>
            </div>

            <button 
              class="tier-button premium-button"
              data-testid="subscribe-premium"
              :disabled="currentPlan === 'premium'"
              @click="handleUpgrade"
            >
              <span v-if="currentPlan === 'premium'">Current Plan</span>
              <span v-else-if="canStartTrial">Start Free Trial</span>
              <span v-else>Upgrade Now</span>
            </button>

            <p class="trial-note" v-if="canStartTrial">
              14-day free trial • Cancel anytime
            </p>
          </div>
        </div>

        <!-- Feature Comparison Table -->
        <div class="feature-comparison" data-testid="feature-comparison-table">
          <h3>Feature Comparison</h3>
          
          <div class="comparison-table">
            <div class="table-header">
              <div class="feature-column">Feature</div>
              <div class="plan-column">Free</div>
              <div class="plan-column">Premium</div>
            </div>
            
            <div 
              v-for="feature in allFeatures" 
              :key="feature.id"
              class="table-row"
            >
              <div class="feature-name">
                {{ feature.name }}
                <span class="feature-description">{{ feature.description }}</span>
              </div>
              <div class="plan-feature">
                <span v-if="!feature.isPremium" class="check">✓</span>
                <span v-else class="cross">×</span>
              </div>
              <div class="plan-feature">
                <span class="check">✓</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="faq-section">
          <h3>Frequently Asked Questions</h3>
          
          <div class="faq-item">
            <h4>Can I cancel my subscription anytime?</h4>
            <p>Yes, you can cancel your premium subscription at any time. You'll continue to have premium access until the end of your current billing period.</p>
          </div>
          
          <div class="faq-item">
            <h4>What happens to my compositions if I cancel?</h4>
            <p>Your compositions will remain saved, but you'll be limited to the free tier restrictions (3 compositions maximum).</p>
          </div>
          
          <div class="faq-item">
            <h4>Is there a limit to how many compositions I can create with Premium?</h4>
            <p>No, Premium users can create unlimited compositions with unlimited drum parts.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { subscriptionService } from '@/services/subscriptionService'
import { PREMIUM_FEATURES } from '@/types/subscription'

const emit = defineEmits<{
  close: []
  upgrade: []
}>()

const isAnnual = ref(false)

// Computed properties
const currentPlan = computed(() => subscriptionService.subscription.value?.plan || 'free')
const canStartTrial = computed(() => {
  const subscription = subscriptionService.subscription
  return !subscription.value?.trialEnd && subscription.value?.status !== 'trialing'
})

const monthlyPrice = 9.99
const annualPrice = 99.99 // 20% savings
const premiumPrice = computed(() => isAnnual.value ? annualPrice : monthlyPrice)

const premiumFeatures = computed(() => 
  PREMIUM_FEATURES.filter(f => f.isPremium)
)

const allFeatures = computed(() => [
  { id: 'basic-notation', name: 'Basic Kuchi Shōga Notation', description: 'Don, ka, doko, tsu syllables', isPremium: false },
  { id: 'linear-grid', name: 'Linear Grid Interface', description: 'Beat-by-beat pattern editing', isPremium: false },
  { id: 'basic-audio', name: 'Basic Audio Playback', description: 'Simple pattern playback', isPremium: false },
  { id: 'pronunciation-guide', name: 'Pronunciation Guide', description: 'Interactive syllable reference', isPremium: false },
  { id: 'composition-limit', name: 'Saved Compositions', description: 'Up to 3 vs unlimited', isPremium: false },
  ...PREMIUM_FEATURES
])

// Methods
const closeModal = () => {
  emit('close')
}

const handleUpgrade = () => {
  emit('upgrade')
  closeModal()
}

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
.pricing-overlay {
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
  z-index: 1001;
  padding: 20px;
}

.pricing-modal {
  background: #2a2a2a;
  border-radius: 12px;
  max-width: 900px;
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
  padding: 24px;
  border-bottom: 1px solid #3a3a3a;
}

.modal-header h2 {
  font-size: 28px;
  font-weight: 700;
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

.pricing-content {
  padding: 24px;
}

.billing-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 16px;
  color: #cccccc;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  width: 48px;
  height: 24px;
  background: #3a3a3a;
  border-radius: 12px;
  position: relative;
  transition: background-color 0.3s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-slider {
  background: #6366f1;
}

.toggle-input:checked + .toggle-slider::after {
  transform: translateX(24px);
}

.savings-badge {
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.pricing-tiers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

.pricing-tier {
  background: #1f1f1f;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 32px 24px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-tier:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.premium-tier.featured {
  border-color: #6366f1;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tier-header {
  text-align: center;
  margin-bottom: 24px;
}

.tier-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.tier-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 4px;
}

.tier-price .amount {
  font-size: 42px;
  font-weight: 800;
  color: #ffffff;
}

.tier-price .period {
  font-size: 16px;
  color: #888;
  margin-left: 4px;
}

.price-note {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.tier-features {
  margin-bottom: 32px;
}

.tier-features h4 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  text-align: center;
}

.tier-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tier-features li {
  padding: 8px 0;
  font-size: 14px;
  color: #cccccc;
  line-height: 1.4;
}

.tier-button {
  width: 100%;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.free-button {
  background: transparent;
  color: #cccccc;
  border: 1px solid #3a3a3a;
}

.free-button:hover:not(:disabled) {
  background: #3a3a3a;
  color: #ffffff;
}

.premium-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.premium-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.tier-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trial-note {
  text-align: center;
  font-size: 12px;
  color: #888;
  margin-top: 8px;
  margin-bottom: 0;
}

.feature-comparison {
  margin-bottom: 48px;
}

.feature-comparison h3 {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 24px;
  text-align: center;
}

.comparison-table {
  background: #1f1f1f;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: #3a3a3a;
  padding: 16px;
  font-weight: 600;
  color: #ffffff;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 16px;
  border-bottom: 1px solid #3a3a3a;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.feature-name {
  color: #ffffff;
  font-weight: 500;
}

.feature-description {
  display: block;
  font-size: 12px;
  color: #888;
  font-weight: 400;
  margin-top: 4px;
}

.plan-feature {
  text-align: center;
}

.check {
  color: #10b981;
  font-weight: bold;
  font-size: 18px;
}

.cross {
  color: #888;
  font-size: 18px;
}

.faq-section h3 {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 24px;
  text-align: center;
}

.faq-item {
  margin-bottom: 24px;
  padding: 20px;
  background: #1f1f1f;
  border-radius: 8px;
}

.faq-item h4 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.faq-item p {
  font-size: 14px;
  color: #cccccc;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .pricing-tiers {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .plan-feature {
    text-align: left;
  }
}
</style>