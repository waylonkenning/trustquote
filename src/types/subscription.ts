export interface User {
  id: string
  email: string
  name: string
  subscription: Subscription
  createdAt: Date
}

export interface Subscription {
  status: SubscriptionStatus
  plan: SubscriptionPlan
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  trialEnd?: Date
}

export type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'

export type SubscriptionPlan = 'free' | 'premium'

export interface PremiumFeature {
  id: string
  name: string
  description: string
  category: 'composition' | 'audio' | 'export' | 'collaboration'
  isPremium: boolean
}

export interface FreemiumLimits {
  maxCompositions: number
  maxDrumsPerComposition: number
  allowedRegionalStyles: string[]
  allowedExportFormats: string[]
  allowedFeatures: string[]
}

export const FREE_TIER_LIMITS: FreemiumLimits = {
  maxCompositions: 3,
  maxDrumsPerComposition: 1,
  allowedRegionalStyles: ['standard'],
  allowedExportFormats: [],
  allowedFeatures: [
    'basic-notation',
    'linear-grid',
    'basic-audio',
    'pronunciation-guide',
    'settings-management'
  ]
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'ensemble-coordination',
    name: 'Multi-drum Ensemble Coordination',
    description: 'Create compositions with multiple drum parts and traditional hierarchy',
    category: 'composition',
    isPremium: true
  },
  {
    id: 'circular-visualization',
    name: 'Circular Rhythm Visualization',
    description: 'Interactive polar coordinate beat cycle display',
    category: 'composition',
    isPremium: true
  },
  {
    id: 'regional-styles',
    name: 'Regional Style Variations',
    description: 'Access Kanto and Kansai notation styles',
    category: 'composition',
    isPremium: true
  },
  {
    id: 'export-capabilities',
    name: 'Export Capabilities',
    description: 'Export compositions to MIDI, sheet music, and audio formats',
    category: 'export',
    isPremium: true
  },
  {
    id: 'collaboration',
    name: 'Real-time Collaboration',
    description: 'Multi-user composition sessions',
    category: 'collaboration',
    isPremium: true
  },
  {
    id: 'pattern-library',
    name: 'Pattern Library',
    description: 'Access to named tetsuke patterns and templates',
    category: 'composition',
    isPremium: true
  },
  {
    id: 'ai-recognition',
    name: 'AI Pattern Recognition',
    description: 'Smart composition suggestions and analysis',
    category: 'composition',
    isPremium: true
  },
  {
    id: 'advanced-audio',
    name: 'Advanced Audio Features',
    description: 'Pitch adjustment, complex mixing, and enhanced playback',
    category: 'audio',
    isPremium: true
  },
  {
    id: 'unlimited-compositions',
    name: 'Unlimited Compositions',
    description: 'Create as many compositions as you need',
    category: 'composition',
    isPremium: true
  }
]

export interface UsageStats {
  compositionsUsed: number
  compositionsLimit: number
  drumsUsed: number
  drumsLimit: number
  featuresAttempted: string[]
  lastUpdated: Date
}

export interface PremiumGateEvent {
  featureId: string
  featureName: string
  timestamp: Date
  userPlan: SubscriptionPlan
  context?: Record<string, any>
}