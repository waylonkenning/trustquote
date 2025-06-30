import { test, expect } from '@playwright/test';

test.describe('Stripe Payment Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Mock Stripe for testing
    await page.addInitScript(() => {
      // Mock Stripe object
      (window as any).Stripe = () => ({
        elements: () => ({
          create: () => ({
            mount: () => {},
            on: () => {},
            destroy: () => {}
          }),
          getElement: () => ({})
        }),
        confirmCardPayment: () => Promise.resolve({
          paymentIntent: { status: 'succeeded' }
        }),
        confirmSetupIntent: () => Promise.resolve({
          setupIntent: { status: 'succeeded' }
        })
      });
    });
  });

  test.describe('Subscription Signup Flow', () => {
    test('should show pricing page with subscription options', async ({ page }) => {
      await page.goto('/pricing');
      
      // Should show free tier details
      await expect(page.locator('[data-testid="free-tier-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="free-tier-price"]')).toContainText('$0');
      await expect(page.locator('[data-testid="free-tier-features"]')).toBeVisible();
      
      // Should show premium tier details
      await expect(page.locator('[data-testid="premium-tier-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-tier-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-tier-features"]')).toBeVisible();
      
      // Should show feature comparison
      await expect(page.locator('[data-testid="feature-comparison-table"]')).toBeVisible();
    });

    test('should handle premium subscription signup', async ({ page }) => {
      await page.goto('/pricing');
      
      // Click subscribe to premium
      await page.click('[data-testid="subscribe-premium"]');
      
      // Should redirect to checkout
      await expect(page).toHaveURL(/\/checkout/);
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
      
      // Should show subscription summary
      await expect(page.locator('[data-testid="subscription-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="subscription-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="subscription-features"]')).toBeVisible();
      
      // Should show Stripe payment form
      await expect(page.locator('[data-testid="stripe-card-element"]')).toBeVisible();
      await expect(page.locator('[data-testid="billing-address-form"]')).toBeVisible();
    });

    test('should handle payment form submission', async ({ page }) => {
      await page.goto('/checkout');
      
      // Fill billing information
      await page.fill('[data-testid="billing-email"]', 'test@example.com');
      await page.fill('[data-testid="billing-name"]', 'Test User');
      await page.fill('[data-testid="billing-address"]', '123 Test St');
      await page.fill('[data-testid="billing-city"]', 'Test City');
      await page.fill('[data-testid="billing-zip"]', '12345');
      await page.selectOption('[data-testid="billing-country"]', 'US');
      
      // Mock successful card input
      await page.evaluate(() => {
        const mockElement = {
          on: (event: string, callback: Function) => {
            if (event === 'change') {
              callback({ complete: true, error: null });
            }
          }
        };
        (window as any).__mockStripeElement = mockElement;
      });
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Should show processing state
      await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible();
      
      // Should redirect to success page
      await expect(page).toHaveURL(/\/payment-success/);
      await expect(page.locator('[data-testid="payment-success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="subscription-confirmation"]')).toBeVisible();
    });

    test('should handle payment failures gracefully', async ({ page }) => {
      await page.goto('/checkout');
      
      // Mock payment failure
      await page.addInitScript(() => {
        (window as any).Stripe = () => ({
          elements: () => ({
            create: () => ({
              mount: () => {},
              on: () => {},
              destroy: () => {}
            })
          }),
          confirmCardPayment: () => Promise.resolve({
            error: { 
              type: 'card_error',
              code: 'card_declined',
              message: 'Your card was declined.'
            }
          })
        });
      });
      
      await page.fill('[data-testid="billing-email"]', 'test@example.com');
      await page.click('[data-testid="submit-payment"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('Your card was declined');
      
      // Should allow retry
      await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible();
    });

    test('should handle free trial signup', async ({ page }) => {
      await page.goto('/pricing');
      
      // Click start free trial
      await page.click('[data-testid="start-free-trial"]');
      
      // Should require account creation
      await expect(page.locator('[data-testid="trial-signup-form"]')).toBeVisible();
      
      await page.fill('[data-testid="trial-email"]', 'trial@example.com');
      await page.fill('[data-testid="trial-name"]', 'Trial User');
      await page.click('[data-testid="start-trial"]');
      
      // Should show trial confirmation
      await expect(page.locator('[data-testid="trial-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="trial-expiry-date"]')).toBeVisible();
      
      // Should redirect to app with trial access
      await page.click('[data-testid="continue-to-app"]');
      await expect(page).toHaveURL(/\/compose/);
      await expect(page.locator('[data-testid="trial-status-indicator"]')).toBeVisible();
    });
  });

  test.describe('Subscription Management', () => {
    test('should show subscription status for premium users', async ({ page }) => {
      // Mock premium user state
      await page.addInitScript(() => {
        localStorage.setItem('user_subscription', JSON.stringify({
          status: 'active',
          plan: 'premium',
          current_period_end: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days from now
        }));
      });
      
      await page.goto('/account');
      
      // Should show active subscription status
      await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Premium');
      await expect(page.locator('[data-testid="subscription-status-badge"]')).toHaveClass(/active/);
      await expect(page.locator('[data-testid="next-billing-date"]')).toBeVisible();
      
      // Should show subscription management options
      await expect(page.locator('[data-testid="cancel-subscription"]')).toBeVisible();
      await expect(page.locator('[data-testid="update-payment-method"]')).toBeVisible();
      await expect(page.locator('[data-testid="download-invoices"]')).toBeVisible();
    });

    test('should handle subscription cancellation', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('user_subscription', JSON.stringify({
          status: 'active',
          plan: 'premium'
        }));
      });
      
      await page.goto('/account');
      
      // Click cancel subscription
      await page.click('[data-testid="cancel-subscription"]');
      
      // Should show cancellation confirmation modal
      await expect(page.locator('[data-testid="cancellation-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancellation-consequences"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancellation-effective-date"]')).toBeVisible();
      
      // Should offer retention options
      await expect(page.locator('[data-testid="retention-offers"]')).toBeVisible();
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancellation"]');
      
      // Should show cancellation confirmation
      await expect(page.locator('[data-testid="cancellation-confirmed"]')).toBeVisible();
      await expect(page.locator('[data-testid="reactivation-instructions"]')).toBeVisible();
    });

    test('should handle payment method updates', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('user_subscription', JSON.stringify({
          status: 'active',
          plan: 'premium'
        }));
      });
      
      await page.goto('/account');
      
      // Click update payment method
      await page.click('[data-testid="update-payment-method"]');
      
      // Should show payment method form
      await expect(page.locator('[data-testid="payment-method-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-payment-method"]')).toBeVisible();
      await expect(page.locator('[data-testid="new-card-form"]')).toBeVisible();
      
      // Should allow saving new payment method
      await page.click('[data-testid="save-payment-method"]');
      await expect(page.locator('[data-testid="payment-method-updated"]')).toBeVisible();
    });

    test('should handle failed payment recovery', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('user_subscription', JSON.stringify({
          status: 'past_due',
          plan: 'premium'
        }));
      });
      
      await page.goto('/account');
      
      // Should show past due warning
      await expect(page.locator('[data-testid="payment-failed-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-retry-countdown"]')).toBeVisible();
      
      // Should show retry payment option
      await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible();
      
      // Click retry payment
      await page.click('[data-testid="retry-payment"]');
      await expect(page.locator('[data-testid="payment-retry-form"]')).toBeVisible();
    });
  });

  test.describe('Webhook Handling', () => {
    test('should handle subscription creation webhook', async ({ page }) => {
      // This would typically be tested with webhook endpoint mocking
      // For now, we'll test the UI response to subscription state changes
      
      await page.goto('/');
      
      // Simulate webhook updating subscription status
      await page.evaluate(() => {
        // Mock real-time subscription update
        window.dispatchEvent(new CustomEvent('subscription-updated', {
          detail: { status: 'active', plan: 'premium' }
        }));
      });
      
      // Should update UI to reflect premium status
      await expect(page.locator('[data-testid="premium-status-indicator"]')).toBeVisible();
      
      // Premium features should now be accessible
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Premium Test');
      await page.click('[data-testid="confirm-create"]');
      
      await page.click('[data-testid="add-part"]');
      // Should not show premium gate anymore
      await expect(page.locator('[data-testid="premium-feature-gate"]')).not.toBeVisible();
    });

    test('should handle subscription cancellation webhook', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('user_subscription', JSON.stringify({
          status: 'active',
          plan: 'premium'
        }));
      });
      
      await page.goto('/');
      
      // Simulate cancellation webhook
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('subscription-updated', {
          detail: { status: 'canceled', plan: 'free' }
        }));
      });
      
      // Should show cancellation notice
      await expect(page.locator('[data-testid="subscription-canceled-notice"]')).toBeVisible();
      
      // Should revert to free tier limitations
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Post-Cancel Test');
      await page.click('[data-testid="confirm-create"]');
      
      await page.click('[data-testid="add-part"]');
      await page.click('[data-testid="add-part"]');
      // Should show premium gate again
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
    });
  });

  test.describe('Invoice and Billing', () => {
    test('should display billing history', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('user_subscription', JSON.stringify({
          status: 'active',
          plan: 'premium'
        }));
      });
      
      await page.goto('/account/billing');
      
      // Should show billing history
      await expect(page.locator('[data-testid="billing-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="invoice-list"]')).toBeVisible();
      
      // Should show current billing period
      await expect(page.locator('[data-testid="current-period"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-billing-date"]')).toBeVisible();
      
      // Should allow invoice downloads
      await expect(page.locator('[data-testid="download-invoice"]').first()).toBeVisible();
    });

    test('should handle tax calculations', async ({ page }) => {
      await page.goto('/checkout');
      
      // Enter billing address with tax
      await page.fill('[data-testid="billing-country"]', 'US');
      await page.fill('[data-testid="billing-state"]', 'CA');
      await page.fill('[data-testid="billing-zip"]', '90210');
      
      // Should calculate and display tax
      await expect(page.locator('[data-testid="tax-amount"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
      
      // Tax should be included in total
      const subtotal = await page.locator('[data-testid="subtotal"]').textContent();
      const tax = await page.locator('[data-testid="tax-amount"]').textContent();
      const total = await page.locator('[data-testid="total-amount"]').textContent();
      
      expect(total).toBeTruthy();
      expect(tax).toBeTruthy();
    });
  });
});