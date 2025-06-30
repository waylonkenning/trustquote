<template>
  <div class="pricing-view">
    <div class="pricing-container">
      <!-- Header -->
      <div class="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Start creating professional taiko compositions today</p>
        
        <!-- Billing Toggle -->
        <div class="billing-toggle">
          <label class="toggle-label">
            <span :class="{ active: !isAnnual }">Monthly</span>
            <input 
              type="checkbox" 
              v-model="isAnnual"
              class="toggle-input"
            >
            <span class="toggle-slider"></span>
            <span :class="{ active: isAnnual }">
              Annual 
              <span class="savings-badge">Save 20%</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Pricing Plans -->
      <div class="pricing-plans">
        <!-- Free Plan -->
        <div class="pricing-plan free-plan" data-testid="free-tier-card">
          <div class="plan-header">
            <h3>Free</h3>
            <div class="plan-price" data-testid="free-tier-price">
              <span class="amount">$0</span>
              <span class="period">forever</span>
            </div>
            <p class="plan-description">Perfect for getting started</p>
          </div>
          
          <div class="plan-features" data-testid="free-tier-features">
            <ul>
              <li class="included">✓ Basic kuchi shōga notation</li>
              <li class="included">✓ Single drum compositions</li>
              <li class="included">✓ Linear grid interface</li>
              <li class="included">✓ Basic audio playback</li>
              <li class="included">✓ Pronunciation guide</li>
              <li class="included">✓ Up to 3 saved compositions</li>
            </ul>
          </div>

          <div class="plan-action">
            <button 
              class="plan-button free-button"
              :disabled="isFree && isLoggedIn"
              @click="selectFreePlan"
            >
              {{ isFree && isLoggedIn ? 'Current Plan' : 'Get Started Free' }}
            </button>
          </div>
        </div>

        <!-- Premium Plan -->
        <div class="pricing-plan premium-plan featured" data-testid="premium-tier-card">
          <div class="popular-badge">Most Popular</div>
          
          <div class="plan-header">
            <h3>Premium</h3>
            <div class="plan-price" data-testid="premium-tier-price">
              <span class="amount">${{ premiumPrice }}</span>
              <span class="period">{{ isAnnual ? '/year' : '/month' }}</span>
            </div>
            <p class="plan-description" v-if="isAnnual">
              ${{ monthlyEquivalent }}/month billed annually
            </p>
            <p class="plan-description" v-else>
              Billed monthly
            </p>
          </div>
          
          <div class="plan-features" data-testid="premium-tier-features">
            <h4>Everything in Free, plus:</h4>
            <ul>
              <li class="included">✓ Unlimited compositions</li>
              <li class="included">✓ Multi-drum ensemble coordination</li>
              <li class="included">✓ Circular rhythm visualization</li>
              <li class="included">✓ Regional style variations (Kanto, Kansai)</li>
              <li class="included">✓ Export to MIDI, audio & sheet music</li>
              <li class="included">✓ Real-time collaboration</li>
              <li class="included">✓ Pattern library access</li>
              <li class="included">✓ AI-powered composition suggestions</li>
              <li class="included">✓ Advanced audio features</li>
              <li class="included">✓ Priority support</li>
            </ul>
          </div>

          <div class="plan-action">
            <button 
              class="plan-button premium-button"
              data-testid="subscribe-premium"
              :disabled="isPremium"
              @click="selectPremiumPlan"
            >
              <span v-if="isPremium">Current Plan</span>
              <span v-else-if="canStartTrial">Start Free Trial</span>
              <span v-else>Upgrade to Premium</span>
            </button>
            
            <p class="trial-note" v-if="canStartTrial && !isPremium">
              14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </div>

      <!-- Feature Comparison -->
      <div class="feature-comparison" data-testid="feature-comparison-table">
        <h2>Detailed Feature Comparison</h2>
        
        <div class="comparison-table">
          <div class="table-header">
            <div class="feature-column">Feature</div>
            <div class="plan-column">Free</div>
            <div class="plan-column">Premium</div>
          </div>
          
          <div 
            v-for="feature in comparisonFeatures" 
            :key="feature.id"
            class="table-row"
          >
            <div class="feature-cell">
              <div class="feature-name">{{ feature.name }}</div>
              <div class="feature-description">{{ feature.description }}</div>
            </div>
            <div class="plan-cell">
              <span v-if="feature.free === true" class="check">✓</span>
              <span v-else-if="feature.free === false" class="cross">×</span>
              <span v-else class="limited">{{ feature.free }}</span>
            </div>
            <div class="plan-cell">
              <span v-if="feature.premium === true" class="check">✓</span>
              <span v-else class="value">{{ feature.premium }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trial CTA -->
      <div class="trial-cta" v-if="!isLoggedIn">
        <div class="cta-content">
          <h2>Start Your Free Trial Today</h2>
          <p>Try all premium features for 14 days. No credit card required.</p>
          <button 
            class="cta-button"
            data-testid="start-free-trial"
            @click="startTrial"
          >
            Start Free Trial
          </button>
        </div>
      </div>

      <!-- FAQ -->
      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div class="faq-grid">
          <div class="faq-item">
            <h3>Can I cancel my subscription anytime?</h3>
            <p>Yes, you can cancel your premium subscription at any time. You'll continue to have premium access until the end of your current billing period, then automatically switch to the free plan.</p>
          </div>
          
          <div class="faq-item">
            <h3>What happens to my compositions if I cancel?</h3>
            <p>Your compositions will remain saved, but if you have more than 3, you'll need to choose which ones to keep active on the free plan. Premium compositions can be exported before canceling.</p>
          </div>
          
          <div class="faq-item">
            <h3>Do you offer student discounts?</h3>
            <p>Yes! Students and educators can get 50% off premium subscriptions. Contact us with your educational email for verification.</p>
          </div>
          
          <div class="faq-item">
            <h3>Can I upgrade or downgrade my plan?</h3>
            <p>Absolutely! You can change your plan at any time from your account settings. Changes take effect immediately, with prorated billing adjustments.</p>
          </div>
          
          <div class="faq-item">
            <h3>Is my payment information secure?</h3>
            <p>Yes, we use Stripe for payment processing, which is PCI DSS compliant and trusted by millions of businesses worldwide. We never store your credit card information.</p>
          </div>
          
          <div class="faq-item">
            <h3>What export formats are supported?</h3>
            <p>Premium users can export compositions to MIDI files, audio (MP3/WAV), sheet music (PDF), and kuchi shōga notation (TXT). Free users can view but not export.</p>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="contact-section">
        <h2>Need Help Choosing?</h2>
        <p>
          Our team is here to help you find the perfect plan for your needs.
          <a href="mailto:sales@taikocomposer.com" class="contact-link">Contact sales</a>
          or 
          <a href="/demo" class="contact-link">schedule a demo</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFreemium } from '@/composables/useFreemium'
