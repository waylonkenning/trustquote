import { test, expect } from '@playwright/test';

test.describe('Audio Playback System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a composition to work with
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Audio Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Add a part for testing
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
  });

  test('should have audio playback controls', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Should show playback controls
    await expect(page.locator('[data-testid="play-pattern"]')).toBeVisible();
    await expect(page.locator('[data-testid="stop-pattern"]')).toBeVisible();
    await expect(page.locator('[data-testid="loop-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="tempo-slider"]')).toBeVisible();
    await expect(page.locator('[data-testid="tempo-display"]')).toBeVisible();
    
    // Should show volume control
    await expect(page.locator('[data-testid="volume-control"]')).toBeVisible();
    await expect(page.locator('[data-testid="volume-slider"]')).toBeVisible();
  });

  test('should play individual syllables', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add a pattern with different syllables
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');
    
    // Test individual syllable playback buttons
    await expect(page.locator('[data-testid="play-syllable-don"]')).toBeVisible();
    await expect(page.locator('[data-testid="play-syllable-ka"]')).toBeVisible();
    await expect(page.locator('[data-testid="play-syllable-doko"]')).toBeVisible();
    await expect(page.locator('[data-testid="play-syllable-tsu"]')).toBeVisible();
    
    // Click individual syllable should trigger audio
    await page.click('[data-testid="play-syllable-don"]');
    
    // Should show audio feedback indicator
    await expect(page.locator('[data-testid="audio-feedback-don"]')).toBeVisible();
  });

  test('should play pattern with tempo synchronization', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add a test pattern
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');
    
    // Set tempo
    await page.fill('[data-testid="tempo-slider"]', '100');
    
    // Start playback
    await page.click('[data-testid="play-pattern"]');
    
    // Should show playing state
    await expect(page.locator('[data-testid="play-pattern"]')).toContainText('Stop');
    await expect(page.locator('[data-testid="playback-status"]')).toContainText('Playing');
    
    // Should show beat indicator
    await expect(page.locator('[data-testid="beat-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-beat"]')).toBeVisible();
    
    // Should show progress indicator
    await expect(page.locator('[data-testid="playback-progress"]')).toBeVisible();
    
    // Stop playback
    await page.click('[data-testid="stop-pattern"]');
    await expect(page.locator('[data-testid="playback-status"]')).toContainText('Stopped');
  });

  test('should support loop mode', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add a short pattern
    await page.fill('[data-testid="text-input"]', 'don ka');
    
    // Enable loop mode
    await page.check('[data-testid="loop-toggle"]');
    await expect(page.locator('[data-testid="loop-toggle"]')).toBeChecked();
    
    // Start playback
    await page.click('[data-testid="play-pattern"]');
    
    // Should show loop indicator
    await expect(page.locator('[data-testid="loop-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="loop-count"]')).toBeVisible();
    
    // Let it play for a moment then stop
    await page.waitForTimeout(2000);
    await page.click('[data-testid="stop-pattern"]');
  });

  test('should adjust tempo and update playback speed', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add pattern
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');
    
    // Test different tempos
    const tempos = ['60', '120', '180'];
    
    for (const tempo of tempos) {
      await page.fill('[data-testid="tempo-slider"]', tempo);
      await expect(page.locator('[data-testid="tempo-display"]')).toContainText(`${tempo} BPM`);
      
      // Start and stop playback to test tempo
      await page.click('[data-testid="play-pattern"]');
      await page.waitForTimeout(1000);
      await page.click('[data-testid="stop-pattern"]');
    }
  });

  test('should show visual beat indicators during playback', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add pattern
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');
    
    // Switch to visual mode
    await page.click('[data-testid="view-visual"]');
    
    // Start playback
    await page.click('[data-testid="play-pattern"]');
    
    // Should show beat highlighting on grid
    await expect(page.locator('[data-testid="beat-1"].playing')).toBeVisible();
    
    // Should show metronome visual
    await expect(page.locator('[data-testid="metronome-indicator"]')).toBeVisible();
    
    await page.click('[data-testid="stop-pattern"]');
  });

  test('should support different drum type sounds', async ({ page }) => {
    // Test different drum types have different audio characteristics
    const drumTypes = ['chu-daiko', 'shime-daiko', 'o-daiko', 'atarigane'];
    
    for (const drumType of drumTypes) {
      // Add part for this drum type
      await page.click('[data-testid="add-part"]');
      await page.selectOption('[data-testid="drum-type"]', drumType);
      await page.click('[data-testid="confirm-add-part"]');
      
      // Test audio properties for this drum type
      await page.click(`[data-testid="part-${drumType}"] [data-testid="pattern-editor"]`);
      await page.fill('[data-testid="text-input"]', 'don');
      
      // Should show drum-specific audio settings
      await expect(page.locator('[data-testid="audio-settings"]')).toBeVisible();
      await expect(page.locator(`[data-testid="drum-timbre-${drumType}"]`)).toBeVisible();
      
      // Test playback
      await page.click('[data-testid="play-pattern"]');
      await page.waitForTimeout(500);
      await page.click('[data-testid="stop-pattern"]');
    }
  });

  test('should handle ensemble audio coordination', async ({ page }) => {
    // Create ensemble composition
    await page.goto('/');
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Ensemble Audio Test');
    await page.check('[data-testid="enable-ensemble-mode"]');
    await page.click('[data-testid="confirm-create"]');
    
    // Add multiple parts
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    
    // Add patterns to both parts
    await page.click('[data-testid="part-chu-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', 'don - don -');
    
    await page.click('[data-testid="part-shime-daiko"] [data-testid="pattern-editor"]');
    await page.fill('[data-testid="text-input"]', '- ka - ka');
    
    // Should show ensemble audio controls
    await expect(page.locator('[data-testid="ensemble-audio-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="master-volume"]')).toBeVisible();
    await expect(page.locator('[data-testid="ensemble-play"]')).toBeVisible();
    
    // Test ensemble playback
    await page.click('[data-testid="ensemble-play"]');
    
    // Should show synchronized playback indicators
    await expect(page.locator('[data-testid="part-chu-daiko"] [data-testid="playing-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-shime-daiko"] [data-testid="playing-indicator"]')).toBeVisible();
    
    // Should show master beat indicator
    await expect(page.locator('[data-testid="master-beat-indicator"]')).toBeVisible();
    
    await page.click('[data-testid="ensemble-stop"]');
  });

  test('should support audio volume balancing', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add pattern
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');
    
    // Test volume controls
    await page.fill('[data-testid="volume-slider"]', '50');
    await expect(page.locator('[data-testid="volume-display"]')).toContainText('50%');
    
    // Should show volume visualization
    await expect(page.locator('[data-testid="volume-meter"]')).toBeVisible();
    
    // Test mute
    await page.click('[data-testid="mute-button"]');
    await expect(page.locator('[data-testid="mute-button"]')).toHaveClass(/active/);
    
    // Play should respect mute state
    await page.click('[data-testid="play-pattern"]');
    await expect(page.locator('[data-testid="audio-muted-indicator"]')).toBeVisible();
    
    await page.click('[data-testid="stop-pattern"]');
  });

  test('should provide audio feedback for pattern editing', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Switch to visual mode for beat editing
    await page.click('[data-testid="view-visual"]');
    
    // Enable audio feedback option
    await page.check('[data-testid="audio-feedback-toggle"]');
    
    // Click on beats should trigger audio feedback
    await page.click('[data-testid="beat-1"]');
    await expect(page.locator('[data-testid="audio-feedback-indicator"]')).toBeVisible();
    
    await page.click('[data-testid="beat-3"]');
    await expect(page.locator('[data-testid="audio-feedback-indicator"]')).toBeVisible();
    
    // Switch to circular view
    await page.click('[data-testid="view-circular"]');
    
    // Circular beat clicks should also trigger audio
    await page.click('[data-testid="circular-beat-0"]');
    await expect(page.locator('[data-testid="audio-feedback-indicator"]')).toBeVisible();
  });

  test('should support metronome functionality', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Should show metronome controls
    await expect(page.locator('[data-testid="metronome-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="metronome-volume"]')).toBeVisible();
    
    // Enable metronome
    await page.check('[data-testid="metronome-toggle"]');
    
    // Set metronome volume
    await page.fill('[data-testid="metronome-volume"]', '30');
    
    // Start playback with metronome
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');
    await page.click('[data-testid="play-pattern"]');
    
    // Should show metronome beat indicators
    await expect(page.locator('[data-testid="metronome-beat"]')).toBeVisible();
    await expect(page.locator('[data-testid="metronome-accent"]')).toBeVisible();
    
    await page.click('[data-testid="stop-pattern"]');
  });

  test('should handle audio context and browser permissions', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Should show audio context status
    await expect(page.locator('[data-testid="audio-context-status"]')).toBeVisible();
    
    // First interaction should initialize audio context
    await page.click('[data-testid="play-syllable-don"]');
    
    // Should show audio initialized status
    await expect(page.locator('[data-testid="audio-context-status"]')).toContainText('Ready');
    
    // Should handle audio permission issues gracefully
    await expect(page.locator('[data-testid="audio-permission-error"]')).not.toBeVisible();
  });

  test('should support different syllable timbres', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add pattern with different syllables
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu ko su ra te');
    
    // Should show syllable timbre options
    await page.click('[data-testid="audio-settings"]');
    await expect(page.locator('[data-testid="timbre-settings"]')).toBeVisible();
    
    // Test different timbres
    const timbres = ['don', 'ka', 'doko', 'tsu'];
    for (const timbre of timbres) {
      await expect(page.locator(`[data-testid="timbre-${timbre}"]`)).toBeVisible();
      
      // Should have frequency and envelope controls
      await expect(page.locator(`[data-testid="frequency-${timbre}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="envelope-${timbre}"]`)).toBeVisible();
    }
  });

  test('should support playback rate and pitch adjustments', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Add pattern
    await page.fill('[data-testid="text-input"]', 'don ka doko tsu');
    
    // Should show advanced audio controls
    await page.click('[data-testid="advanced-audio-settings"]');
    
    // Test playback rate
    await page.fill('[data-testid="playback-rate"]', '1.5');
    await expect(page.locator('[data-testid="playback-rate-display"]')).toContainText('1.5x');
    
    // Test pitch adjustment
    await page.fill('[data-testid="pitch-adjustment"]', '+2');
    await expect(page.locator('[data-testid="pitch-display"]')).toContainText('+2 semitones');
    
    // Play with adjustments
    await page.click('[data-testid="play-pattern"]');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="stop-pattern"]');
  });
});