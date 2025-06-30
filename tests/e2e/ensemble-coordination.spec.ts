import { test, expect } from '@playwright/test';

test.describe('Ensemble Coordination System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create ensemble composition with multiple drum types', async ({ page }) => {
    // Create new ensemble composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Ensemble Test');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');

    // Should be in ensemble mode
    await expect(page.locator('[data-testid="ensemble-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="ensemble-controls"]')).toBeVisible();

    // Add chu-daiko part (main drum)
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.selectOption('[data-testid="drum-role"]', 'lead');
    await page.click('[data-testid="confirm-add-part"]');

    // Add shime-daiko part (high pitch)
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.selectOption('[data-testid="drum-role"]', 'accompaniment');
    await page.click('[data-testid="confirm-add-part"]');

    // Add o-daiko part (large drum)
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'o-daiko');
    await page.selectOption('[data-testid="drum-role"]', 'foundation');
    await page.click('[data-testid="confirm-add-part"]');

    // Verify all parts are added with correct roles
    await expect(page.locator('[data-testid="part-chu-daiko"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-shime-daiko"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-o-daiko"]')).toBeVisible();

    // Check role indicators
    await expect(page.locator('[data-testid="part-chu-daiko"] [data-testid="role-indicator"]')).toContainText('Lead');
    await expect(page.locator('[data-testid="part-shime-daiko"] [data-testid="role-indicator"]')).toContainText('Accompaniment');
    await expect(page.locator('[data-testid="part-o-daiko"] [data-testid="role-indicator"]')).toContainText('Foundation');
  });

  test('should display ensemble overview with all parts', async ({ page }) => {
    // Create ensemble composition
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Multi-Part Ensemble');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');

    // Add multiple parts
    const drumTypes = ['chu-daiko', 'shime-daiko', 'o-daiko', 'atarigane'];
    for (const drumType of drumTypes) {
      await page.click('[data-testid="add-part"]');
      await page.selectOption('[data-testid="drum-type"]', drumType);
      await page.click('[data-testid="confirm-add-part"]');
    }

    // Switch to ensemble overview
    await page.click('[data-testid="ensemble-overview"]');

    // Should show all parts in grid layout
    await expect(page.locator('[data-testid="ensemble-grid"]')).toBeVisible();
    
    for (const drumType of drumTypes) {
      await expect(page.locator(`[data-testid="overview-${drumType}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="overview-${drumType}"] [data-testid="drum-icon"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="overview-${drumType}"] [data-testid="pattern-preview"]`)).toBeVisible();
    }

    // Should show ensemble statistics
    await expect(page.locator('[data-testid="ensemble-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-parts"]')).toContainText('4');
    await expect(page.locator('[data-testid="ensemble-complexity"]')).toBeVisible();
  });

  test('should manage drum-specific pattern constraints', async ({ page }) => {
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Pattern Constraints Test');
    await page.click('[data-testid="confirm-create"]');

    // Add chu-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Enter chu-daiko pattern
    await page.click('[data-testid="part-chu-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');

    // Should show appropriate syllables for chu-daiko
    await expect(page.locator('[data-testid="syllable-don"]')).toBeVisible();
    await expect(page.locator('[data-testid="syllable-ka"]')).toBeVisible();
    await expect(page.locator('[data-testid="syllable-doko"]')).toBeVisible();
    await expect(page.locator('[data-testid="syllable-tsu"]')).toBeVisible();

    // Add shime-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Enter shime-daiko pattern
    await page.click('[data-testid="part-shime-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'ka te ka te');

    // Should show different syllables for shime-daiko
    await expect(page.locator('[data-testid="syllable-ka"]')).toBeVisible();
    await expect(page.locator('[data-testid="syllable-te"]')).toBeVisible();
    // Don should not be prominently suggested for shime-daiko
    await expect(page.locator('[data-testid="syllable-don"]')).not.toBeVisible();

    // Add o-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'o-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Enter o-daiko pattern
    await page.click('[data-testid="part-o-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'don - don -');

    // Should show deep/powerful syllables for o-daiko
    await expect(page.locator('[data-testid="syllable-don"]')).toBeVisible();
    // High-pitched syllables should not be suggested
    await expect(page.locator('[data-testid="syllable-ka"]')).not.toBeVisible();
  });

  test('should handle ensemble volume balancing', async ({ page }) => {
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Volume Balance Test');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');

    // Add multiple parts with different volumes
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'o-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Open ensemble mixer
    await page.click('[data-testid="ensemble-mixer"]');
    await expect(page.locator('[data-testid="mixer-panel"]')).toBeVisible();

    // Check default volume levels are appropriate for each drum type
    // O-daiko should be louder by default
    const oDaikoVolume = await page.locator('[data-testid="volume-o-daiko"]').inputValue();
    expect(parseInt(oDaikoVolume)).toBeGreaterThan(70);

    // Shime-daiko should be moderate
    const shimeDaikoVolume = await page.locator('[data-testid="volume-shime-daiko"]').inputValue();
    expect(parseInt(shimeDaikoVolume)).toBeLessThan(80);

    // Adjust volumes
    await page.fill('[data-testid="volume-o-daiko"]', '90');
    await page.fill('[data-testid="volume-chu-daiko"]', '75');
    await page.fill('[data-testid="volume-shime-daiko"]', '60');

    // Should show volume balance indicator
    await expect(page.locator('[data-testid="balance-indicator"]')).toBeVisible();
    
    // Test auto-balance feature
    await page.click('[data-testid="auto-balance"]');
    
    // Volumes should be automatically adjusted
    const newODaikoVolume = await page.locator('[data-testid="volume-o-daiko"]').inputValue();
    const newChuDaikoVolume = await page.locator('[data-testid="volume-chu-daiko"]').inputValue();
    const newShimeDaikoVolume = await page.locator('[data-testid="volume-shime-daiko"]').inputValue();
    
    expect(parseInt(newODaikoVolume)).toBeGreaterThan(parseInt(newShimeDaikoVolume));
  });

  test('should coordinate ensemble playback', async ({ page }) => {
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Ensemble Playback Test');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');

    // Add parts with patterns
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    await page.click('[data-testid="part-chu-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');

    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    await page.click('[data-testid="part-shime-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'ka te ka te');

    // Test ensemble playback controls
    await page.click('[data-testid="ensemble-controls"]');
    await expect(page.locator('[data-testid="ensemble-play"]')).toBeVisible();
    await expect(page.locator('[data-testid="ensemble-stop"]')).toBeVisible();
    await expect(page.locator('[data-testid="ensemble-tempo"]')).toBeVisible();

    // Start ensemble playback
    await page.click('[data-testid="ensemble-play"]');
    
    // All parts should show playing state
    await expect(page.locator('[data-testid="part-chu-daiko"] [data-testid="playing-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-shime-daiko"] [data-testid="playing-indicator"]')).toBeVisible();

    // Should show synchronized beat indicators
    await expect(page.locator('[data-testid="ensemble-beat-indicator"]')).toBeVisible();

    // Stop playback
    await page.click('[data-testid="ensemble-stop"]');
    
    // Playing indicators should disappear
    await expect(page.locator('[data-testid="part-chu-daiko"] [data-testid="playing-indicator"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="part-shime-daiko"] [data-testid="playing-indicator"]')).not.toBeVisible();
  });

  test('should manage part muting and soloing', async ({ page }) => {
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Mute Solo Test');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');

    // Add multiple parts
    const parts = ['chu-daiko', 'shime-daiko', 'o-daiko'];
    for (const part of parts) {
      await page.click('[data-testid="add-part"]');
      await page.selectOption('[data-testid="drum-type"]', part);
      await page.click('[data-testid="confirm-add-part"]');
    }

    // Test muting individual parts
    await page.click('[data-testid="part-chu-daiko"] [data-testid="mute-button"]');
    await expect(page.locator('[data-testid="part-chu-daiko"]')).toHaveClass(/muted/);
    await expect(page.locator('[data-testid="part-chu-daiko"] [data-testid="mute-button"]')).toHaveClass(/active/);

    // Test soloing a part
    await page.click('[data-testid="part-shime-daiko"] [data-testid="solo-button"]');
    await expect(page.locator('[data-testid="part-shime-daiko"]')).toHaveClass(/solo/);
    await expect(page.locator('[data-testid="part-chu-daiko"]')).toHaveClass(/muted/);
    await expect(page.locator('[data-testid="part-o-daiko"]')).toHaveClass(/muted/);

    // Clear solo
    await page.click('[data-testid="part-shime-daiko"] [data-testid="solo-button"]');
    await expect(page.locator('[data-testid="part-shime-daiko"]')).not.toHaveClass(/solo/);
    await expect(page.locator('[data-testid="part-o-daiko"]')).not.toHaveClass(/muted/);

    // Unmute chu-daiko
    await page.click('[data-testid="part-chu-daiko"] [data-testid="mute-button"]');
    await expect(page.locator('[data-testid="part-chu-daiko"]')).not.toHaveClass(/muted/);
  });

  test('should display traditional ensemble roles and hierarchy', async ({ page }) => {
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Traditional Roles Test');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');

    // Add parts with traditional roles
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'o-daiko');
    await page.selectOption('[data-testid="drum-role"]', 'foundation');
    await page.click('[data-testid="confirm-add-part"]');

    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.selectOption('[data-testid="drum-role"]', 'lead');
    await page.click('[data-testid="confirm-add-part"]');

    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.selectOption('[data-testid="drum-role"]', 'accompaniment');
    await page.click('[data-testid="confirm-add-part"]');

    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'atarigane');
    await page.selectOption('[data-testid="drum-role"]', 'accent');
    await page.click('[data-testid="confirm-add-part"]');

    // Switch to hierarchy view
    await page.click('[data-testid="hierarchy-view"]');
    await expect(page.locator('[data-testid="ensemble-hierarchy"]')).toBeVisible();

    // Should show parts in traditional order
    const hierarchyOrder = await page.locator('[data-testid="hierarchy-order"] [data-testid="drum-role"]').allTextContents();
    expect(hierarchyOrder[0]).toContain('Foundation');
    expect(hierarchyOrder[1]).toContain('Lead');
    expect(hierarchyOrder[2]).toContain('Accompaniment');
    expect(hierarchyOrder[3]).toContain('Accent');

    // Should show role descriptions
    await expect(page.locator('[data-testid="role-description-foundation"]')).toContainText('provides rhythmic foundation');
    await expect(page.locator('[data-testid="role-description-lead"]')).toContainText('leads melodic patterns');
    await expect(page.locator('[data-testid="role-description-accompaniment"]')).toContainText('supports with counter-rhythms');
    await expect(page.locator('[data-testid="role-description-accent"]')).toContainText('adds metallic accents');
  });

  test('should handle ensemble pattern synchronization', async ({ page }) => {
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Pattern Sync Test');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');

    // Add multiple parts
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');

    // Add patterns of different lengths
    await page.click('[data-testid="part-chu-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');

    await page.click('[data-testid="part-shime-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'ka te');

    // Open synchronization panel
    await page.click('[data-testid="sync-panel"]');
    await expect(page.locator('[data-testid="pattern-lengths"]')).toBeVisible();

    // Should show pattern length mismatch warning
    await expect(page.locator('[data-testid="length-mismatch-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="chu-daiko-length"]')).toContainText('4 beats');
    await expect(page.locator('[data-testid="shime-daiko-length"]')).toContainText('2 beats');

    // Test auto-sync feature
    await page.click('[data-testid="auto-sync-patterns"]');
    
    // Should suggest synchronization options
    await expect(page.locator('[data-testid="sync-options"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-to-longest"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-to-lcm"]')).toBeVisible();

    // Apply LCM synchronization
    await page.click('[data-testid="sync-to-lcm"]');
    
    // Patterns should be synchronized to 4-beat cycles
    const chuDaikoText = await page.locator('[data-testid="part-chu-daiko"] [data-testid="text-input"]').inputValue();
    const shimeDaikoText = await page.locator('[data-testid="part-shime-daiko"] [data-testid="text-input"]').inputValue();
    
    expect(chuDaikoText.split(' ').length).toBe(shimeDaikoText.split(' ').length);
  });
});