import { stripeService } from '@/services/stripeService'

const router = useRouter()
const { 
  isLoggedIn, 
  isPremium, 
  isFree, 
  canStartTrial = computed(() => true) // Mock - would check if trial already used
} = useFreemium()

// State
const isAnnual = ref(false)

// Computed
const monthlyPrice = 9.99
const annualPrice = 99.99
const premiumPrice = computed(() => isAnnual.value ? annualPrice : monthlyPrice)
const monthlyEquivalent = computed(() => (annualPrice / 12).toFixed(2))

const comparisonFeatures = [
  {
    id: 'compositions',
    name: 'Saved Compositions',
    description: 'Number of compositions you can save',
    free: '3',
    premium: 'Unlimited'
  },
  {
    id: 'drums',
    name: 'Drums per Composition',
    description: 'Maximum drum parts in a single piece',
    free: '1',
    premium: 'Unlimited'
  },
  {
    id: 'notation',
    name: 'Kuchi Shōga Notation',
    description: 'Traditional Japanese rhythm syllables',
    free: true,
    premium: true
  },
  {
    id: 'regional-styles',
    name: 'Regional Style Variations',
    description: 'Kanto and Kansai notation styles',
    free: false,
    premium: true
  },
  {
    id: 'linear-grid',
    name: 'Linear Grid Interface',
    description: 'Beat-by-beat pattern editing',
    free: true,
    premium: true
  },
  {
    id: 'circular-viz',
    name: 'Circular Visualization',
    description: 'Polar coordinate rhythm display',
    free: false,
    premium: true
  },
  {
    id: 'audio-playback',
    name: 'Audio Playback',
    description: 'Listen to your compositions',
    free: 'Basic',
    premium: 'Advanced'
  },
  {
    id: 'ensemble-coordination',
    name: 'Ensemble Coordination',
    description: 'Multi-part composition with traditional roles',
    free: false,
    premium: true
  },
  {
    id: 'export',
    name: 'Export Capabilities',
    description: 'MIDI, audio, and sheet music export',
    free: false,
    premium: true
  },
  {
    id: 'collaboration',
    name: 'Real-time Collaboration',
    description: 'Work together on compositions',
    free: false,
    premium: true
  },
  {
    id: 'pattern-library',
    name: 'Pattern Library',
    description: 'Access to traditional tetsuke patterns',
    free: false,
    premium: true
  },
  {
    id: 'ai-suggestions',
    name: 'AI Composition Suggestions',
    description: 'Smart pattern recommendations',
    free: false,
    premium: true
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Help when you need it',
    free: 'Community',
    premium: 'Priority'
  }
]

