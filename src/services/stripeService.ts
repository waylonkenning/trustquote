import { ref } from 'vue'
import { subscriptionService } from './subscriptionService'
import type { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription'

interface StripeConfig {
  publishableKey: string
  apiUrl: string
}

interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void'
  created: Date
  period_start: Date
  period_end: Date
  downloadUrl: string
}

interface StripeSubscription {
  id: string
  status: SubscriptionStatus
  current_period_start: Date
  current_period_end: Date
  cancel_at_period_end: boolean
  trial_end?: Date
  plan: {
    id: string
    amount: number
    currency: string
    interval: 'month' | 'year'
  }
}

class MockStripeService {
  private config: StripeConfig = {
    publishableKey: 'pk_test_mock_key',
    apiUrl: '/api/stripe'
  }

  private isProcessing = ref(false)
  private currentPaymentMethod = ref<PaymentMethod | null>(null)

  // Mock data
  private mockInvoices: Invoice[] = [
    {
      id: 'in_mock1',
      amount: 999,
      currency: 'usd',
      status: 'paid',
      created: new Date('2024-05-01'),
      period_start: new Date('2024-05-01'),
      period_end: new Date('2024-06-01'),
      downloadUrl: '/mock-invoice-1.pdf'
    },
    {
      id: 'in_mock2',
      amount: 999,
      currency: 'usd',
      status: 'paid',
      created: new Date('2024-04-01'),
      period_start: new Date('2024-04-01'),
      period_end: new Date('2024-05-01'),
      downloadUrl: '/mock-invoice-2.pdf'
    }
  ]

