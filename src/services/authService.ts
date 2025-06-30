import { ref, reactive, computed } from 'vue'
import type { User, LoginCredentials, RegisterData, AuthState } from '@/types/auth'

class AuthService {
  private state = reactive<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  })

  // Reactive getters
  get user() { return this.state.user }
  get token() { return this.state.token }
  get isAuthenticated() { return this.state.isAuthenticated }
  get isLoading() { return this.state.isLoading }
  get error() { return this.state.error }

  constructor() {
    this.initializeFromStorage()
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeFromStorage() {
    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        const user = JSON.parse(userData)
        this.state.token = token
        this.state.user = user
        this.state.isAuthenticated = true
      }
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error)
      this.clearAuthData()
    }
  }

  /**
   * Register a new user account
   */
  async register(data: RegisterData): Promise<User> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock registration - replace with real API call
      const response = await this.mockRegister(data)
      
      if (response.requiresVerification) {
        // Email verification required
        return response.user
      } else {
        // Auto-login after registration
        this.setAuthData(response.user, response.token)
        return response.user
      }
    } catch (error: any) {
      this.state.error = error.message || 'Registration failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock login - replace with real API call
      const response = await this.mockLogin(credentials)
      
      this.setAuthData(response.user, response.token)
      return response.user
    } catch (error: any) {
      this.state.error = error.message || 'Login failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(): Promise<User> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock Google login - replace with real OAuth flow
      const response = await this.mockGoogleLogin()
      
      this.setAuthData(response.user, response.token)
      return response.user
    } catch (error: any) {
      this.state.error = error.message || 'Google login failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Login with GitHub OAuth
   */
  async loginWithGitHub(): Promise<User> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock GitHub login - replace with real OAuth flow
      const response = await this.mockGitHubLogin()
      
      this.setAuthData(response.user, response.token)
      return response.user
    } catch (error: any) {
      this.state.error = error.message || 'GitHub login failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.state.isLoading = true

    try {
      // Mock logout - replace with real API call
      await this.mockLogout()
      
      this.clearAuthData()
    } catch (error: any) {
      console.error('Logout error:', error)
      // Clear data even if logout API fails
      this.clearAuthData()
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock password reset - replace with real API call
      await this.mockPasswordReset(email)
    } catch (error: any) {
      this.state.error = error.message || 'Password reset failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock password reset confirmation - replace with real API call
      await this.mockPasswordResetConfirm(token, newPassword)
    } catch (error: any) {
      this.state.error = error.message || 'Password reset failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock profile update - replace with real API call
      const updatedUser = await this.mockUpdateProfile(updates)
      
      this.state.user = updatedUser
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error: any) {
      this.state.error = error.message || 'Profile update failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock password change - replace with real API call
      await this.mockChangePassword(currentPassword, newPassword)
    } catch (error: any) {
      this.state.error = error.message || 'Password change failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock account deletion - replace with real API call
      await this.mockDeleteAccount(password)
      
      this.clearAuthData()
    } catch (error: any) {
      this.state.error = error.message || 'Account deletion failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    this.state.isLoading = true
    this.state.error = null

    try {
      // Mock email verification - replace with real API call
      const response = await this.mockVerifyEmail(token)
      
      if (this.state.user) {
        this.state.user.emailVerified = true
        localStorage.setItem('user_data', JSON.stringify(this.state.user))
      }
    } catch (error: any) {
      this.state.error = error.message || 'Email verification failed'
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  /**
   * Check if current session is valid
   */
  async validateSession(): Promise<boolean> {
    if (!this.state.token) return false

    try {
      // Mock session validation - replace with real API call
      const isValid = await this.mockValidateSession(this.state.token)
      
      if (!isValid) {
        this.clearAuthData()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Session validation error:', error)
      this.clearAuthData()
      return false
    }
  }

  /**
   * Set authentication data
   */
  private setAuthData(user: User, token: string) {
    this.state.user = user
    this.state.token = token
    this.state.isAuthenticated = true
    
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(user))
  }

  /**
   * Clear authentication data
   */
  private clearAuthData() {
    this.state.user = null
    this.state.token = null
    this.state.isAuthenticated = false
    this.state.error = null
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  // Mock API methods - replace with real API calls

  private async mockRegister(data: RegisterData) {
    await this.delay(1000)
    
    // Simulate existing email check
    if (data.email === 'existing@example.com') {
      throw new Error('Email already exists')
    }
    
    // Simulate validation errors
    if (!this.isValidEmail(data.email)) {
      throw new Error('Please enter a valid email address')
    }
    
    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
    
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords must match')
    }

    const user: User = {
      id: this.generateId(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      avatar: null,
      emailVerified: false,
      createdAt: new Date(),
      subscription: {
        status: data.startTrial ? 'trialing' : 'free',
        plan: data.startTrial ? 'premium' : 'free',
        trialEnd: data.startTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      },
      usageStats: {
        compositionsCount: 0,
        exportsCount: 0,
        collaborationsCount: 0
      }
    }

    return {
      user,
      token: this.generateToken(),
      requiresVerification: false
    }
  }

  private async mockLogin(credentials: LoginCredentials) {
    await this.delay(800)
    
    // Simulate authentication
    if (credentials.email === 'wronguser@example.com' || credentials.password === 'wrongpassword') {
      throw new Error('Invalid credentials')
    }

    // Mock user data based on email
    const isPremium = credentials.email.includes('premium')
    const isTrialing = credentials.email.includes('trial')

    const user: User = {
      id: this.generateId(),
      email: credentials.email,
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      avatar: null,
      emailVerified: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      subscription: {
        status: isTrialing ? 'trialing' : isPremium ? 'active' : 'free',
        plan: isTrialing || isPremium ? 'premium' : 'free',
        trialEnd: isTrialing ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) : null,
        currentPeriodEnd: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        cancelAtPeriodEnd: false
      },
      usageStats: {
        compositionsCount: 2,
        exportsCount: 5,
        collaborationsCount: 1
      }
    }

    return {
      user,
      token: this.generateToken()
    }
  }

  private async mockGoogleLogin() {
    await this.delay(1200)

    const user: User = {
      id: this.generateId(),
      email: 'google@example.com',
      firstName: 'Google',
      lastName: 'User',
      name: 'Google User',
      avatar: 'https://lh3.googleusercontent.com/a-/AOh14GjQ...',
      emailVerified: true,
      createdAt: new Date(),
      subscription: {
        status: 'free',
        plan: 'free',
        trialEnd: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      },
      usageStats: {
        compositionsCount: 0,
        exportsCount: 0,
        collaborationsCount: 0
      }
    }

    return {
      user,
      token: this.generateToken()
    }
  }

  private async mockGitHubLogin() {
    await this.delay(1200)

    const user: User = {
      id: this.generateId(),
      email: 'github@example.com',
      firstName: 'GitHub',
      lastName: 'User',
      name: 'GitHub User',
      avatar: 'https://avatars.githubusercontent.com/u/123456?v=4',
      emailVerified: true,
      createdAt: new Date(),
      subscription: {
        status: 'free',
        plan: 'free',
        trialEnd: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      },
      usageStats: {
        compositionsCount: 0,
        exportsCount: 0,
        collaborationsCount: 0
      }
    }

    return {
      user,
      token: this.generateToken()
    }
  }

  private async mockLogout() {
    await this.delay(300)
    // In real implementation, invalidate token on server
  }

  private async mockPasswordReset(email: string) {
    await this.delay(1000)
    
    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address')
    }
    
    // Always return success for security (don't reveal if email exists)
  }

  private async mockPasswordResetConfirm(token: string, newPassword: string) {
    await this.delay(800)
    
    if (token === 'invalid-token') {
      throw new Error('Invalid or expired reset token')
    }
    
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
  }

  private async mockUpdateProfile(updates: Partial<User>) {
    await this.delay(500)
    
    if (!this.state.user) {
      throw new Error('User not authenticated')
    }

    return {
      ...this.state.user,
      ...updates,
      name: updates.firstName && updates.lastName 
        ? `${updates.firstName} ${updates.lastName}`
        : this.state.user.name
    }
  }

  private async mockChangePassword(currentPassword: string, newPassword: string) {
    await this.delay(600)
    
    if (currentPassword !== 'password123') {
      throw new Error('Current password is incorrect')
    }
    
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters')
    }
  }

  private async mockDeleteAccount(password: string) {
    await this.delay(1000)
    
    if (password !== 'password123') {
      throw new Error('Password is incorrect')
    }
  }

  private async mockVerifyEmail(token: string) {
    await this.delay(500)
    
    if (token === 'invalid-token') {
      throw new Error('Invalid or expired verification token')
    }
  }

  private async mockValidateSession(token: string) {
    await this.delay(200)
    
    // Simulate token expiration
    if (token === 'expired-jwt-token') {
      return false
    }
    
    return true
  }

  // Utility methods

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateToken(): string {
    return 'mock-jwt-' + Math.random().toString(36).substr(2, 16)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Create singleton instance
export const authService = new AuthService()

// Vue composable for using auth service
export function useAuth() {
  return {
    user: computed(() => authService.user),
    token: computed(() => authService.token),
    isAuthenticated: computed(() => authService.isAuthenticated),
    isLoading: computed(() => authService.isLoading),
    error: computed(() => authService.error),
    
    // Auth methods
    register: authService.register.bind(authService),
    login: authService.login.bind(authService),
    loginWithGoogle: authService.loginWithGoogle.bind(authService),
    loginWithGitHub: authService.loginWithGitHub.bind(authService),
    logout: authService.logout.bind(authService),
    requestPasswordReset: authService.requestPasswordReset.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    changePassword: authService.changePassword.bind(authService),
    deleteAccount: authService.deleteAccount.bind(authService),
    verifyEmail: authService.verifyEmail.bind(authService),
    validateSession: authService.validateSession.bind(authService)
  }
}