// Methods
const selectFreePlan = () => {
  if (!isLoggedIn.value) {
    router.push('/signup')
  } else {
    router.push('/compose')
  }
}

const selectPremiumPlan = async () => {
  if (!isLoggedIn.value) {
    router.push('/signup?upgrade=true')
    return
  }

  if (canStartTrial.value) {
    router.push('/checkout?trial=true')
  } else {
    router.push('/checkout?plan=premium' + (isAnnual.value ? '&billing=annual' : ''))
  }
}

const startTrial = () => {
  router.push('/signup?trial=true')
}
</script>

<style scoped>
.pricing-view {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 4rem 2rem;
}

.pricing-container {
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-header {
  text-align: center;
  margin-bottom: 4rem;
}

.pricing-header h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

.pricing-header p {
  font-size: 1.25rem;
  color: #cccccc;
  margin-bottom: 2rem;
}

.billing-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1rem;
  color: #cccccc;
  background: #2a2a2a;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #3a3a3a;
}

.toggle-label span {
  transition: color 0.3s;
}

.toggle-label span.active {
  color: #ffffff;
  font-weight: 600;
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
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.pricing-plans {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 4rem;
}

.pricing-plan {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-plan:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.premium-plan.featured {
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
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.plan-price .amount {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
}

.plan-price .period {
  font-size: 1rem;
  color: #888;
  margin-left: 0.25rem;
}

.plan-description {
  color: #888;
  font-size: 0.875rem;
  margin: 0;
}

.plan-features {
  margin-bottom: 2rem;
}

.plan-features h4 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #cccccc;
  display: flex;
  align-items: center;
}

.plan-features li.included {
  color: #cccccc;
}

.plan-action {
  text-align: center;
}

.plan-button {
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  margin-bottom: 0.5rem;
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

.plan-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trial-note {
  color: #888;
  font-size: 0.75rem;
  margin: 0;
}

.feature-comparison {
  margin-bottom: 4rem;
}

.feature-comparison h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 2rem;
}

.comparison-table {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: #3a3a3a;
  padding: 1rem;
  font-weight: 600;
  color: #ffffff;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #3a3a3a;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.feature-cell {
  color: #ffffff;
}

.feature-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.feature-description {
  font-size: 0.75rem;
  color: #888;
}

.plan-cell {
  text-align: center;
  color: #cccccc;
}

.check {
  color: #10b981;
  font-weight: bold;
  font-size: 1.125rem;
}

.cross {
  color: #888;
  font-size: 1.125rem;
}

.limited,
.value {
  color: #cccccc;
  font-size: 0.875rem;
}

.trial-cta {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 4rem;
}

.cta-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.cta-button {
  background: white;
  color: #6366f1;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.faq-section {
  margin-bottom: 4rem;
}

.faq-section h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 2rem;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.faq-item {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 1.5rem;
}

.faq-item h3 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.faq-item p {
  color: #cccccc;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.contact-section {
  text-align: center;
  padding: 2rem;
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #3a3a3a;
}

.contact-section h2 {
  color: #ffffff;
  margin-bottom: 1rem;
}

.contact-section p {
  color: #cccccc;
  margin: 0;
}

.contact-link {
  color: #6366f1;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .pricing-plans {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .plan-cell {
    text-align: left;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;
  }
  
  .pricing-header h1 {
    font-size: 2rem;
  }
}
</style>