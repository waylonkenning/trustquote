<template>
  <div class="modal-overlay" @click="closeModal" data-testid="registration-modal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Create Your Account</h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Trial Badge -->
      <div v-if="startTrial" class="trial-badge">
        <span class="trial-icon">✨</span>
        <span>14-day free trial included</span>
      </div>

      <form @submit.prevent="handleRegister" class="signup-form" data-testid="registration-form">
        <!-- Name Fields -->
        <div class="name-fields">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              v-model="formData.firstName"
              :class="{ error: errors.firstName }"
              placeholder="First name"
              data-testid="register-first-name"
              autocomplete="given-name"
              required
            />
            <span v-if="errors.firstName" class="error-message">
              {{ errors.firstName }}
            </span>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              v-model="formData.lastName"
              :class="{ error: errors.lastName }"
              placeholder="Last name"
              data-testid="register-last-name"
              autocomplete="family-name"
              required
            />
            <span v-if="errors.lastName" class="error-message">
              {{ errors.lastName }}
            </span>
          </div>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            v-model="formData.email"
            :class="{ error: errors.email }"
            placeholder="Enter your email"
            data-testid="register-email"
            autocomplete="email"
            required
          />
          <span v-if="errors.email" class="error-message" data-testid="email-error">
            {{ errors.email }}
          </span>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              id="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              :class="{ error: errors.password }"
              placeholder="Create a password"
              data-testid="register-password"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              aria-label="Toggle password visibility"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2"/>
                <path d="M1 1l22 22" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="password-requirements">
            <span :class="{ met: passwordChecks.length }" class="requirement">
              {{ passwordChecks.length ? '✓' : '•' }} At least 8 characters
            </span>
            <span :class="{ met: passwordChecks.uppercase }" class="requirement">
              {{ passwordChecks.uppercase ? '✓' : '•' }} One uppercase letter
            </span>
            <span :class="{ met: passwordChecks.lowercase }" class="requirement">
              {{ passwordChecks.lowercase ? '✓' : '•' }} One lowercase letter
            </span>
            <span :class="{ met: passwordChecks.number }" class="requirement">
              {{ passwordChecks.number ? '✓' : '•' }} One number
            </span>
          </div>
          <span v-if="errors.password" class="error-message" data-testid="password-error">
            {{ errors.password }}
          </span>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-input">
            <input
              id="confirmPassword"
              name="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="formData.confirmPassword"
              :class="{ error: errors.confirmPassword }"
              placeholder="Confirm your password"
              data-testid="register-confirm-password"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              aria-label="Toggle password visibility"
            >
              <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2"/>
                <path d="M1 1l22 22" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-message" data-testid="password-confirm-error">
            {{ errors.confirmPassword }}
          </span>
        </div>

        <!-- Terms and Privacy -->
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.acceptTerms"
              data-testid="accept-terms"
              required
            />
            <span class="checkmark"></span>
            <span class="terms-text">
              I agree to the 
              <a href="/terms" target="_blank" class="link" data-testid="terms-link">Terms of Service</a>
              and 
              <a href="/privacy" target="_blank" class="link" data-testid="privacy-link">Privacy Policy</a>
            </span>
          </label>
          <span v-if="errors.acceptTerms" class="error-message">
            {{ errors.acceptTerms }}
          </span>
        </div>

        <!-- Registration Error -->
        <div v-if="registrationError" class="error-banner" data-testid="registration-error">
          {{ registrationError }}
          <div v-if="registrationError.includes('already exists')" class="suggest-signin" data-testid="suggest-signin">
            <button type="button" class="link-button" @click="showLogin">
              Sign in instead
            </button>
          </div>
        </div>

        <!-- Email Verification Notice -->
        <div v-if="showEmailVerification" class="success-banner" data-testid="email-verification-notice">
          <div class="success-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <strong>Check your email!</strong>
            <p>We've sent a verification link to {{ formData.email }}</p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading || !isFormValid"
          data-testid="submit-registration"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Creating Account...' : (startTrial ? 'Start Free Trial' : 'Create Account') }}
        </button>

        <!-- Divider -->
        <div class="divider">
          <span>Or continue with</span>
        </div>

        <!-- Social Login -->
        <div class="social-login">
          <button
            type="button"
            class="social-button google"
            @click="handleGoogleLogin"
            :disabled="isLoading"
            data-testid="google-signup"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            class="social-button github"
            @click="handleGitHubLogin"
            :disabled="isLoading"
            data-testid="github-signup"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        <!-- Login Link -->
        <div class="login-prompt">
          Already have an account?
          <button type="button" class="login-link" @click="showLogin">
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '@/services/authService'
import type { RegisterData } from '@/types/auth'

