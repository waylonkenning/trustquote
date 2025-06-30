import { ref, computed, reactive } from 'vue'
import type { 
  User, 
  Subscription, 
  SubscriptionStatus, 
  SubscriptionPlan,
  UsageStats,
  PremiumGateEvent,
  FreemiumLimits
} from '@/types/subscription'
import { FREE_TIER_LIMITS, PREMIUM_FEATURES } from '@/types/subscription'

class SubscriptionService {
  private user = ref<User | null>(null)
  private usageStats = reactive<UsageStats>({
    compositionsUsed: 0,
    compositionsLimit: FREE_TIER_LIMITS.maxCompositions,
    drumsUsed: 0,
    drumsLimit: FREE_TIER_LIMITS.maxDrumsPerComposition,
    featuresAttempted: [],
    lastUpdated: new Date()
  })

  // Computed properties
  readonly currentUser = computed(() => this.user.value)
  readonly subscription = computed(() => this.user.value?.subscription)
  readonly isLoggedIn = computed(() => !!this.user.value)
  readonly isPremium = computed(() => 
    this.subscription.value?.plan === 'premium' && 
    this.subscription.value?.status === 'active'
  )
  readonly isTrialing = computed(() => 
    this.subscription.value?.status === 'trialing'
  )
  readonly isFree = computed(() => 
    !this.user.value || 
    this.subscription.value?.plan === 'free' ||
    this.subscription.value?.status === 'canceled'
  )

  readonly currentLimits = computed<FreemiumLimits>(() => {
    if (this.isPremium.value || this.isTrialing.value) {
      return {
        maxCompositions: Infinity,
        maxDrumsPerComposition: Infinity,
        allowedRegionalStyles: ['standard', 'kanto', 'kansai'],
        allowedExportFormats: ['midi', 'sheet-music', 'audio', 'kuchi-shoga'],
        allowedFeatures: PREMIUM_FEATURES.map(f => f.id)
      }
    }
    return FREE_TIER_LIMITS
  })

  readonly usage = computed(() => ({
    ...this.usageStats,
    compositionsPercentage: Math.min(100, (this.usageStats.compositionsUsed / this.usageStats.compositionsLimit) * 100),
    isApproachingLimit: this.usageStats.compositionsUsed >= this.usageStats.compositionsLimit * 0.8,
    hasReachedLimit: this.usageStats.compositionsUsed >= this.usageStats.compositionsLimit
  }))

  // User management
  setUser(userData: User) {
    this.user.value = userData
    this.loadUsageStats()
    this.persistUserData()
  }

  logout() {
    this.user.value = null
    this.resetUsageStats()
    this.clearPersistedData()
  }

  // Feature access control
  canAccessFeature(featureId: string): boolean {
    if (this.isPremium.value || this.isTrialing.value) {
      return true
    }
    
    return this.currentLimits.value.allowedFeatures.includes(featureId)
  }

  canCreateComposition(): boolean {
    if (this.isPremium.value || this.isTrialing.value) {
      return true
    }
    
    return this.usageStats.compositionsUsed < this.currentLimits.value.maxCompositions
  }

  canAddDrumPart(currentParts: number): boolean {
    if (this.isPremium.value || this.isTrialing.value) {
      return true
    }
    
    return currentParts < this.currentLimits.value.maxDrumsPerComposition
  }

  canUseRegionalStyle(styleCode: string): boolean {
    if (this.isPremium.value || this.isTrialing.value) {
      return true
    }
    
    return this.currentLimits.value.allowedRegionalStyles.includes(styleCode)
  }

  canExportFormat(format: string): boolean {
    if (this.isPremium.value || this.isTrialing.value) {
      return true
    }
    
    return this.currentLimits.value.allowedExportFormats.includes(format)
  }

  // Premium gate handling
  triggerPremiumGate(featureId: string, context?: Record<string, any>): PremiumGateEvent {
    const feature = PREMIUM_FEATURES.find(f => f.id === featureId)
    const event: PremiumGateEvent = {
      featureId,
      featureName: feature?.name || featureId,
      timestamp: new Date(),
      userPlan: this.subscription.value?.plan || 'free',
      context
    }

    // Track attempted feature usage
    if (!this.usageStats.featuresAttempted.includes(featureId)) {
      this.usageStats.featuresAttempted.push(featureId)
      this.persistUsageStats()
    }

    // Emit event for analytics
    this.trackPremiumGateEvent(event)
    
    return event
  }

