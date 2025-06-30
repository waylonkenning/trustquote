import { test, expect } from '@playwright/test';

test.describe('Anonymous User Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compose');
    
    // Clear any existing user data to ensure anonymous state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.reload();
  });

  test('should allow anonymous users to create compositions immediately', async ({ page }) => {
    // Should show guest mode indicator
    await expect(page.locator('.anonymous-badge')).toContainText('Guest Mode');
    await expect(page.locator('.anonymous-note')).toContainText('Sign up to save your work');
    
    // Should show sign in/up buttons
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-up-button"]')).toBeVisible();
    
    // Should be able to create composition without restrictions
    await page.click('[data-testid="create-composition"]');
    await expect(page.locator('[data-testid="composition-title"]')).toBeVisible();
    
    // Fill out composition details
    await page.fill('[data-testid="composition-title"]', 'My First Taiko Piece');
    await page.fill('[data-testid="tempo-input"]', '140');
    
    // Should show guest mode notice
    await expect(page.locator('.guest-mode-notice')).toContainText('Guest Mode');
    
    // Create the composition
    await page.click('[data-testid="confirm-create"]');
    
    // Should show the composition is created
    await expect(page.locator('[data-testid="create-composition"]')).toContainText('New Composition');
    
    // Should show save prompt button
    await expect(page.locator('[data-testid="save-composition"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-composition"]')).toContainText('💾 Save Your Work');
  });

  test('should show save prompt when anonymous user tries to save', async ({ page }) => {
    // Create a composition first
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Test Composition');
    await page.click('[data-testid="confirm-create"]');
    
    // Wait for save button and force click to avoid stability issues
    await page.waitForSelector('[data-testid="save-composition"]', { state: 'visible' });
    await page.click('[data-testid="save-composition"]', { force: true });
    
    // Should show save prompt modal
    await expect(page.locator('[data-testid="save-prompt-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-prompt-modal"] h2')).toContainText('💾 Save Your Composition');
    
    // Should show composition details
    await expect(page.locator('.composition-preview h3')).toContainText('Test Composition');
    
    // Should show sign up option
    await expect(page.locator('[data-testid="signup-and-save"]')).toBeVisible();
    await expect(page.locator('[data-testid="signup-and-save"]')).toContainText('Sign Up & Save');
    
    // Should show download option
    await expect(page.locator('[data-testid="download-composition"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-composition"]')).toContainText('Download JSON');
  });

  test('should allow anonymous users to download compositions', async ({ page }) => {
    // Create a composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Download Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Open save prompt
    await page.waitForSelector('[data-testid="save-composition"]', { state: 'visible' });
    await page.click('[data-testid="save-composition"]', { force: true });
    
    // Set up download monitoring
    const downloadPromise = page.waitForEvent('download');
    
    // Click download
    await page.click('[data-testid="download-composition"]');
    
    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Download Test.json');
    
    // Modal should close after download
    await expect(page.locator('[data-testid="save-prompt-modal"]')).not.toBeVisible();
  });

  test('should redirect to signup when choosing sign up and save', async ({ page }) => {
    // Create a composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Signup Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Open save prompt
    await page.waitForSelector('[data-testid="save-composition"]', { state: 'visible' });
    await page.click('[data-testid="save-composition"]', { force: true });
    
    // Click sign up and save
    await page.click('[data-testid="signup-and-save"]');
    
    // Should redirect to signup with save parameter
    await expect(page).toHaveURL(/\/signup.*save=true/);
  });

  test('should allow anonymous users to access basic features', async ({ page }) => {
    // Create a composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Feature Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Should be able to access settings
    await page.click('[data-testid="settings-menu"]');
    
    // Settings should open (basic check)
    await expect(page.locator('[data-testid="notation-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="regional-style"]')).toBeVisible();
  });

  test('should store anonymous compositions in localStorage', async ({ page }) => {
    // Create a composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'LocalStorage Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Check that composition is stored in localStorage
    const storedCompositions = await page.evaluate(() => {
      return localStorage.getItem('anonymous_compositions');
    });
    
    expect(storedCompositions).toBeTruthy();
    
    const compositions = JSON.parse(storedCompositions);
    expect(compositions).toHaveLength(1);
    expect(compositions[0].title).toBe('LocalStorage Test');
    expect(compositions[0].isAnonymous).toBe(true);
  });

  test('should show auth prompts for premium features', async ({ page }) => {
    // Create a composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Premium Test');
    
    // Try to enable ensemble mode (should be disabled for anonymous users)
    const ensembleCheckbox = page.locator('[data-testid="enable-ensemble-mode"]');
    await expect(ensembleCheckbox).toBeDisabled();
    
    // Should show premium badge
    await expect(page.locator('.premium-badge-inline')).toContainText('Premium');
  });
});