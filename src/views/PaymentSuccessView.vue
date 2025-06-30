<template>
  <div class="payment-success-view">
    <div class="success-container">
      <div class="success-content">
        <!-- Success Icon -->
        <div class="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#10b981" stroke-width="2" fill="none"/>
            <path d="m9 12 2 2 4-4" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- Success Message -->
        <div class="success-message" data-testid="payment-success-message">
          <h1 v-if="isTrialActivation">Welcome to Your Free Trial!</h1>
          <h1 v-else>Payment Successful!</h1>
          
          <p v-if="isTrialActivation" class="success-description">
            Your 14-day free trial has been activated. Enjoy unlimited access to all premium features.
          </p>
          <p v-else class="success-description">
            Thank you for subscribing to Taiko Composer Premium. Your account has been upgraded successfully.
          </p>
        </div>

        <!-- Subscription Details -->
        <div class="subscription-confirmation" data-testid="subscription-confirmation">
          <h2>Subscription Details</h2>
          
          <div class="confirmation-details">
            <div class="detail-row">
              <span class="detail-label">Plan:</span>
              <span class="detail-value">Premium</span>
            </div>
            
            <div class="detail-row" v-if="isTrialActivation">
              <span class="detail-label">Trial Period:</span>
              <span class="detail-value">14 days</span>
            </div>
            
            <div class="detail-row" v-if="isTrialActivation">
              <span class="detail-label">Trial Ends:</span>
              <span class="detail-value">{{ trialEndDate }}</span>
            </div>
            
            <div class="detail-row" v-if="!isTrialActivation">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">$9.99/month</span>
            </div>
            
            <div class="detail-row" v-if="!isTrialActivation">
              <span class="detail-label">Next Billing:</span>
              <span class="detail-value">{{ nextBillingDate }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ currentUser?.email }}</span>
            </div>
          </div>
        </div>

        <!-- Premium Features Unlocked -->
        <div class="features-unlocked">
          <h3>🎉 Premium Features Unlocked</h3>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🥁</div>
              <div class="feature-name">Unlimited Compositions</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🎼</div>
              <div class="feature-name">Multi-drum Ensemble</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">⭕</div>
              <div class="feature-name">Circular Visualization</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🌍</div>
              <div class="feature-name">Regional Styles</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">📤</div>
              <div class="feature-name">Export Capabilities</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <div class="feature-name">Real-time Collaboration</div>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3>What's Next?</h3>
          
          <div class="steps-list">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Start Composing</h4>
                <p>Create your first multi-drum ensemble composition</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Explore Features</h4>
                <p>Try circular visualization and regional notation styles</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Export & Share</h4>
                <p>Export your compositions to MIDI, audio, or sheet music</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            class="primary-button"
            data-testid="continue-to-app"
            @click="continueToApp"
          >
            Start Creating Music
          </button>
          
          <button 
            class="secondary-button"
            @click="goToAccount"
          >
            Manage Subscription
          </button>
        </div>

        <!-- Trial Reminder -->
        <div v-if="isTrialActivation" class="trial-reminder">
          <p>
            <strong>Reminder:</strong> Your trial will automatically convert to a paid subscription on {{ trialEndDate }}. 
            You can cancel anytime from your account settings.
          </p>
        </div>

        <!-- Support -->
        <div class="support-section">
          <p>
            Need help getting started? 
            <a href="/help" class="support-link">Visit our help center</a> 
            or 
            <a href="mailto:support@taikocomposer.com" class="support-link">contact support</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFreemium } from '@/composables/useFreemium'

const router = useRouter()
const route = useRoute()
const { currentUser, isPremium, isTrialing } = useFreemium()

// Computed properties
const isTrialActivation = computed(() => route.query.type === 'trial' || isTrialing.value)

const trialEndDate = computed(() => {
  if (currentUser.value?.subscription.trialEnd) {
    return currentUser.value.subscription.trialEnd.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const nextBillingDate = computed(() => {
  if (currentUser.value?.subscription.currentPeriodEnd) {
    return currentUser.value.subscription.currentPeriodEnd.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Methods
const continueToApp = () => {
  router.push('/compose')
}

const goToAccount = () => {
  router.push('/account')
}

// Track conversion event
onMounted(() => {
  // Track successful subscription/trial start
  console.log('Subscription successful:', {
    type: isTrialActivation.value ? 'trial' : 'subscription',
    userId: currentUser.value?.id,
    timestamp: new Date()
  })

  // Send analytics event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: route.query.session || 'trial_' + Date.now(),
      value: isTrialActivation.value ? 0 : 9.99,
      currency: 'USD',
      items: [{
        item_id: 'premium_subscription',
        item_name: 'Premium Subscription',
        category: 'subscription',
        quantity: 1,
        price: 9.99
      }]
    })
  }
})
</script>

<style scoped>
.payment-success-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.success-container {
  max-width: 600px;
  width: 100%;
}

.success-content {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.success-icon {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.success-message h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

.success-description {
  font-size: 1.125rem;
  color: #cccccc;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.subscription-confirmation {
  background: #1f1f1f;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.subscription-confirmation h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
  text-align: center;
}

.confirmation-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #888;
  font-size: 0.875rem;
}

.detail-value {
  color: #ffffff;
  font-weight: 500;
}

.features-unlocked {
  margin-bottom: 2rem;
}

.features-unlocked h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: #1f1f1f;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feature-name {
  color: #cccccc;
  font-size: 0.875rem;
  font-weight: 500;
}

.next-steps {
  margin-bottom: 2rem;
  text-align: left;
}

.next-steps h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1.5rem;
  text-align: center;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #1f1f1f;
  border-radius: 8px;
  padding: 1rem;
}

.step-number {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-content h4 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.step-content p {
  color: #cccccc;
  font-size: 0.875rem;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.primary-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.secondary-button {
  background: transparent;
  color: #cccccc;
  border: 1px solid #3a3a3a;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.trial-reminder {
  background: #1f2937;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.trial-reminder p {
  color: #10b981;
  font-size: 0.875rem;
  margin: 0;
}

.support-section {
  border-top: 1px solid #3a3a3a;
  padding-top: 1.5rem;
}

.support-section p {
  color: #888;
  font-size: 0.875rem;
  margin: 0;
}

.support-link {
  color: #6366f1;
  text-decoration: none;
}

.support-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .success-content {
    padding: 2rem 1.5rem;
  }
  
  .success-message h1 {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>