  // Usage tracking
  incrementCompositionCount() {
    this.usageStats.compositionsUsed++
    this.usageStats.lastUpdated = new Date()
    this.persistUsageStats()
  }

  decrementCompositionCount() {
    this.usageStats.compositionsUsed = Math.max(0, this.usageStats.compositionsUsed - 1)
    this.usageStats.lastUpdated = new Date()
    this.persistUsageStats()
  }

  updateDrumUsage(count: number) {
    this.usageStats.drumsUsed = count
    this.usageStats.lastUpdated = new Date()
    this.persistUsageStats()
  }

  // Subscription management
  async upgradeSubscription(plan: SubscriptionPlan = 'premium') {
    if (!this.user.value) {
      throw new Error('User must be logged in to upgrade')
    }

    // Mock upgrade - in real app would call Stripe
    this.user.value.subscription = {
      status: 'active',
      plan: 'premium',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }

    this.persistUserData()
    return true
  }

  async cancelSubscription() {
    if (!this.user.value) {
      throw new Error('User must be logged in to cancel')
    }

    // Mock cancellation - in real app would call Stripe
    this.user.value.subscription = {
      status: 'canceled',
      plan: 'free',
      cancelAtPeriodEnd: true,
      currentPeriodEnd: this.user.value.subscription.currentPeriodEnd
    }

    this.persistUserData()
    return true
  }

  async startFreeTrial() {
    if (!this.user.value) {
      throw new Error('User must be logged in to start trial')
    }

    // Mock implementation - would integrate with backend
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial

    this.user.value.subscription = {
      status: 'trialing',
      plan: 'premium',
      trialEnd
    }

    this.persistUserData()
  }

  // Private methods
  private loadUsageStats() {
    if (!this.user.value) return

    const stored = localStorage.getItem(`usage_stats_${this.user.value.id}`)
    if (stored) {
      const stats = JSON.parse(stored)
      Object.assign(this.usageStats, {
        ...stats,
        lastUpdated: new Date(stats.lastUpdated)
      })
    }

    // Update limits based on subscription
    if (this.isPremium.value || this.isTrialing.value) {
      this.usageStats.compositionsLimit = Infinity
      this.usageStats.drumsLimit = Infinity
    } else {
      this.usageStats.compositionsLimit = FREE_TIER_LIMITS.maxCompositions
      this.usageStats.drumsLimit = FREE_TIER_LIMITS.maxDrumsPerComposition
    }
  }

  private persistUsageStats() {
    if (!this.user.value) return

    localStorage.setItem(
      `usage_stats_${this.user.value.id}`, 
      JSON.stringify(this.usageStats)
    )
  }

  private resetUsageStats() {
    Object.assign(this.usageStats, {
      compositionsUsed: 0,
      compositionsLimit: FREE_TIER_LIMITS.maxCompositions,
      drumsUsed: 0,
      drumsLimit: FREE_TIER_LIMITS.maxDrumsPerComposition,
      featuresAttempted: [],
      lastUpdated: new Date()
    })
  }

  private persistUserData() {
    if (this.user.value) {
      localStorage.setItem('user_data', JSON.stringify(this.user.value))
      localStorage.setItem('auth_token', 'mock-token') // Would be real JWT
    }
  }

  private clearPersistedData() {
    localStorage.removeItem('user_data')
    localStorage.removeItem('auth_token')
    
    // Clear usage stats for all users
    Object.keys(localStorage)
      .filter(key => key.startsWith('usage_stats_'))
      .forEach(key => localStorage.removeItem(key))
  }

  private trackPremiumGateEvent(event: PremiumGateEvent) {
    // Send to analytics service
    console.log('Premium gate triggered:', event)
    
    // Store locally for debugging
    const events = JSON.parse(localStorage.getItem('premium_gate_events') || '[]')
    events.push(event)
    localStorage.setItem('premium_gate_events', JSON.stringify(events.slice(-50))) // Keep last 50
  }

  // Initialize from persisted data
  init() {
    const userData = localStorage.getItem('user_data')
    const authToken = localStorage.getItem('auth_token')
    
    if (userData && authToken) {
      try {
        const user = JSON.parse(userData)
        this.setUser({
          ...user,
          createdAt: new Date(user.createdAt)
        })
      } catch (error) {
        console.error('Failed to restore user data:', error)
        this.clearPersistedData()
      }
    }
  }
}

export const subscriptionService = new SubscriptionService()

// Auto-initialize
subscriptionService.init()