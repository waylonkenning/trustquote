import { test, expect } from '@playwright/test';

test.describe('Kuchi Shōga Notation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Create a composition to work with
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Notation Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Add a chu-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
  });

  test('should input basic kuchi shōga syllables', async ({ page }) => {
    // Click on pattern editor
    await page.click('[data-testid="pattern-editor"]');
    
    // Input don syllable
    await page.keyboard.type('don');
    await expect(page.locator('[data-testid="syllable-don"]')).toBeVisible();
    
    // Input ka syllable
    await page.keyboard.type(' ka');
    await expect(page.locator('[data-testid="syllable-ka"]')).toBeVisible();
    
    // Input doko pattern
    await page.keyboard.type(' doko');
    await expect(page.locator('[data-testid="syllable-doko"]')).toBeVisible();
    
    // Input tsu syllable
    await page.keyboard.type(' tsu');
    await expect(page.locator('[data-testid="syllable-tsu"]')).toBeVisible();
  });

  test('should validate kuchi shōga syllables', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Input valid syllables
    await page.keyboard.type('don ka doko tsu');
    await expect(page.locator('[data-testid="validation-error"]')).not.toBeVisible();
    
    // Input invalid syllable
    await page.keyboard.type(' invalid');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Unknown syllable: invalid');
  });

  test('should show syllable pronunciation guide', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Click on pronunciation guide
    await page.click('[data-testid="pronunciation-guide"]');
    
    // Check that guide is visible with syllables
    await expect(page.locator('[data-testid="guide-don"]')).toBeVisible();
    await expect(page.locator('[data-testid="guide-ka"]')).toBeVisible();
    await expect(page.locator('[data-testid="guide-doko"]')).toBeVisible();
    await expect(page.locator('[data-testid="guide-tsu"]')).toBeVisible();
    
    // Check audio examples
    await page.click('[data-testid="play-don"]');
    // Audio should play (would need to test audio context in real implementation)
  });

  test('should convert between kuchi shōga and visual notation', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Input kuchi shōga pattern
    await page.keyboard.type('don ka doko tsu');
    
    // Switch to visual notation view
    await page.click('[data-testid="view-visual"]');
    
    // Check that visual notation is displayed
    await expect(page.locator('[data-testid="visual-notation"]')).toBeVisible();
    await expect(page.locator('[data-testid="beat-1"]')).toHaveAttribute('data-syllable', 'don');
    await expect(page.locator('[data-testid="beat-2"]')).toHaveAttribute('data-syllable', 'ka');
    
    // Switch back to text view
    await page.click('[data-testid="view-text"]');
    await expect(page.locator('[data-testid="text-input"]')).toHaveValue('don ka doko tsu');
  });

  test('should support regional kuchi shōga variations', async ({ page }) => {
    // Open settings
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notation-settings"]');
    
    // Change to Kanto style
    await page.selectOption('[data-testid="regional-style"]', 'kanto');
    await page.click('[data-testid="save-settings"]');
    
    // Test regional variations
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ko don ko');
    
    // Switch to Kansai style
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notation-settings"]');
    await page.selectOption('[data-testid="regional-style"]', 'kansai');
    await page.click('[data-testid="save-settings"]');
    
    // Should show conversion option or warning
    await expect(page.locator('[data-testid="style-conversion"]')).toBeVisible();
  });

  test('should support hand sticking notation', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Enable sticking notation
    await page.click('[data-testid="show-sticking"]');
    
    // Input pattern with hand indicators
    await page.keyboard.type('don(R) ka(L) doko(RL) tsu(R)');
    
    // Check sticking indicators are shown
    await expect(page.locator('[data-testid="sticking-R"]')).toBeVisible();
    await expect(page.locator('[data-testid="sticking-L"]')).toBeVisible();
    await expect(page.locator('[data-testid="sticking-RL"]')).toBeVisible();
  });

  test('should auto-complete common patterns', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Type partial pattern name
    await page.keyboard.type('matsuri');
    
    // Should show autocomplete suggestions
    await expect(page.locator('[data-testid="autocomplete"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggestion-matsuri-basic"]')).toBeVisible();
    
    // Select suggestion
    await page.click('[data-testid="suggestion-matsuri-basic"]');
    
    // Should fill in the pattern
    await expect(page.locator('[data-testid="text-input"]')).toHaveValue('don ka doko don ka doko don tsu');
  });

  test('should play kuchi shōga audio', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu');
    
    // Play the pattern
    await page.click('[data-testid="play-pattern"]');
    
    // Should show playing state
    await expect(page.locator('[data-testid="play-button"]')).toHaveClass(/playing/);
    
    // Stop playback
    await page.click('[data-testid="stop-pattern"]');
    await expect(page.locator('[data-testid="play-button"]')).not.toHaveClass(/playing/);
  });

  test('should support pattern looping and tempo adjustment', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu');
    
    // Enable loop
    await page.click('[data-testid="loop-toggle"]');
    await expect(page.locator('[data-testid="loop-toggle"]')).toHaveClass(/active/);
    
    // Adjust tempo
    await page.fill('[data-testid="tempo-slider"]', '140');
    await expect(page.locator('[data-testid="tempo-display"]')).toContainText('140 BPM');
    
    // Play with loop and tempo
    await page.click('[data-testid="play-pattern"]');
    await expect(page.locator('[data-testid="play-button"]')).toHaveClass(/playing/);
  });
});