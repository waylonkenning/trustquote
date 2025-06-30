import { test, expect } from '@playwright/test';

test.describe('Freemium Model', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Free Tier Limitations', () => {
    test('should allow basic kuchi shōga notation for free users', async ({ page }) => {
      // Create composition as free user
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Free User Test');
      await page.click('[data-testid="confirm-create"]');

      // Should be able to use basic notation (don, ka, doko, tsu)
      await page.fill('[data-testid="pattern-input"]', 'don ka don ka');
      await expect(page.locator('[data-testid="pattern-input"]')).toHaveValue('don ka don ka');
      
      // Should be able to use linear grid
      await expect(page.locator('[data-testid="linear-grid"]')).toBeVisible();
      
      // Should have basic audio playback
      await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
    });

    test('should limit compositions to 3 for free users', async ({ page }) => {
      // Create 3 compositions
      for (let i = 1; i <= 3; i++) {
        await page.click('[data-testid="create-composition"]');
        await page.fill('[data-testid="composition-title"]', `Free Composition ${i}`);
        await page.click('[data-testid="confirm-create"]');
        await page.goto('/');
      }

      // Attempt to create 4th composition should show limit warning
      await page.click('[data-testid="create-composition"]');
      await expect(page.locator('[data-testid="composition-limit-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="composition-limit-warning"]')).toContainText('You have reached the limit of 3 compositions');
      
      // Should show upgrade prompt
      await expect(page.locator('[data-testid="upgrade-to-premium"]')).toBeVisible();
    });

    test('should block multi-drum ensemble for free users', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Ensemble Test');
      await page.click('[data-testid="confirm-create"]');

      // First drum part should be allowed
      await page.click('[data-testid="add-part"]');
      await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
      await page.click('[data-testid="confirm-add-part"]');

      // Second drum part should show premium gate
      await page.click('[data-testid="add-part"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toContainText('Multi-drum ensemble coordination is a premium feature');
      await expect(page.locator('[data-testid="upgrade-to-premium"]')).toBeVisible();
    });

    test('should block regional style variations for free users', async ({ page }) => {
      await page.click('[data-testid="settings-button"]');
      
      // Standard notation should be available
      await page.click('[data-testid="notation-style-standard"]');
      await expect(page.locator('[data-testid="notation-style-standard"]')).toBeChecked();

      // Kanto and Kansai should show premium gate
      await page.click('[data-testid="notation-style-kanto"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toContainText('Regional style variations are a premium feature');
      
      await page.click('[data-testid="close-modal"]');
      await page.click('[data-testid="notation-style-kansai"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
    });

    test('should block circular rhythm visualization for free users', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Circular Test');
      await page.click('[data-testid="confirm-create"]');

      // Attempt to switch to circular view
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toContainText('Circular rhythm visualization is a premium feature');
    });

    test('should block export capabilities for free users', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Export Test');
      await page.click('[data-testid="confirm-create"]');

      await page.click('[data-testid="export-menu"]');
      
      // All export options should show premium gate
      await page.click('[data-testid="export-midi"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toContainText('Export capabilities are a premium feature');
      
      await page.click('[data-testid="close-modal"]');
      await page.click('[data-testid="export-sheet-music"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      
      await page.click('[data-testid="close-modal"]');
      await page.click('[data-testid="export-audio"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
    });
  });

  test.describe('Premium Feature Gates', () => {
    test('should show upgrade modal with pricing information', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Premium Test');
      await page.click('[data-testid="confirm-create"]');

      // Trigger premium gate
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      
      // Click upgrade button
      await page.click('[data-testid="upgrade-to-premium"]');
      
      // Should show pricing modal
      await expect(page.locator('[data-testid="pricing-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="premium-features-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="start-free-trial"]')).toBeVisible();
    });

    test('should highlight premium features in feature list', async ({ page }) => {
      await page.click('[data-testid="features-menu"]');
      
      // Premium features should have premium badge
      await expect(page.locator('[data-testid="feature-ensemble-coordination"] [data-testid="premium-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="feature-circular-visualization"] [data-testid="premium-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="feature-regional-styles"] [data-testid="premium-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="feature-export-capabilities"] [data-testid="premium-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="feature-collaboration"] [data-testid="premium-badge"]')).toBeVisible();
      
      // Free features should not have premium badge
      await expect(page.locator('[data-testid="feature-basic-notation"] [data-testid="premium-badge"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="feature-linear-grid"] [data-testid="premium-badge"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="feature-basic-audio"] [data-testid="premium-badge"]')).not.toBeVisible();
    });

    test('should show usage statistics for free tier limits', async ({ page }) => {
      // Create 2 compositions
      for (let i = 1; i <= 2; i++) {
        await page.click('[data-testid="create-composition"]');
        await page.fill('[data-testid="composition-title"]', `Usage Test ${i}`);
        await page.click('[data-testid="confirm-create"]');
        await page.goto('/');
      }

      // Should show usage counter
      await expect(page.locator('[data-testid="composition-usage"]')).toContainText('2 of 3 compositions used');
      
      // Should show progress bar
      await expect(page.locator('[data-testid="composition-usage-bar"]')).toBeVisible();
      
      // Should show upgrade suggestion when approaching limit
      await expect(page.locator('[data-testid="upgrade-suggestion"]')).toBeVisible();
    });
  });

  test.describe('Account State Management', () => {
    test('should persist free tier limitations across sessions', async ({ page, context }) => {
      // Create compositions as free user
      for (let i = 1; i <= 3; i++) {
        await page.click('[data-testid="create-composition"]');
        await page.fill('[data-testid="composition-title"]', `Session Test ${i}`);
        await page.click('[data-testid="confirm-create"]');
        await page.goto('/');
      }

      // Close and reopen browser
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto('/');

      // Should still show composition limit
      await newPage.click('[data-testid="create-composition"]');
      await expect(newPage.locator('[data-testid="composition-limit-warning"]')).toBeVisible();
    });

    test('should track feature usage attempts for analytics', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Analytics Test');
      await page.click('[data-testid="confirm-create"]');

      // Attempt blocked features multiple times
      await page.click('[data-testid="view-toggle-circular"]');
      await page.click('[data-testid="close-modal"]');
      
      await page.click('[data-testid="add-part"]');
      await page.click('[data-testid="close-modal"]');
      
      await page.click('[data-testid="export-menu"]');
      await page.click('[data-testid="export-midi"]');
      await page.click('[data-testid="close-modal"]');

      // Should track these attempts (verified through analytics service mock)
      await expect(page.locator('[data-testid="feature-interest-indicator"]')).toBeVisible();
    });
  });

  test.describe('Upgrade Flow Preparation', () => {
    test('should show subscription management placeholder for logged-out users', async ({ page }) => {
      await page.click('[data-testid="account-menu"]');
      await expect(page.locator('[data-testid="sign-in-required"]')).toBeVisible();
      await expect(page.locator('[data-testid="sign-in-required"]')).toContainText('Sign in to upgrade to premium');
    });

    test('should preserve user work when showing premium gates', async ({ page }) => {
      await page.click('[data-testid="create-composition"]');
      await page.fill('[data-testid="composition-title"]', 'Work Preservation Test');
      await page.click('[data-testid="confirm-create"]');

      // Add some content
      await page.fill('[data-testid="pattern-input"]', 'don ka don ka doko tsu');
      
      // Trigger premium gate
      await page.click('[data-testid="view-toggle-circular"]');
      await expect(page.locator('[data-testid="premium-feature-gate"]')).toBeVisible();
      
      // Close modal and verify work is preserved
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="pattern-input"]')).toHaveValue('don ka don ka doko tsu');
      await expect(page.locator('[data-testid="composition-title"]')).toContainText('Work Preservation Test');
    });
  });
});