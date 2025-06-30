<template>
  <div class="account-view">
    <div class="account-container">
      <!-- Header -->
      <div class="account-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, subscription, and billing</p>
      </div>

      <div class="account-content">
        <!-- User Profile Section -->
        <section class="account-section" data-testid="profile-settings">
          <div class="section-header">
            <h2>Profile Information</h2>
            <p>Update your personal information</p>
          </div>

          <div class="section-content">
            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="form-grid">
                <div class="form-group">
                  <label for="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    v-model="profileForm.firstName"
                    data-testid="first-name-field"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    v-model="profileForm.lastName"
                    data-testid="last-name-field"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  v-model="profileForm.email"
                  data-testid="email-field"
                  required
                />
              </div>

              <div v-if="profileUpdateSuccess" class="success-message" data-testid="profile-updated">
                Profile updated successfully!
              </div>

              <div v-if="profileUpdateError" class="error-message">
                {{ profileUpdateError }}
              </div>

              <button 
                type="submit" 
                class="save-button"
                :disabled="profileUpdateLoading"
                data-testid="save-profile"
              >
                {{ profileUpdateLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </form>
          </div>
        </section>

        <!-- Subscription Section -->
        <section class="account-section">
          <div class="section-header">
            <h2>Subscription</h2>
            <p>Manage your plan and billing</p>
          </div>

          <div class="section-content">
            <div class="subscription-info">
              <div class="current-plan">
                <div class="plan-details">
                  <h3>{{ planDisplayName }}</h3>
                  <div class="plan-status" :class="planStatusClass" data-testid="subscription-status">
                    {{ planStatusText }}
                  </div>
                </div>
                
                <div v-if="isPremium || isTrialing" class="plan-badge">
                  <span class="badge-icon">👑</span>
                  {{ isTrialing ? 'Trial' : 'Premium' }}
                </div>
              </div>

              <!-- Trial Information -->
              <div v-if="isTrialing" class="trial-info">
                <div class="trial-status">
                  <span class="trial-icon">⏰</span>
                  <span>{{ trialDaysLeft }} days left in your trial</span>
                </div>
                <p class="trial-description">
                  Your trial ends on {{ trialEndDate }}. After that, you'll be charged $9.99/month unless you cancel.
                </p>
              </div>

              <!-- Free Tier Usage -->
              <div v-if="isFree" class="usage-info">
                <h4>Usage</h4>
                <div class="usage-stats">
                  <div class="usage-item" data-testid="compositions-used">
                    <span class="usage-label">Compositions</span>
                    <span class="usage-value">{{ compositionsUsed }} / 3</span>
                  </div>
                  <div class="usage-progress">
                    <div 
                      class="usage-bar"
                      :style="{ width: `${(compositionsUsed / 3) * 100}%` }"
                    ></div>
                  </div>
                </div>
                
                <div class="upgrade-prompt" data-testid="upgrade-cta">
                  <p>Upgrade to Premium for unlimited compositions and advanced features.</p>
                  <button class="upgrade-button" @click="goToUpgrade">
                    Upgrade to Premium
                  </button>
                </div>
              </div>

              <!-- Premium/Active Subscription -->
              <div v-if="isPremium" class="billing-info" data-testid="billing-info">
                <h4>Billing</h4>
                <div class="billing-details">
                  <div class="billing-item">
                    <span class="billing-label">Amount</span>
                    <span class="billing-value">$9.99/month</span>
                  </div>
                  <div class="billing-item" data-testid="next-billing-date">
                    <span class="billing-label">Next billing date</span>
                    <span class="billing-value">{{ nextBillingDate }}</span>
                  </div>
                  <div class="billing-item">
                    <span class="billing-label">Payment method</span>
                    <span class="billing-value">•••• •••• •••• 4242</span>
                  </div>
                </div>

                <div class="billing-actions">
                  <button class="secondary-button" @click="updatePaymentMethod">
                    Update Payment Method
                  </button>
                  <button class="danger-button" @click="showCancelConfirmation" data-testid="cancel-subscription">
                    Cancel Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Security Section -->
        <section class="account-section" data-testid="security-settings">
          <div class="section-header">
            <h2>Security</h2>
            <p>Manage your password and security settings</p>
          </div>

          <div class="section-content">
            <div class="security-actions">
              <button class="secondary-button" @click="showChangePassword" data-testid="change-password-button">
                Change Password
              </button>
            </div>

            <!-- Change Password Form -->
            <div v-if="showPasswordForm" class="password-form">
              <form @submit.prevent="changePassword">
                <div class="form-group">
                  <label for="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    v-model="passwordForm.currentPassword"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    v-model="passwordForm.newPassword"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    v-model="passwordForm.confirmPassword"
                    required
                  />
                </div>

                <div v-if="passwordChangeSuccess" class="success-message" data-testid="password-success">
                  Password changed successfully!
                </div>

                <div v-if="passwordChangeError" class="error-message">
                  {{ passwordChangeError }}
                </div>

                <div class="form-actions">
                  <button type="button" class="cancel-button" @click="cancelPasswordChange">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    class="save-button"
                    :disabled="passwordChangeLoading"
                    data-testid="change-password-submit"
                  >
                    {{ passwordChangeLoading ? 'Changing...' : 'Change Password' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <!-- Danger Zone -->
        <section class="account-section danger-section" data-testid="danger-zone">
          <div class="section-header">
            <h2>Danger Zone</h2>
            <p>Irreversible and destructive actions</p>
          </div>

          <div class="section-content">
            <div class="danger-actions">
              <div class="danger-item">
                <div class="danger-description">
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all data. This action cannot be undone.</p>
                </div>
                <button class="danger-button" @click="showDeleteConfirmation" data-testid="delete-account-button">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Cancel Subscription Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Cancel Subscription</h3>
        <p>Are you sure you want to cancel your premium subscription?</p>
        <p class="modal-description">
          You'll continue to have premium access until {{ nextBillingDate }}, 
          then your account will switch to the free plan.
        </p>
        
        <div class="modal-actions">
          <button class="cancel-button" @click="showCancelModal = false">
            Keep Subscription
          </button>
          <button class="danger-button" @click="confirmCancelSubscription">
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" data-testid="delete-account-modal">
      <div class="modal-content">
        <h3>Delete Account</h3>
        <p>This will permanently delete your account and all associated data.</p>
        
        <div class="delete-consequences" data-testid="delete-consequences">
          <h4>This action will:</h4>
          <ul>
            <li>Delete all your compositions</li>
            <li>Cancel your subscription</li>
            <li>Remove all account data</li>
            <li>Cannot be undone</li>
          </ul>
        </div>
        
        <form @submit.prevent="confirmDeleteAccount">
          <div class="form-group">
            <label for="deletePassword">Confirm your password</label>
            <input
              id="deletePassword"
              name="deletePassword"
              type="password"
              v-model="deleteForm.password"
              data-testid="delete-password-confirm"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="deleteConfirmation">Type "DELETE" to confirm</label>
            <input
              id="deleteConfirmation"
              name="deleteConfirmation"
              type="text"
              v-model="deleteForm.confirmationText"
              data-testid="delete-confirmation-text"
              placeholder="DELETE"
              required
            />
          </div>

          <div v-if="deleteAccountError" class="error-message">
            {{ deleteAccountError }}
          </div>
          
          <div class="modal-actions">
            <button type="button" class="cancel-button" @click="showDeleteModal = false">
              Cancel
            </button>
            <button 
              type="submit" 
              class="danger-button"
              :disabled="deleteAccountLoading || deleteForm.confirmationText !== 'DELETE'"
              data-testid="confirm-delete-account"
            >
              {{ deleteAccountLoading ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Account Deleted Success -->
    <div v-if="accountDeleted" class="modal-overlay" data-testid="account-deleted">
      <div class="modal-content success-modal">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#10b981" stroke-width="2"/>
            <path d="m9 12 2 2 4-4" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Account Deleted</h3>
        <p>Your account has been permanently deleted. You will be redirected to the homepage.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'

const router = useRouter()
const { 
  user, 
  isAuthenticated, 
  updateProfile, 
  changePassword: changeUserPassword, 
  deleteAccount,
  isLoading 
} = useAuth()

// Redirect if not authenticated
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login?return=' + encodeURIComponent('/account'))
  }
})

// Profile form state
const profileForm = reactive({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || ''
})

const profileUpdateLoading = ref(false)
const profileUpdateSuccess = ref(false)
const profileUpdateError = ref('')

// Password form state
const showPasswordForm = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordChangeLoading = ref(false)
const passwordChangeSuccess = ref(false)
const passwordChangeError = ref('')

// Modal state
const showCancelModal = ref(false)
const showDeleteModal = ref(false)
const accountDeleted = ref(false)

// Delete form state
const deleteForm = reactive({
  password: '',
  confirmationText: ''
})

const deleteAccountLoading = ref(false)
const deleteAccountError = ref('')

// Computed properties
const isPremium = computed(() => user.value?.subscription.status === 'active')
const isTrialing = computed(() => user.value?.subscription.status === 'trialing')
const isFree = computed(() => user.value?.subscription.status === 'free')

const planDisplayName = computed(() => {
  if (isTrialing.value) return 'Premium Trial'
  if (isPremium.value) return 'Premium Plan'
  return 'Free Plan'
})

const planStatusClass = computed(() => ({
  premium: isPremium.value,
  trial: isTrialing.value,
  free: isFree.value
}))

const planStatusText = computed(() => {
  if (isTrialing.value) return 'Trial Active'
  if (isPremium.value) return 'Active'
  return 'Free Plan'
})

const compositionsUsed = computed(() => user.value?.usageStats.compositionsCount || 0)

const trialDaysLeft = computed(() => {
  if (!user.value?.subscription.trialEnd) return 0
  const now = new Date()
  const trialEnd = new Date(user.value.subscription.trialEnd)
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

const trialEndDate = computed(() => {
  if (!user.value?.subscription.trialEnd) return ''
  return new Date(user.value.subscription.trialEnd).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const nextBillingDate = computed(() => {
  if (!user.value?.subscription.currentPeriodEnd) return ''
  return new Date(user.value.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Methods
const updateUserProfile = async () => {
  profileUpdateLoading.value = true
  profileUpdateSuccess.value = false
  profileUpdateError.value = ''
  
  try {
    await updateProfile(profileForm)
    profileUpdateSuccess.value = true
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      profileUpdateSuccess.value = false
    }, 3000)
  } catch (error: any) {
    profileUpdateError.value = error.message || 'Failed to update profile'
  } finally {
    profileUpdateLoading.value = false
  }
}

const showChangePassword = () => {
  showPasswordForm.value = true
  passwordChangeSuccess.value = false
  passwordChangeError.value = ''
}

const cancelPasswordChange = () => {
  showPasswordForm.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordChangeError.value = ''
}

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordChangeError.value = 'New passwords do not match'
    return
  }
  
  passwordChangeLoading.value = true
  passwordChangeSuccess.value = false
  passwordChangeError.value = ''
  
  try {
    await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword)
    passwordChangeSuccess.value = true
    
    // Reset form after success
    setTimeout(() => {
      cancelPasswordChange()
    }, 2000)
  } catch (error: any) {
    passwordChangeError.value = error.message || 'Failed to change password'
  } finally {
    passwordChangeLoading.value = false
  }
}

const goToUpgrade = () => {
  router.push('/pricing')
}

const updatePaymentMethod = () => {
  // Would redirect to Stripe billing portal or show payment method modal
  console.log('Update payment method')
}

const showCancelConfirmation = () => {
  showCancelModal.value = true
}

const confirmCancelSubscription = async () => {
  // Would call API to cancel subscription
  console.log('Cancel subscription')
  showCancelModal.value = false
}

const showDeleteConfirmation = () => {
  showDeleteModal.value = true
  deleteForm.password = ''
  deleteForm.confirmationText = ''
  deleteAccountError.value = ''
}

const confirmDeleteAccount = async () => {
  if (deleteForm.confirmationText !== 'DELETE') {
    deleteAccountError.value = 'Please type "DELETE" to confirm'
    return
  }
  
  deleteAccountLoading.value = true
  deleteAccountError.value = ''
  
  try {
    await deleteAccount(deleteForm.password)
    showDeleteModal.value = false
    accountDeleted.value = true
    
    // Redirect after showing success message
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } catch (error: any) {
    deleteAccountError.value = error.message || 'Failed to delete account'
  } finally {
    deleteAccountLoading.value = false
  }
}

// Watch for user changes
if (user.value) {
  profileForm.firstName = user.value.firstName
  profileForm.lastName = user.value.lastName
  profileForm.email = user.value.email
}
</script>

<style scoped>
.account-view {
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  padding: 2rem 0;
}

.account-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.account-header {
  text-align: center;
  margin-bottom: 3rem;
}

.account-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.account-header p {
  color: #888;
  font-size: 1.125rem;
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.account-section {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  overflow: hidden;
}

.section-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #3a3a3a;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #888;
  font-size: 0.875rem;
}

.section-content {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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

.save-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-button {
  background: transparent;
  color: #cccccc;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.danger-button {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-button:hover:not(:disabled) {
  background: #dc2626;
}

.danger-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  background: transparent;
  color: #888;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 0.75rem;
  color: #10b981;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 0.75rem;
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* Subscription Section */
.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.current-plan {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #1f1f1f;
  border-radius: 8px;
}

.plan-details h3 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.plan-status {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-status.free {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.plan-status.trial {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.plan-status.premium {
  background: rgba(99, 102, 241, 0.2);
  color: #6366f1;
}

.plan-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.trial-info {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 1.5rem;
}

.trial-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.trial-description {
  color: #cccccc;
  font-size: 0.875rem;
  margin: 0;
}

.usage-info h4,
.billing-info h4 {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.usage-stats {
  margin-bottom: 1.5rem;
}

.usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.usage-label {
  color: #cccccc;
  font-size: 0.875rem;
}

.usage-value {
  color: #ffffff;
  font-weight: 600;
}

.usage-progress {
  height: 6px;
  background: #3a3a3a;
  border-radius: 3px;
  overflow: hidden;
}

.usage-bar {
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  transition: width 0.3s;
}

.upgrade-prompt {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid #6366f1;
  border-radius: 8px;
  padding: 1.5rem;
}

.upgrade-prompt p {
  color: #cccccc;
  margin-bottom: 1rem;
}

.upgrade-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.upgrade-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.billing-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.billing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.billing-label {
  color: #888;
  font-size: 0.875rem;
}

.billing-value {
  color: #ffffff;
  font-weight: 500;
}

.billing-actions {
  display: flex;
  gap: 1rem;
}

.security-actions {
  margin-bottom: 2rem;
}

.password-form {
  background: #1f1f1f;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.danger-section {
  border-color: #ef4444;
}

.danger-section .section-header {
  border-bottom-color: rgba(239, 68, 68, 0.2);
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}

.danger-description h4 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.danger-description p {
  color: #888;
  font-size: 0.875rem;
  margin: 0;
}

/* Modal Styles */
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

.modal-content {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-content p {
  color: #cccccc;
  margin-bottom: 1.5rem;
}

.modal-description {
  background: #1f1f1f;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.delete-consequences {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.delete-consequences h4 {
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.delete-consequences ul {
  color: #cccccc;
  font-size: 0.875rem;
  margin: 0;
  padding-left: 1.25rem;
}

.delete-consequences li {
  margin-bottom: 0.25rem;
}

.success-modal {
  text-align: center;
}

.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .account-container {
    padding: 0 1rem;
  }
  
  .account-header h1 {
    font-size: 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .current-plan {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .billing-actions {
    flex-direction: column;
  }
  
  .danger-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>