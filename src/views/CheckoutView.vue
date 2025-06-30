<template>
  <div class="checkout-view">
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Complete Your Subscription</h1>
        <p>Start your premium taiko composition journey</p>
      </div>

      <div class="checkout-content">
        <!-- Subscription Summary -->
        <div class="subscription-summary" data-testid="subscription-summary">
          <h2>Subscription Summary</h2>
          
          <div class="plan-details">
            <div class="plan-name">Premium Plan</div>
            <div class="plan-features" data-testid="subscription-features">
              <ul>
                <li>✓ Unlimited compositions</li>
                <li>✓ Multi-drum ensemble coordination</li>
                <li>✓ Circular rhythm visualization</li>
                <li>✓ Regional style variations</li>
                <li>✓ Export capabilities</li>
                <li>✓ Real-time collaboration</li>
                <li>✓ Pattern library access</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          </div>

          <div class="pricing-breakdown">
            <div class="price-row">
              <span>Premium Plan (Monthly)</span>
              <span data-testid="subtotal">$9.99</span>
            </div>
            <div class="price-row" v-if="taxAmount > 0">
              <span>Tax</span>
              <span data-testid="tax-amount">${{ taxAmount.toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <span>Total</span>
              <span data-testid="total-amount">${{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <div class="trial-notice" v-if="showTrial">
            <p>14-day free trial • Cancel anytime</p>
            <p>You won't be charged until {{ trialEndDate }}</p>
          </div>
        </div>

        <!-- Checkout Form -->
        <div class="checkout-form" data-testid="checkout-form">
          <form @submit.prevent="handleSubmit">
            <!-- Billing Information -->
            <div class="form-section">
              <h3>Billing Information</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="billing-email">Email Address</label>
                  <input
                    id="billing-email"
                    data-testid="billing-email"
                    type="email"
                    v-model="billingInfo.email"
                    required
                    class="form-input"
                    placeholder="your@email.com"
                  />
                </div>
                <div class="form-group">
                  <label for="billing-name">Full Name</label>
                  <input
                    id="billing-name"
                    data-testid="billing-name"
                    type="text"
                    v-model="billingInfo.name"
                    required
                    class="form-input"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="billing-address">Address</label>
                <input
                  id="billing-address"
                  data-testid="billing-address"
                  type="text"
                  v-model="billingInfo.address.line1"
                  required
                  class="form-input"
                  placeholder="123 Main Street"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="billing-city">City</label>
                  <input
                    id="billing-city"
                    data-testid="billing-city"
                    type="text"
                    v-model="billingInfo.address.city"
                    required
                    class="form-input"
                    placeholder="San Francisco"
                  />
                </div>
                <div class="form-group">
                  <label for="billing-zip">ZIP Code</label>
                  <input
                    id="billing-zip"
                    data-testid="billing-zip"
                    type="text"
                    v-model="billingInfo.address.postal_code"
                    required
                    class="form-input"
                    placeholder="94101"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="billing-country">Country</label>
                  <select
                    id="billing-country"
                    data-testid="billing-country"
                    v-model="billingInfo.address.country"
                    @change="updateTax"
                    required
                    class="form-select"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
                <div class="form-group" v-if="billingInfo.address.country === 'US'">
                  <label for="billing-state">State</label>
                  <select
                    id="billing-state"
                    data-testid="billing-state"
                    v-model="billingInfo.address.state"
                    class="form-select"
                  >
                    <option value="">Select State</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <!-- Add more states as needed -->
                  </select>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="form-section">
              <h3>Payment Method</h3>
              
              <div class="payment-method-container">
                <div class="stripe-element-container">
                  <div 
                    id="stripe-card-element"
                    data-testid="stripe-card-element"
                    class="stripe-element"
                  ></div>
                </div>
                
                <div class="payment-security">
                  <div class="security-badges">
                    <span class="security-badge">🔒 SSL Encrypted</span>
                    <span class="security-badge">💳 Stripe Secured</span>
                  </div>
                  <p class="security-text">Your payment information is secure and encrypted.</p>
                </div>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="form-section">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="agreedToTerms"
                  required
                  class="checkbox"
                />
                <span>
                  I agree to the 
                  <a href="/terms" target="_blank">Terms of Service</a> 
                  and 
                  <a href="/privacy" target="_blank">Privacy Policy</a>
                </span>
              </label>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button
                type="submit"
                data-testid="submit-payment"
                :disabled="isProcessing || !isFormValid"
                class="submit-button"
              >
                <span v-if="isProcessing" data-testid="payment-processing">
                  Processing...
                </span>
                <span v-else-if="showTrial">
                  Start Free Trial
                </span>
                <span v-else>
                  Subscribe for ${{ totalAmount.toFixed(2) }}/month
                </span>
              </button>

              <p class="cancel-anytime">Cancel anytime • No long-term commitment</p>
            </div>
          </form>
        </div>
      </div>

      <!-- Payment Error -->
      <div v-if="paymentError" class="payment-error" data-testid="payment-error">
        <div class="error-content">
          <h3>Payment Failed</h3>
          <p>{{ paymentError }}</p>
          <button 
            data-testid="retry-payment"
            @click="clearError"
            class="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { stripeService } from '@/services/stripeService'
import { useFreemium } from '@/composables/useFreemium'

const router = useRouter()
const route = useRoute()
const { currentUser } = useFreemium()

// Form state
const billingInfo = ref({
  email: currentUser.value?.email || '',
  name: currentUser.value?.name || '',
  address: {
    line1: '',
    city: '',
    postal_code: '',
    country: '',
    state: ''
  }
})

const agreedToTerms = ref(false)
const isProcessing = ref(false)
const paymentError = ref('')
const taxAmount = ref(0)

// Computed properties
const showTrial = computed(() => route.query.trial === 'true')
const baseAmount = 9.99
const totalAmount = computed(() => baseAmount + taxAmount.value)

const trialEndDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toLocaleDateString()
})

const isFormValid = computed(() => {
  return billingInfo.value.email &&
         billingInfo.value.name &&
         billingInfo.value.address.line1 &&
         billingInfo.value.address.city &&
         billingInfo.value.address.postal_code &&
         billingInfo.value.address.country &&
         agreedToTerms.value
})

// Methods
const updateTax = () => {
  // Mock tax calculation
  const country = billingInfo.value.address.country
  const state = billingInfo.value.address.state
  
  if (country === 'US') {
    // Different tax rates by state
    const taxRates: Record<string, number> = {
      'CA': 0.0725, // California
      'NY': 0.08,   // New York
      'TX': 0.0625, // Texas
      'FL': 0.06    // Florida
    }
    taxAmount.value = baseAmount * (taxRates[state] || 0.05) // Default 5% for other states
  } else if (country === 'GB') {
    taxAmount.value = baseAmount * 0.20 // 20% VAT
  } else if (country === 'DE') {
    taxAmount.value = baseAmount * 0.19 // 19% VAT
  } else {
    taxAmount.value = 0
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isProcessing.value = true
  paymentError.value = ''

  try {
    if (showTrial.value) {
      // Start free trial
      const result = await stripeService.startFreeTrial(
        billingInfo.value.email,
        billingInfo.value.name
      )
      
      if (result.success) {
        router.push('/payment-success?type=trial')
      } else {
        paymentError.value = result.error || 'Failed to start trial'
      }
    } else {
      // Process payment
      const sessionId = route.query.session as string || `session_${Date.now()}`
      
      const result = await stripeService.processPayment(sessionId, {
        email: billingInfo.value.email,
        name: billingInfo.value.name,
        address: billingInfo.value.address
      })
      
      if (result.success) {
        router.push('/payment-success?type=subscription')
      } else {
        paymentError.value = result.error || 'Payment failed'
      }
    }
  } catch (error) {
    paymentError.value = 'An unexpected error occurred. Please try again.'
    console.error('Payment error:', error)
  } finally {
    isProcessing.value = false
  }
}

const clearError = () => {
  paymentError.value = ''
}

const initializeStripeElements = () => {
  // Mock Stripe Elements initialization
  const cardElement = document.getElementById('stripe-card-element')
  if (cardElement) {
    cardElement.innerHTML = `
      <div class="mock-card-element">
        <div class="card-input-group">
          <input type="text" placeholder="1234 5678 9012 3456" class="card-number" />
          <input type="text" placeholder="MM / YY" class="card-expiry" />
          <input type="text" placeholder="CVC" class="card-cvc" />
        </div>
      </div>
    `
  }
}

// Lifecycle
onMounted(() => {
  initializeStripeElements()
  updateTax()
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.checkout-view {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 2rem 1rem;
}

.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
}

.checkout-header {
  text-align: center;
  margin-bottom: 3rem;
}

.checkout-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.checkout-header p {
  font-size: 1.125rem;
  color: #cccccc;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 3rem;
  align-items: start;
}

.subscription-summary {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 2rem;
  position: sticky;
  top: 2rem;
}

.subscription-summary h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.plan-details {
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 1rem;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  color: #cccccc;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.pricing-breakdown {
  border-top: 1px solid #3a3a3a;
  padding-top: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: #cccccc;
}

.price-row.total {
  border-top: 1px solid #3a3a3a;
  padding-top: 1rem;
  margin-top: 1rem;
  font-weight: 600;
  color: #ffffff;
  font-size: 1.125rem;
}

.trial-notice {
  background: #1f2937;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
}

.trial-notice p {
  color: #10b981;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.checkout-form {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #6366f1;
}

.payment-method-container {
  margin-top: 1rem;
}

.stripe-element-container {
  margin-bottom: 1rem;
}

.stripe-element,
.mock-card-element {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 0.75rem;
  transition: border-color 0.2s;
}

.mock-card-element:focus-within {
  border-color: #6366f1;
}

.card-input-group {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.5rem;
}

.card-input-group input {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.875rem;
  padding: 0.25rem;
}

.card-input-group input:focus {
  outline: none;
}

.card-input-group input::placeholder {
  color: #888;
}

.payment-security {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.security-badges {
  display: flex;
  gap: 1rem;
}

.security-badge {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.security-text {
  font-size: 0.75rem;
  color: #888;
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  color: #cccccc;
  font-size: 0.875rem;
  line-height: 1.4;
}

.checkbox {
  margin-top: 0.1rem;
  accent-color: #6366f1;
}

.checkbox-label a {
  color: #6366f1;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.form-actions {
  text-align: center;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-anytime {
  font-size: 0.75rem;
  color: #888;
  margin: 0;
}

.payment-error {
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

.error-content {
  background: #2a2a2a;
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  text-align: center;
}

.error-content h3 {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-content p {
  color: #cccccc;
  margin-bottom: 1.5rem;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .subscription-summary {
    position: static;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .card-input-group {
    grid-template-columns: 1fr;
  }
}
</style>