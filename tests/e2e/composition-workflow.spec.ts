import { test, expect } from '@playwright/test';

test.describe('Taiko Composition Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create new composition', async ({ page }) => {
    // Click create new composition button
    await page.click('[data-testid="create-composition"]');
    
    // Enter composition title
    await page.fill('[data-testid="composition-title"]', 'Test Piece');
    
    // Select tempo
    await page.fill('[data-testid="tempo-input"]', '120');
    
    // Create composition
    await page.click('[data-testid="confirm-create"]');
    
    // Should navigate to composition editor
    await expect(page).toHaveURL(/\/compose\/.+/);
    await expect(page.locator('[data-testid="composition-title"]')).toContainText('Test Piece');
  });

  test('should add drum parts to composition', async ({ page }) => {
    // Create composition first
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Multi-Part Test');
    await page.click('[data-testid="confirm-create"]');

    // Add chu-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Add shime-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Add o-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'o-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Verify all parts are added
    await expect(page.locator('[data-testid="part-chu-daiko"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-shime-daiko"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-o-daiko"]')).toBeVisible();
  });

  test('should save and load composition', async ({ page }) => {
    // Create and modify composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Save Test');
    await page.click('[data-testid="confirm-create"]');

    // Add some content
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Save composition
    await page.click('[data-testid="save-composition"]');
    await expect(page.locator('[data-testid="save-status"]')).toContainText('Saved');

    // Navigate away and back
    await page.goto('/');
    await page.click('[data-testid="recent-compositions"] >> text=Save Test');

    // Verify composition loaded
    await expect(page.locator('[data-testid="composition-title"]')).toContainText('Save Test');
    await expect(page.locator('[data-testid="part-chu-daiko"]')).toBeVisible();
  });

  test('should export composition in multiple formats', async ({ page }) => {
    // Create composition with content
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Export Test');
    await page.click('[data-testid="confirm-create"]');

    // Add some patterns
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Test kuchi shōga export
    await page.click('[data-testid="export-menu"]');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-kuchi-shoga"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.txt$/);

    // Test MIDI export
    const downloadPromise2 = page.waitForEvent('download');
    await page.click('[data-testid="export-menu"]');
    await page.click('[data-testid="export-midi"]');
    const download2 = await downloadPromise2;
    expect(download2.suggestedFilename()).toMatch(/.*\.mid$/);
  });
});