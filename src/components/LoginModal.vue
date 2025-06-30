<template>
  <div class="modal-overlay" @click="closeModal" data-testid="login-modal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Welcome Back</h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form" data-testid="login-form">
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
            data-testid="login-email"
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
              placeholder="Enter your password"
              data-testid="login-password"
              autocomplete="current-password"
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
          <span v-if="errors.password" class="error-message" data-testid="password-error">
            {{ errors.password }}
          </span>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="form-options">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.rememberMe"
              data-testid="remember-me"
            />
            <span class="checkmark"></span>
            Remember me
          </label>
          
          <button
            type="button"
            class="forgot-password-link"
            @click="showForgotPassword"
            data-testid="forgot-password-link"
          >
            Forgot Password?
          </button>
        </div>

        <!-- Login Error -->
        <div v-if="loginError" class="error-banner" data-testid="login-error">
          {{ loginError }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
          data-testid="submit-login"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Signing In...' : 'Sign In' }}
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
            data-testid="google-login"
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
            data-testid="github-login"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        <!-- Sign Up Link -->
        <div class="signup-prompt">
          Don't have an account?
          <button type="button" class="signup-link" @click="showSignup">
            Sign up
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/services/authService'
import type { LoginCredentials } from '@/types/auth'

// Props & Emits
interface Props {
  returnUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  returnUrl: '/compose'
})

const emit = defineEmits<{
  close: []
  showSignup: []
  showForgotPassword: []
  loginSuccess: [user: any]
}>()

// Composables
const { login, loginWithGoogle, loginWithGitHub, isLoading, error } = useAuth()

// State
const showPassword = ref(false)
const formData = reactive<LoginCredentials>({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const loginError = ref('')

// Methods
const validateForm = (): boolean => {
  errors.email = ''
  errors.password = ''
  
  if (!formData.email) {
    errors.email = 'Email is required'
    return false
  }
  
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
    return false
  }
  
  if (!formData.password) {
    errors.password = 'Password is required'
    return false
  }
  
  return true
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  try {
    loginError.value = ''
    const user = await login(formData)
    emit('loginSuccess', user)
    emit('close')
    
    // Navigate to return URL or default
    if (props.returnUrl !== window.location.pathname) {
      window.location.href = props.returnUrl
    }
  } catch (err: any) {
    loginError.value = err.message || 'Login failed. Please try again.'
  }
}

const handleGoogleLogin = async () => {
  try {
    loginError.value = ''
    const user = await loginWithGoogle()
    emit('loginSuccess', user)
    emit('close')
    
    if (props.returnUrl !== window.location.pathname) {
      window.location.href = props.returnUrl
    }
  } catch (err: any) {
    loginError.value = err.message || 'Google login failed. Please try again.'
  }
}

const handleGitHubLogin = async () => {
  try {
    loginError.value = ''
    const user = await loginWithGitHub()
    emit('loginSuccess', user)
    emit('close')
    
    if (props.returnUrl !== window.location.pathname) {
      window.location.href = props.returnUrl
    }
  } catch (err: any) {
    loginError.value = err.message || 'GitHub login failed. Please try again.'
  }
}

const closeModal = () => {
  emit('close')
}

const showSignup = () => {
  emit('showSignup')
}

const showForgotPassword = () => {
  emit('showForgotPassword')
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
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  background: #1a1a1a;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.checkbox-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-password-link {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password-link:hover {
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
  opacity: 0.7;
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

.social-button.google:hover:not(:disabled) {
  border-color: #4285F4;
}

.social-button.github:hover:not(:disabled) {
  border-color: #6e5494;
}

.signup-prompt {
  text-align: center;
  color: #888;
  font-size: 0.875rem;
}

.signup-link {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.signup-link:hover {
  color: #8b5cf6;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1.5rem;
  }
  
  .social-login {
    flex-direction: column;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>