// Props & Emits
interface Props {
  startTrial?: boolean
  returnUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  startTrial: false,
  returnUrl: '/compose'
})

const emit = defineEmits<{
  close: []
  showLogin: []
  registrationSuccess: [user: any]
}>()

// Composables
const { register, loginWithGoogle, loginWithGitHub, isLoading } = useAuth()

// State
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showEmailVerification = ref(false)
const registrationError = ref('')

const formData = reactive<RegisterData>({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  acceptTerms: false,
  startTrial: props.startTrial
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  acceptTerms: ''
})

// Computed
const passwordChecks = computed(() => ({
  length: formData.password.length >= 8,
  uppercase: /[A-Z]/.test(formData.password),
  lowercase: /[a-z]/.test(formData.password),
  number: /\d/.test(formData.password)
}))

const isFormValid = computed(() => {
  return (
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.acceptTerms &&
    Object.values(passwordChecks.value).every(Boolean) &&
    formData.password === formData.confirmPassword
  )
})

// Methods
const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  let isValid = true
  
  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  }
  
  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  }
  
  if (!formData.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  if (!formData.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (!Object.values(passwordChecks.value).every(Boolean)) {
    errors.password = 'Password must meet all requirements'
    isValid = false
  }
  
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  if (!formData.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and privacy policy'
    isValid = false
  }
  
  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  try {
    registrationError.value = ''
    showEmailVerification.value = false
    
    const user = await register(formData)
    
    if (props.startTrial) {
      // Redirect to payment success for trial
      window.location.href = '/payment-success?type=trial'
    } else {
      showEmailVerification.value = true
      // Auto-close modal after showing verification notice
      setTimeout(() => {
        emit('close')
      }, 3000)
    }
    
    emit('registrationSuccess', user)
  } catch (err: any) {
    registrationError.value = err.message || 'Registration failed. Please try again.'
  }
}

const handleGoogleLogin = async () => {
  try {
    registrationError.value = ''
    const user = await loginWithGoogle()
    emit('registrationSuccess', user)
    emit('close')
    
    if (props.returnUrl !== window.location.pathname) {
      window.location.href = props.returnUrl
    }
  } catch (err: any) {
    registrationError.value = err.message || 'Google signup failed. Please try again.'
  }
}

const handleGitHubLogin = async () => {
  try {
    registrationError.value = ''
    const user = await loginWithGitHub()
    emit('registrationSuccess', user)
    emit('close')
    
    if (props.returnUrl !== window.location.pathname) {
      window.location.href = props.returnUrl
    }
  } catch (err: any) {
    registrationError.value = err.message || 'GitHub signup failed. Please try again.'
  }
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
  max-width: 500px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

.trial-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.trial-icon {
  font-size: 1.125rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #ffffff;
}

.password-requirements {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.requirement {
  font-size: 0.75rem;
  color: #888;
  transition: color 0.2s;
}

.requirement.met {
  color: #10b981;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #cccccc;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  background: #1a1a1a;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-label input:checked + .checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.checkbox-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 3px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.terms-text {
  flex: 1;
}

.link {
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: #8b5cf6;
  text-decoration: underline;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 0.75rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.suggest-signin {
  margin-top: 0.5rem;
}

.link-button {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.link-button:hover {
  color: #8b5cf6;
}

.success-banner {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 1rem;
  color: #10b981;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.success-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.success-banner p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
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

.divider {
  position: relative;
  text-align: center;
  margin: 1rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #3a3a3a;
}

.divider span {
  background: #2a2a2a;
  color: #888;
  padding: 0 1rem;
  font-size: 0.875rem;
  position: relative;
}

.social-login {
  display: flex;
  gap: 0.75rem;
}

.social-button {
  flex: 1;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  border-radius: 8px;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.social-button:hover:not(:disabled) {
  background: #4a4a4a;
  border-color: #5a5a5a;
}

.social-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  color: #888;
  font-size: 0.875rem;
}

.login-link {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
  color: #8b5cf6;
  text-decoration: underline;
}

@media (max-width: 580px) {
  .modal-content {
    padding: 1.5rem;
  }
  
  .name-fields {
    grid-template-columns: 1fr;
  }
  
  .password-requirements {
    grid-template-columns: 1fr;
  }
  
  .social-login {
    flex-direction: column;
  }
}
</style>