export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  avatar: string | null
  emailVerified: boolean
  createdAt: Date
  subscription: UserSubscription
  usageStats: UsageStats
}

export interface UserSubscription {
  status: 'free' | 'trialing' | 'active' | 'canceled' | 'past_due'
  plan: 'free' | 'premium'
  trialEnd: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export interface UsageStats {
  compositionsCount: number
  exportsCount: number
  collaborationsCount: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  acceptTerms: boolean
  startTrial?: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  email?: string
  avatar?: string | null
}

export interface DeleteAccountData {
  password: string
  confirmationText: string
}

export interface OAuthProvider {
  name: 'google' | 'github' | 'apple'
  displayName: string
  icon: string
  url: string
}

export interface SessionInfo {
  token: string
  expiresAt: Date
  refreshToken?: string
  device?: string
  location?: string
  lastActive: Date
}

export interface AuthError {
  code: string
  message: string
  field?: string
}

export interface EmailVerification {
  token: string
  email: string
  expiresAt: Date
}