<template>
  <div class="user-menu" data-testid="user-menu">
    <!-- User Avatar & Trigger -->
    <button 
      class="user-trigger"
      @click="toggleMenu"
      :class="{ active: isOpen }"
      data-testid="user-avatar"
    >
      <div class="avatar">
        <img 
          v-if="user?.avatar" 
          :src="user.avatar" 
          :alt="user.name"
          class="avatar-image"
        />
        <span v-else class="avatar-initials">
          {{ userInitials }}
        </span>
      </div>
      
      <div class="user-info">
        <span class="user-name" data-testid="user-name">{{ user?.name }}</span>
        <span class="user-plan" :class="planClass">
          {{ planLabel }}
        </span>
      </div>
      
      <svg 
        class="chevron" 
        :class="{ open: isOpen }"
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isOpen" class="dropdown-menu" data-testid="user-dropdown">
      <div class="menu-header">
        <div class="user-details">
          <div class="user-name">{{ user?.name }}</div>
          <div class="user-email">{{ user?.email }}</div>
        </div>
        
        <div v-if="isPremium || isTrialing" class="premium-badge" data-testid="premium-status-indicator">
          <span class="badge-icon">👑</span>
          {{ isTrialing ? 'Trial' : 'Premium' }}
        </div>
      </div>

      <!-- Usage Stats (Free Users) -->
      <div v-if="isFree" class="usage-stats">
        <div class="usage-item">
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

      <!-- Trial Info -->
      <div v-if="isTrialing" class="trial-info">
        <div class="trial-header">
          <span class="trial-icon">⏰</span>
          <span>{{ trialDaysLeft }} days left in trial</span>
        </div>
        <button class="upgrade-button" @click="goToUpgrade">
          Upgrade Now
        </button>
      </div>

      <div class="menu-divider"></div>

      <!-- Menu Items -->
      <nav class="menu-items">
        <router-link to="/compose" class="menu-item" @click="closeMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Compositions</span>
        </router-link>

        <router-link to="/account" class="menu-item" @click="closeMenu" data-testid="account-settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Account Settings</span>
        </router-link>

        <router-link 
          v-if="isFree" 
          to="/pricing" 
          class="menu-item upgrade-item" 
          @click="closeMenu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
          </svg>
          <span>Upgrade to Premium</span>
          <span class="premium-badge small">PRO</span>
        </router-link>

        <button class="menu-item" @click="goToHelp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 17h.01" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Help & Support</span>
        </button>

        <div class="menu-divider"></div>

        <button class="menu-item danger-item" @click="handleLogout" data-testid="logout-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/>
            <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Sign Out</span>
        </button>
      </nav>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="logout-modal" data-testid="logout-confirmation">
      <div class="logout-content">
        <h3>Sign Out</h3>
        <p>Are you sure you want to sign out of your account?</p>
        
        <div class="logout-actions">
          <button class="cancel-button" @click="cancelLogout">
            Cancel
          </button>
          <button class="confirm-button" @click="confirmLogout" data-testid="confirm-logout">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'

// Composables
const router = useRouter()
const { user, logout } = useAuth()

// State
const isOpen = ref(false)
const showLogoutConfirm = ref(false)

// Computed
const userInitials = computed(() => {
  if (!user.value) return ''
  const firstName = user.value.firstName || ''
  const lastName = user.value.lastName || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
})

const isPremium = computed(() => 
  user.value?.subscription.status === 'active'
)

const isTrialing = computed(() => 
  user.value?.subscription.status === 'trialing'
)

const isFree = computed(() => 
  user.value?.subscription.status === 'free'
)

const planClass = computed(() => ({
  premium: isPremium.value,
  trial: isTrialing.value,
  free: isFree.value
}))

const planLabel = computed(() => {
  if (isTrialing.value) return 'Trial'
  if (isPremium.value) return 'Premium'
  return 'Free'
})

const compositionsUsed = computed(() => 
  user.value?.usageStats.compositionsCount || 0
)

const trialDaysLeft = computed(() => {
  if (!user.value?.subscription.trialEnd) return 0
  const now = new Date()
  const trialEnd = new Date(user.value.subscription.trialEnd)
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

// Methods
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const cancelLogout = () => {
  showLogoutConfirm.value = false
}

const confirmLogout = async () => {
  try {
    await logout()
    showLogoutConfirm.value = false
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
    // Still redirect even if logout fails
    router.push('/')
  }
}

const goToUpgrade = () => {
  closeMenu()
  router.push('/pricing')
}

const goToHelp = () => {
  closeMenu()
  window.open('/help', '_blank')
}

// Click outside to close
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  const userMenu = target.closest('.user-menu')
  
  if (!userMenu && isOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #ffffff;
}

.user-trigger:hover {
  background: #3a3a3a;
  border-color: #4a4a4a;
}

.user-trigger.active {
  background: #3a3a3a;
  border-color: #6366f1;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.user-plan {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-plan.free {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.user-plan.trial {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.user-plan.premium {
  background: rgba(99, 102, 241, 0.2);
  color: #6366f1;
}

.chevron {
  color: #888;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.chevron.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 280px;
  overflow: hidden;
}

.menu-header {
  padding: 1rem;
  background: #1f1f1f;
  border-bottom: 1px solid #3a3a3a;
}

.user-details {
  margin-bottom: 0.75rem;
}

.user-details .user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
  max-width: none;
}

.user-email {
  font-size: 0.875rem;
  color: #888;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-badge.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
}

.badge-icon {
  font-size: 0.875rem;
}

.usage-stats {
  padding: 1rem;
  background: #1f1f1f;
  border-bottom: 1px solid #3a3a3a;
}

.usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.usage-label {
  font-size: 0.875rem;
  color: #cccccc;
}

.usage-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.usage-progress {
  height: 4px;
  background: #3a3a3a;
  border-radius: 2px;
  overflow: hidden;
}

.usage-bar {
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  transition: width 0.3s;
}

.trial-info {
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-bottom: 1px solid #3a3a3a;
}

.trial-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 500;
}

.trial-icon {
  font-size: 1rem;
}

.upgrade-button {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.upgrade-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.menu-divider {
  height: 1px;
  background: #3a3a3a;
}

.menu-items {
  padding: 0.5rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #cccccc;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.upgrade-item {
  color: #6366f1;
}

.upgrade-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #8b5cf6;
}

.danger-item {
  color: #ef4444;
}

.danger-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.logout-content {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.logout-content h3 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.logout-content p {
  color: #cccccc;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.logout-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.cancel-button {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.confirm-button {
  background: #ef4444;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-button:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .dropdown-menu {
    left: 0;
    right: 0;
    min-width: auto;
  }
  
  .user-info {
    display: none;
  }
  
  .user-trigger {
    padding: 0.5rem;
  }
}
</style>