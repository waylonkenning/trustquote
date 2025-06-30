import { test, expect } from '@playwright/test';

test.describe('Feature Gating and Premium Restrictions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Clear any existing user data to start as anonymous user
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.reload();
  });

  test.describe('Anonymous User Experience', () => {
    test('should show sign-up prompts for premium features without account', async ({ page }) => {
      // Navigate to composition view directly 
      await page.goto('/compose');
      
      // Should stay on compose page but show sign in/up buttons
      await expect(page).toHaveURL('/compose');
      
      // Should show authentication buttons for anonymous users
      await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="sign-up-button"]')).toBeVisible();
      
      // Click sign up should show signup modal or redirect
      await page.click('[data-testid="sign-up-button"]');
      
      // Should show signup modal or redirect to signup page
      try {
        await expect(page.locator('[data-testid="signup-modal"]')).toBeVisible();
      } catch {
        await expect(page).toHaveURL(/\/signup/);
      }
    });

    test('should track feature interest for anonymous users', async ({ page }) => {
      // Navigate to composition view
      await page.goto('/compose');
      
      // Should show sign in/up buttons for anonymous users
      await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="sign-up-button"]')).toBeVisible();
      
      // Create composition button should be disabled or require auth
      const createButton = page.locator('[data-testid="create-composition"]');
      await expect(createButton).toBeVisible();
      
      // Clicking on it should prompt sign up
      await createButton.click();
      
      // Should either show auth modal or redirect to signup
      // This will depend on implementation - checking for common patterns
      try {
        await expect(page.locator('[data-testid="auth-required-modal"]')).toBeVisible();
      } catch {
        // Alternative: might redirect to signup
        await expect(page).toHaveURL(/\/(signup|login)/);
      }
    });
  });

  test.describe('Free User Limits and Restrictions', () => {
    test.beforeEach(async ({ page }) => {
      // Mock logged in free user
      await page.evaluate(() => {
        const freeUser = {
          id: 'free-user-123',
          email: 'freeuser@example.com',
          name: 'Free User',
          subscription: {
            status: 'free',
            plan: 'free'
          },
          usageStats: {
            compositionsCount: 0,
            exportsCount: 0
          }
        };
        localStorage.setItem('user_data', JSON.stringify(freeUser));
        localStorage.setItem('auth_token', 'mock-free-token');
      });
      await page.reload();
      
      // Navigate to composition view
      await page.goto('/compose');
    });

    test('should enforce composition limit with proper messaging', async ({ page }) => {
      // Create compositions up to limit
      for (let i = 1; i <= 3; i++) {
        await page.click('[data-testid="create-composition"]');
        await page.fill('[data-testid="composition-title"]', `Free Composition ${i}`);
        await page.click('[data-testid="confirm-create"]');
        
        // Wait for composition to be created and go back to main view
        await page.waitForTimeout(500);
      }

      // Should show usage indicator
      await expect(page.locator('[data-testid="composition-usage"]')).toContainText('3 / 3 compositions');
      
      // Attempt 4th composition
      await page.click('[data-testid="create-composition"]');
      await expect(page.locator('[data-testid="composition-limit-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="composition-limit-warning"]'))
        .toContainText('You have reached the limit of 3 compositions');

      // Should show contextual upgrade prompt in the composition limit modal
      await expect(page.locator('[data-testid="composition-limit-warning"] [data-testid="upgrade-to-premium"]')).toBeVisible();
      
      // Verify upgrade suggestion content
      await expect(page.locator('[data-testid="upgrade-suggestion"]'))
        .toContainText('Unlimited compositions');
    });

    test('should show progressive usage warnings', async ({ page }) => {
      // Create 2 compositions (approaching limit)
      for (let i = 1; i <= 2; i++) {
        await page.click('[data-testid="create-composition"]');
        await page.fill('[data-testid="composition-title"]', `Warning Test ${i}`);
        await page.click('[data-testid="confirm-create"]');
        await page.goto('/');
      }

      // Should show warning at 80% usage
      await expect(page.locator('[data-testid="composition-usage"]')).toContainText('2 of 3');
      await expect(page.locator('[data-testid="upgrade-suggestion"]')).toBeVisible();
      await expect(page.locator('[data-testid="upgrade-suggestion"]'))
        .toContainText('approaching your free tier limit');
    });

    test('should block ensemble mode for free users', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Basic Composition');
      
      // Ensemble mode should be disabled for free users
      await expect(page.locator('[data-testid="enable-ensemble-mode"]')).toBeDisabled();
      await expect(page.locator('.premium-badge-inline')).toContainText('Premium');
      
      // Create basic composition (single drum, no ensemble)
      await page.click('[data-testid="confirm-create"]');

      // Should still be able to create basic compositions
      await expect(page.locator('.composition-main')).toBeVisible();
    });

    test('should block regional notation styles', async ({ page }) => {
      await page.click('[data-testid="settings-button"]');
      
      // Standard notation should be available
      await page.click('[data-testid="notation-style-standard"]');
      await expect(page.locator('[data-testid="notation-style-standard"]')).toBeChecked();

      // Kanto style should trigger gate
      await page.click('[data-testid="notation-style-kanto"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]'))
        .toContainText('Regional style variations are a premium feature');

      // Context should include style name
      await expect(page.locator('[data-testid="premium-feature-gate"]'))
        .toContainText('Kanto');

      await page.click('[data-testid="close-modal"]');

      // Kansai style should also trigger gate
      await page.click('[data-testid="notation-style-kansai"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]'))
        .toContainText('Kansai');
    });

    test('should block all export formats', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Export Test');
      await page.click('[data-testid="confirm-create"]');

      // Add some content to make export meaningful
      await page.fill('[data-testid="pattern-input"]', 'don ka don ka');
      
      await page.click('[data-testid="export-menu"]');
      
      const exportFormats = ['midi', 'sheet-music', 'audio', 'kuchi-shoga'];
      
      for (const format of exportFormats) {
        await page.click(`[data-testid="export-${format}"]`);
        await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
        await expect(page.locator('[data-testid="premium-feature-gate"]'))
          .toContainText('Export capabilities are a premium feature');
        
        // Should show format in context
        await expect(page.locator('[data-testid="premium-feature-gate"]'))
          .toContainText(format.toUpperCase(), { ignoreCase: true });
          
        await page.click('[data-testid="close-modal"]');
      }
    });

    test('should block circular visualization', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Circular Test');
      await page.click('[data-testid="confirm-create"]');

      // Linear view should be active by default
      await expect(page.locator('[data-testid="linear-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="view-toggle-linear"]')).toHaveClass(/active/);

      // Circular view should trigger gate
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]'))
        .toContainText('Circular rhythm visualization is a premium feature');

      // Should stay in linear view after closing gate
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="linear-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="view-toggle-linear"]')).toHaveClass(/active/);
    });

    test('should preserve user work when showing premium gates', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Work Preservation');
      await page.click('[data-testid="confirm-create"]');

      // Add substantial content
      await page.fill('[data-testid="pattern-input"]', 'don ka don ka doko tsu don ka');
      await page.fill('[data-testid="tempo-input"]', '120');
      
      // Trigger premium gate
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      
      // Close and verify work preserved
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="pattern-input"]'))
        .toHaveValue('don ka don ka doko tsu don ka');
      await expect(page.locator('[data-testid="tempo-input"]')).toHaveValue('120');
      await expect(page.locator('[data-testid="composition-title"]'))
        .toContainText('Work Preservation');
    });
  });

  test.describe('Premium Feature Access', () => {
    test.beforeEach(async ({ page }) => {
      // Mock premium user
      await page.evaluate(() => {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        
        const premiumUser = {
          id: 'premium-user-123',
          email: 'premium@example.com',
          name: 'Premium User',
          subscription: {
            status: 'trialing',
            plan: 'premium',
            trialEnd: trialEnd.toISOString(),
            currentPeriodEnd: null
          }
        };
        localStorage.setItem('user_data', JSON.stringify(premiumUser));
        localStorage.setItem('auth_token', 'mock-premium-token');
      });
      await page.reload();
    });

    test('should allow unlimited compositions for premium users', async ({ page }) => {
      // Create many compositions without limit
      for (let i = 1; i <= 5; i++) {
        await page.click('[data-testid="create-composition"]');
        await page.fill('[data-testid="composition-title"]', `Premium Composition ${i}`);
        await page.click('[data-testid="confirm-create"]');
        await page.goto('/');
      }

      // Should show unlimited usage
      await expect(page.locator('[data-testid="composition-usage"]'))
        .toContainText('5 of ∞');
      
      // Should not show upgrade suggestions
      await expect(page.locator('[data-testid="upgrade-suggestion"]')).not.toBeVisible();
    });

    test('should allow multi-drum ensemble creation', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Premium Ensemble');
      await page.click('[data-testid="confirm-create"]');

      // Add multiple drum parts
      const drumTypes = ['chu-daiko', 'ko-daiko', 'o-daiko', 'shinobue'];
      
      for (let i = 0; i < drumTypes.length; i++) {
        await page.click('[data-testid="add-part"]');
        await page.selectOption('[data-testid="drum-type"]', drumTypes[i]);
        await page.click('[data-testid="confirm-add-part"]');
        await expect(page.locator(`[data-testid="drum-part-${i + 1}"]`)).toBeVisible();
      }

      // Should not trigger any premium gates
      await expect(page.locator('[data-testid="premium-feature-gate"]')).not.toBeVisible();
    });

    test('should allow regional notation styles', async ({ page }) => {
      await page.click('[data-testid="settings-button"]');
      
      const styles = ['standard', 'kanto', 'kansai'];
      
      for (const style of styles) {
        await page.click(`[data-testid="notation-style-${style}"]`);
        await expect(page.locator(`[data-testid="notation-style-${style}"]`)).toBeChecked();
        
        // Should not trigger premium gate
        await expect(page.locator('[data-testid="premium-feature-gate"]')).not.toBeVisible();
      }
    });

    test('should allow circular visualization', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Circular Premium');
      await page.click('[data-testid="confirm-create"]');

      // Should be able to switch to circular view
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="circular-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="view-toggle-circular"]')).toHaveClass(/active/);

      // Should not trigger premium gate
      await expect(page.locator('[data-testid="premium-feature-gate"]')).not.toBeVisible();
    });

    test('should allow all export formats', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Premium Export');
      await page.click('[data-testid="confirm-create"]');

      await page.fill('[data-testid="pattern-input"]', 'don ka don ka');
      await page.click('[data-testid="export-menu"]');
      
      const exportFormats = ['midi', 'sheet-music', 'audio', 'kuchi-shoga'];
      
      for (const format of exportFormats) {
        await page.click(`[data-testid="export-${format}"]`);
        
        // Should proceed to export dialog, not premium gate
        await expect(page.locator('[data-testid="export-dialog"]')).toBeVisible();
        await expect(page.locator('[data-testid="premium-feature-gate"]')).not.toBeVisible();
        
        await page.click('[data-testid="cancel-export"]');
      }
    });

    test('should show trial status in account dashboard', async ({ page }) => {
      await page.click('[data-testid="account-menu"]');
      await page.click('[data-testid="account-dashboard"]');
      
      await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Trial Active');
      await expect(page.locator('[data-testid="trial-days-remaining"]')).toBeVisible();
      await expect(page.locator('[data-testid="trial-end-date"]')).toBeVisible();
      
      // Should show trial expiry warning
      await expect(page.locator('[data-testid="trial-reminder"]')).toBeVisible();
    });
  });

  test.describe('Subscription Transitions', () => {
    test('should handle trial expiry gracefully', async ({ page }) => {
      // Mock expired trial user
      await page.evaluate(() => {
        const expiredTrialUser = {
          id: 'expired-trial-123',
          email: 'expired@example.com',
          name: 'Expired Trial User',
          subscription: {
            status: 'free',
            plan: 'free',
            trialEnd: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
          }
        };
        localStorage.setItem('user_data', JSON.stringify(expiredTrialUser));
        localStorage.setItem('auth_token', 'mock-expired-token');
      });
      await page.reload();

      // Should show expired trial message
      await expect(page.locator('[data-testid="trial-expired-banner"]')).toBeVisible();
      
      // Premium features should now be blocked
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Post-Trial Test');
      await page.click('[data-testid="confirm-create"]');
      
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
    });

    test('should handle subscription cancellation', async ({ page }) => {
      // Mock cancelled subscription user
      await page.evaluate(() => {
        const cancelledUser = {
          id: 'cancelled-123',
          email: 'cancelled@example.com',
          name: 'Cancelled User',
          subscription: {
            status: 'canceled',
            plan: 'free',
            cancelAtPeriodEnd: true,
            currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Week from now
          }
        };
        localStorage.setItem('user_data', JSON.stringify(cancelledUser));
        localStorage.setItem('auth_token', 'mock-cancelled-token');
      });
      await page.reload();

      // Should show cancellation notice
      await expect(page.locator('[data-testid="cancellation-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="reactivation-offer"]')).toBeVisible();
      
      // Should still have access until period end
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Cancelled Test');
      await page.click('[data-testid="confirm-create"]');
      
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="circular-grid"]')).toBeVisible();
    });
  });

  test.describe('Upgrade Flow Integration', () => {
    test('should seamlessly upgrade from premium gate', async ({ page }) => {
      // Start as free user
      await page.evaluate(() => {
        const freeUser = {
          id: 'upgrade-test-123',
          email: 'upgrade@example.com',
          name: 'Upgrade Test User',
          subscription: {
            status: 'free',
            plan: 'free'
          }
        };
        localStorage.setItem('user_data', JSON.stringify(freeUser));
        localStorage.setItem('auth_token', 'mock-upgrade-token');
      });
      await page.reload();

      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Upgrade Flow Test');
      await page.click('[data-testid="confirm-create"]');

      // Trigger premium gate
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      
      // Start upgrade process
      await page.click('[data-testid="upgrade-to-premium"]');
      await expect(page).toHaveURL(/\/checkout.*plan=premium/);
      
      // Should preserve feature context in URL
      await expect(page).toHaveURL(/feature=circular-visualization/);
    });

    test('should show feature-specific benefits in upgrade modal', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Benefits Test');
      await page.click('[data-testid="confirm-create"]');

      // Trigger ensemble coordination gate
      await page.click('[data-testid="add-part"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      
      // Should highlight ensemble features
      await expect(page.locator('[data-testid="premium-benefits"]'))
        .toContainText('Multi-drum ensemble coordination');
      await expect(page.locator('[data-testid="premium-benefits"]'))
        .toContainText('Unlimited compositions');
      
      // Show all features link
      await page.click('[data-testid="view-all-features"]');
      await expect(page.locator('[data-testid="pricing-modal"]')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid feature IDs gracefully', async ({ page }) => {
      // Simulate triggering gate for non-existent feature
      await page.evaluate(() => {
        // @ts-ignore - accessing global subscription service
        window.subscriptionService?.triggerPremiumGate('invalid-feature');
      });

      // Should show generic premium gate
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]'))
        .toContainText('Premium Feature');
    });

    test('should handle network errors during upgrade', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/subscription/**', route => route.abort());

      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Network Error Test');
      await page.click('[data-testid="confirm-create"]');

      await page.click('[data-testid="view-toggle-circular"]');
      await page.click('[data-testid="upgrade-to-premium"]');
      
      // Should handle gracefully (redirect to checkout page would still work)
      await expect(page).toHaveURL(/\/checkout/);
    });

    test('should handle rapid feature access attempts', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Rapid Access Test');
      await page.click('[data-testid="confirm-create"]');

      // Rapidly trigger premium gates
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="view-toggle-circular"]');
        await page.click('[data-testid="close-modal"]');
      }

      // Should track all attempts without breaking
      const gateEvents = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('premium_gate_events') || '[]');
      });
      expect(gateEvents.length).toBeGreaterThanOrEqual(5);
    });
  });
});