  // Initialize Stripe (mock)
  async initialize(): Promise<void> {
    console.log('Mock Stripe initialized with key:', this.config.publishableKey)
    
    // Simulate loading Stripe SDK
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock existing payment method
    this.currentPaymentMethod.value = {
      id: 'pm_mock123',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025
      }
    }
  }

  // Create checkout session
  async createCheckoutSession(plan: SubscriptionPlan, options?: {
    trial?: boolean
    successUrl?: string
    cancelUrl?: string
  }): Promise<{ url: string; sessionId: string }> {
    this.isProcessing.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const sessionId = `cs_mock_${Date.now()}`
      const baseUrl = window.location.origin
      
      return {
        url: `${baseUrl}/checkout?session=${sessionId}&plan=${plan}`,
        sessionId
      }
    } finally {
      this.isProcessing.value = false
    }
  }

  // Process payment (mock checkout completion)
  async processPayment(sessionId: string, paymentDetails: {
    email: string
    name: string
    address: {
      line1: string
      city: string
      postal_code: string
      country: string
      state?: string
    }
  }): Promise<{ success: boolean; subscription?: StripeSubscription; error?: string }> {
    this.isProcessing.value = true
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock payment success
      const mockSubscription: StripeSubscription = {
        id: `sub_mock_${Date.now()}`,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancel_at_period_end: false,
        plan: {
          id: 'price_premium_monthly',
          amount: 999,
          currency: 'usd',
          interval: 'month'
        }
      }
      
      // Update subscription service
      const user = subscriptionService.currentUser.value
      if (user) {
        subscriptionService.setUser({
          ...user,
          subscription: {
            status: 'active',
            plan: 'premium',
            currentPeriodEnd: mockSubscription.current_period_end
          }
        })
      }
      
      return { success: true, subscription: mockSubscription }
    } catch (error) {
      return { 
        success: false, 
        error: 'Payment failed. Please try again.' 
      }
    } finally {
      this.isProcessing.value = false
    }
  }

  // Start free trial
  async startFreeTrial(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    this.isProcessing.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create mock user with trial
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial
      
      const mockUser = {
        id: `user_mock_${Date.now()}`,
        email,
        name,
        subscription: {
          status: 'trialing' as SubscriptionStatus,
          plan: 'premium' as SubscriptionPlan,
          trialEnd
        },
        createdAt: new Date()
      }
      
      subscriptionService.setUser(mockUser)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to start trial. Please try again.' 
      }
    } finally {
      this.isProcessing.value = false
    }
  }

  // Cancel subscription
  async cancelSubscription(reason?: string): Promise<{ success: boolean; error?: string }> {
    this.isProcessing.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = subscriptionService.currentUser.value
      if (user) {
        subscriptionService.setUser({
          ...user,
          subscription: {
            ...user.subscription,
            status: 'canceled',
            plan: 'free',
            cancelAtPeriodEnd: true
          }
        })
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to cancel subscription. Please try again.' 
      }
    } finally {
      this.isProcessing.value = false
    }
  }

  // Update payment method
  async updatePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    this.isProcessing.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock updated payment method
      this.currentPaymentMethod.value = {
        id: paymentMethodId,
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '5555',
          exp_month: 6,
          exp_year: 2026
        }
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to update payment method. Please try again.' 
      }
    } finally {
      this.isProcessing.value = false
    }
  }

  // Retry failed payment
  async retryPayment(): Promise<{ success: boolean; error?: string }> {
    this.isProcessing.value = true
    
    try {
      // Simulate payment retry
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const user = subscriptionService.currentUser.value
      if (user) {
        subscriptionService.setUser({
          ...user,
          subscription: {
            ...user.subscription,
            status: 'active'
          }
        })
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: 'Payment retry failed. Please update your payment method.' 
      }
    } finally {
      this.isProcessing.value = false
    }
  }

  // Get billing history
  async getBillingHistory(): Promise<Invoice[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return this.mockInvoices
  }

  // Download invoice
  async downloadInvoice(invoiceId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Simulate download preparation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const invoice = this.mockInvoices.find(inv => inv.id === invoiceId)
      if (!invoice) {
        return { success: false, error: 'Invoice not found' }
      }
      
      return { success: true, url: invoice.downloadUrl }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to download invoice. Please try again.' 
      }
    }
  }

  // Get subscription details
  async getSubscription(): Promise<StripeSubscription | null> {
    const user = subscriptionService.currentUser.value
    if (!user || user.subscription.plan === 'free') {
      return null
    }
    
    return {
      id: 'sub_mock_current',
      status: user.subscription.status,
      current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      current_period_end: user.subscription.currentPeriodEnd || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      cancel_at_period_end: user.subscription.cancelAtPeriodEnd || false,
      trial_end: user.subscription.trialEnd,
      plan: {
        id: 'price_premium_monthly',
        amount: 999,
        currency: 'usd',
        interval: 'month'
      }
    }
  }

  // Webhook simulation (for testing)
  simulateWebhook(eventType: string, data: any) {
    console.log('Simulating webhook:', eventType, data)
    
    // Dispatch custom event for webhook simulation
    window.dispatchEvent(new CustomEvent('stripe-webhook', {
      detail: { type: eventType, data }
    }))
  }

  // Getters
  get processing() {
    return this.isProcessing.value
  }

  get paymentMethod() {
    return this.currentPaymentMethod.value
  }

  // Customer portal (redirect to mock portal)
  redirectToCustomerPortal(): void {
    window.location.href = '/account/billing'
  }

  // Price helpers
  formatPrice(amount: number, currency = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  // Test helper methods
  mockPaymentFailure() {
    const user = subscriptionService.currentUser.value
    if (user) {
      subscriptionService.setUser({
        ...user,
        subscription: {
          ...user.subscription,
          status: 'past_due'
        }
      })
      
      this.simulateWebhook('payment_failed', { 
        subscription: { id: 'sub_mock_current' }
      })
    }
  }

  mockTrialExpiry() {
    const user = subscriptionService.currentUser.value
    if (user) {
      subscriptionService.setUser({
        ...user,
        subscription: {
          status: 'active',
          plan: 'premium',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
      
      this.simulateWebhook('trial_ended', { 
        subscription: { id: 'sub_mock_current' }
      })
    }
  }
}

export const stripeService = new MockStripeService()

// Auto-initialize
stripeService.initialize().catch(console.error)