import { ref, computed } from 'vue'
import { subscriptionService } from '@/services/subscriptionService'
import type { PremiumGateEvent } from '@/types/subscription'

export function useFreemium() {
  const showPremiumGate = ref(false)
  const currentGateFeature = ref<string>('')
  const gateContext = ref<Record<string, any>>({})

  // Direct references to subscription service computed properties
  const isLoggedIn = subscriptionService.isLoggedIn
  const isPremium = subscriptionService.isPremium
  const isTrialing = subscriptionService.isTrialing
  const isFree = subscriptionService.isFree
  const currentUser = subscriptionService.currentUser
  const subscription = subscriptionService.subscription
  const usage = subscriptionService.usage
  const limits = subscriptionService.currentLimits

  // Feature access methods
  const canAccessFeature = (featureId: string): boolean => {
    return subscriptionService.canAccessFeature(featureId)
  }

  const canCreateComposition = (): boolean => {
    return subscriptionService.canCreateComposition()
  }

  const canAddDrumPart = (currentParts: number): boolean => {
    return subscriptionService.canAddDrumPart(currentParts)
  }

  const canUseRegionalStyle = (styleCode: string): boolean => {
    return subscriptionService.canUseRegionalStyle(styleCode)
  }

  const canExportFormat = (format: string): boolean => {
    return subscriptionService.canExportFormat(format)
  }

  // Premium gate management
  const checkFeatureAccess = (
    featureId: string, 
    context?: Record<string, any>
  ): boolean => {
    const hasAccess = canAccessFeature(featureId)
    
    if (!hasAccess) {
      triggerPremiumGate(featureId, context)
    }
    
    return hasAccess
  }

  const triggerPremiumGate = (
    featureId: string, 
    context?: Record<string, any>
  ): PremiumGateEvent => {
    currentGateFeature.value = featureId
    gateContext.value = context || {}
    showPremiumGate.value = true
    
    return subscriptionService.triggerPremiumGate(featureId, context)
  }

  const closePremiumGate = () => {
    showPremiumGate.value = false
    currentGateFeature.value = ''
    gateContext.value = {}
  }

  // Composition limits
  const checkCompositionLimit = (): boolean => {
    const canCreate = canCreateComposition()
    
    if (!canCreate) {
      triggerPremiumGate('unlimited-compositions')
    }
    
    return canCreate
  }

  const incrementCompositionCount = () => {
    subscriptionService.incrementCompositionCount()
  }

  const decrementCompositionCount = () => {
    subscriptionService.decrementCompositionCount()
  }

  // Drum part limits
  const checkDrumPartLimit = (currentParts: number): boolean => {
    const canAdd = canAddDrumPart(currentParts)
    
    if (!canAdd) {
      triggerPremiumGate('ensemble-coordination', { currentParts })
    }
    
    return canAdd
  }

  // Regional style access
  const checkRegionalStyleAccess = (styleCode: string): boolean => {
    const canUse = canUseRegionalStyle(styleCode)
    
    if (!canUse) {
      triggerPremiumGate('regional-styles', { styleCode })
    }
    
    return canUse
  }

  // Export access
  const checkExportAccess = (format: string): boolean => {
    const canExport = canExportFormat(format)
    
    if (!canExport) {
      triggerPremiumGate('export-capabilities', { format })
    }
    
    return canExport
  }

  // Feature-specific helpers
  const canUseCircularVisualization = (): boolean => {
    return checkFeatureAccess('circular-visualization')
  }

  const canUseCollaboration = (): boolean => {
    return checkFeatureAccess('collaboration')
  }

  const canUsePatternLibrary = (): boolean => {
    return checkFeatureAccess('pattern-library')
  }

  const canUseAIRecognition = (): boolean => {
    return checkFeatureAccess('ai-recognition')
  }

  const canUseAdvancedAudio = (): boolean => {
    return checkFeatureAccess('advanced-audio')
  }

  // Usage tracking helpers
  const getUsagePercentage = (type: 'compositions' | 'drums'): number => {
    const usageStats = usage.value
    
    switch (type) {
      case 'compositions':
        return usageStats.compositionsPercentage
      case 'drums':
        return Math.min(100, (usageStats.drumsUsed / usageStats.drumsLimit) * 100)
      default:
        return 0
    }
  }

  const isApproachingLimit = (type: 'compositions' | 'drums'): boolean => {
    return getUsagePercentage(type) >= 80
  }

  const hasReachedLimit = (type: 'compositions' | 'drums'): boolean => {
    return getUsagePercentage(type) >= 100
  }

  // Subscription management helpers
  const startFreeTrial = async () => {
    try {
      await subscriptionService.startFreeTrial()
      closePremiumGate()
      return true
    } catch (error) {
      console.error('Failed to start trial:', error)
      return false
    }
  }

  const upgradeSubscription = async (plan: 'premium' = 'premium') => {
    try {
      await subscriptionService.upgradeSubscription(plan)
      closePremiumGate()
      return true
    } catch (error) {
      console.error('Failed to upgrade:', error)
      return false
    }
  }

  // Premium badge helper
  const shouldShowPremiumBadge = (featureId: string): boolean => {
    return !canAccessFeature(featureId)
  }

  return {
    // State
    showPremiumGate,
    currentGateFeature,
    gateContext,
    
    // Computed
    isLoggedIn,
    isPremium,
    isTrialing,
    isFree,
    currentUser,
    subscription,
    usage,
    limits,
    
    // Feature access
    canAccessFeature,
    canCreateComposition,
    canAddDrumPart,
    canUseRegionalStyle,
    canExportFormat,
    
    // Premium gate
    checkFeatureAccess,
    triggerPremiumGate,
    closePremiumGate,
    
    // Limits checking
    checkCompositionLimit,
    checkDrumPartLimit,
    checkRegionalStyleAccess,
    checkExportAccess,
    
    // Feature-specific
    canUseCircularVisualization,
    canUseCollaboration,
    canUsePatternLibrary,
    canUseAIRecognition,
    canUseAdvancedAudio,
    
    // Usage tracking
    incrementCompositionCount,
    decrementCompositionCount,
    getUsagePercentage,
    isApproachingLimit,
    hasReachedLimit,
    
    // Subscription management
    startFreeTrial,
    upgradeSubscription,
    
    // UI helpers
    shouldShowPremiumBadge
  }
}