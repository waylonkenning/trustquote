<template>
  <div class="modal-overlay" @click="closeModal" data-testid="password-reset-modal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Reset Your Password</h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div v-if="!emailSent" class="reset-form">
        <p class="description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              v-model="email"
              :class="{ error: emailError }"
              placeholder="Enter your email"
              data-testid="reset-email-input"
              autocomplete="email"
              required
              autofocus
            />
            <span v-if="emailError" class="error-message">
              {{ emailError }}
            </span>
          </div>

          <div v-if="resetError" class="error-banner">
            {{ resetError }}
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="isLoading || !email"
            data-testid="send-reset-email"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>

          <div class="back-to-login">
            <button type="button" class="link-button" @click="showLogin">
              ← Back to sign in
            </button>
          </div>
        </form>
      </div>

      <div v-else class="success-message" data-testid="reset-email-sent">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#10b981" stroke-width="2"/>
            <path d="m9 12 2 2 4-4" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <h3>Check Your Email</h3>
        <p>
          We've sent a password reset link to <strong>{{ email }}</strong>
        </p>
        
        <div class="email-instructions">
          <p>
            Click the link in the email to reset your password. If you don't see the email, 
            check your spam folder.
          </p>
        </div>

        <div class="resend-section">
          <p class="resend-text">Didn't receive the email?</p>
          <button 
            type="button" 
            class="resend-button"
            @click="resendEmail"
            :disabled="resendCooldown > 0"
          >
            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email' }}
          </button>
        </div>

        <button type="button" class="link-button" @click="showLogin">
          ← Back to sign in
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useAuth } from '@/services/authService'

// Emits
const emit = defineEmits<{
  close: []
  showLogin: []
}>()

// Composables
const { requestPasswordReset, isLoading } = useAuth()

// State
const email = ref('')
const emailError = ref('')
const resetError = ref('')
const emailSent = ref(false)
const resendCooldown = ref(0)

let resendTimer: ReturnType<typeof setTimeout> | null = null

// Methods
const validateEmail = (): boolean => {
  emailError.value = ''
  
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  
  if (!isValidEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateEmail()) return
  
  try {
    resetError.value = ''
    await requestPasswordReset(email.value)
    emailSent.value = true
    startResendCooldown()
  } catch (err: any) {
    resetError.value = err.message || 'Failed to send reset email. Please try again.'
  }
}

const resendEmail = async () => {
  if (resendCooldown.value > 0) return
  
  try {
    resetError.value = ''
    await requestPasswordReset(email.value)
    startResendCooldown()
  } catch (err: any) {
    resetError.value = err.message || 'Failed to resend email. Please try again.'
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60 // 60 seconds cooldown
  
  const countdown = () => {
    resendCooldown.value--
    if (resendCooldown.value > 0) {
      resendTimer = setTimeout(countdown, 1000)
    }
  }
  
  resendTimer = setTimeout(countdown, 1000)
}

const closeModal = () => {
  emit('close')
}

const showLogin = () => {
  emit('showLogin')
}

// Utilities
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Cleanup
onUnmounted(() => {
  if (resendTimer) {
    clearTimeout(resendTimer)
  }
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
  padding: 1rem;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 16px;
  border: 1px solid #3a3a3a;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-button:hover {
  color: #ffffff;
  background: #3a3a3a;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.description {
  color: #cccccc;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #ffffff;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 0.75rem;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}

.submit-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-to-login {
  text-align: center;
}

.link-button {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.link-button:hover {
  color: #8b5cf6;
  text-decoration: underline;
}

.success-message {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.success-icon {
  display: flex;
  justify-content: center;
}

.success-message h3 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.success-message p {
  color: #cccccc;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.email-instructions {
  background: #1f1f1f;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 1rem;
}

.email-instructions p {
  font-size: 0.8125rem;
  color: #888;
  margin: 0;
}

.resend-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.resend-text {
  color: #888;
  font-size: 0.8125rem;
  margin: 0;
}

.resend-button {
  background: none;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #cccccc;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.resend-button:hover:not(:disabled) {
  background: #3a3a3a;
  color: #ffffff;
}

.resend-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1.5rem;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
  }
}
</style>