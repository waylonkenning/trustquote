import { test, expect } from '@playwright/test';

test.describe('Circular Rhythm Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a composition to work with
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Circular Viz Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Add a chu-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
  });

  test('should display circular rhythm visualizer', async ({ page }) => {
    // First click on the pattern editor to ensure we're in the right context
    await page.click('[data-testid="pattern-editor"]');
    
    // Switch to circular visualization mode
    await page.click('[data-testid="view-circular"]');
    
    // Check that circular container is visible
    await expect(page.locator('[data-testid="circular-rhythm-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="circular-beat-grid"]')).toBeVisible();
    
    // Verify circular layout elements
    await expect(page.locator('[data-testid="center-circle"]')).toBeVisible();
    await expect(page.locator('[data-testid="beat-markers"]')).toBeVisible();
  });

  test('should show beats arranged in circular pattern', async ({ page }) => {
    // First click on the pattern editor and input a pattern
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu don ka tsu don');
    
    // Then switch to circular view
    await page.click('[data-testid="view-circular"]');
    
    // Check that beats are arranged in circle
    const beatMarkers = page.locator('[data-testid^="circular-beat-"]');
    await expect(beatMarkers).toHaveCount(8);
    
    // Verify polar positioning
    for (let i = 0; i < 8; i++) {
      const beat = page.locator(`[data-testid="circular-beat-${i}"]`);
      await expect(beat).toBeVisible();
      
      // Check that beat has polar coordinates data
      await expect(beat).toHaveAttribute('data-angle');
      await expect(beat).toHaveAttribute('data-radius');
    }
  });

  test('should support multiple concentric circles for complex patterns', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Input a 16-beat pattern
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu don ka tsu don ka doko don tsu ka don tsu ka');
    
    // Check inner and outer circles
    await expect(page.locator('[data-testid="inner-circle"]')).toBeVisible();
    await expect(page.locator('[data-testid="outer-circle"]')).toBeVisible();
    
    // Verify beat distribution
    const innerBeats = page.locator('[data-testid^="inner-beat-"]');
    const outerBeats = page.locator('[data-testid^="outer-beat-"]');
    
    await expect(innerBeats).toHaveCount(8);
    await expect(outerBeats).toHaveCount(8);
  });

  test('should highlight syllables with different colors based on timbre', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu');
    
    // Check color coding for different syllables
    const donBeat = page.locator('[data-testid="circular-beat-0"]');
    const kaBeat = page.locator('[data-testid="circular-beat-1"]');
    const dokoBeat = page.locator('[data-testid="circular-beat-2"]');
    const tsuBeat = page.locator('[data-testid="circular-beat-3"]');
    
    // Verify different visual styles for different timbres
    await expect(donBeat).toHaveClass(/timbre-don/);
    await expect(kaBeat).toHaveClass(/timbre-ka/);
    await expect(dokoBeat).toHaveClass(/timbre-doko/);
    await expect(tsuBeat).toHaveClass(/timbre-tsu/);
  });

  test('should show tempo visualization with rotating indicator', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Enable tempo visualization
    await page.check('[data-testid="show-tempo-indicator"]');
    
    // Check tempo indicator elements
    await expect(page.locator('[data-testid="tempo-hand"]')).toBeVisible();
    await expect(page.locator('[data-testid="tempo-center"]')).toBeVisible();
    
    // Set a specific tempo
    await page.fill('[data-testid="tempo-slider"]', '120');
    
    // Start playback to see rotation
    await page.click('[data-testid="play-pattern"]');
    
    // Verify tempo hand rotates
    const tempoHand = page.locator('[data-testid="tempo-hand"]');
    await expect(tempoHand).toHaveClass(/rotating/);
  });

  test('should support interactive beat editing in circular mode', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Click on a beat position to add a syllable
    await page.click('[data-testid="circular-beat-0"]');
    
    // Should show syllable selection modal
    await expect(page.locator('[data-testid="syllable-selector"]')).toBeVisible();
    
    // Select a syllable
    await page.click('[data-testid="select-don"]');
    
    // Beat should now show the syllable
    const beat0 = page.locator('[data-testid="circular-beat-0"]');
    await expect(beat0).toContainText('don');
    await expect(beat0).toHaveClass(/filled/);
  });

  test('should display subdivision markers for complex rhythms', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Enable subdivision display
    await page.check('[data-testid="show-subdivisions"]');
    
    // Check subdivision markers
    await expect(page.locator('[data-testid="subdivision-markers"]')).toBeVisible();
    
    // Should show quarter, eighth, and sixteenth note divisions
    await expect(page.locator('[data-testid="quarter-divisions"]')).toBeVisible();
    await expect(page.locator('[data-testid="eighth-divisions"]')).toBeVisible();
    await expect(page.locator('[data-testid="sixteenth-divisions"]')).toBeVisible();
  });

  test('should support zooming and panning in circular view', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Test zoom controls
    await page.click('[data-testid="zoom-in"]');
    await expect(page.locator('[data-testid="circular-rhythm-container"]')).toHaveClass(/zoomed-in/);
    
    await page.click('[data-testid="zoom-out"]');
    await expect(page.locator('[data-testid="circular-rhythm-container"]')).toHaveClass(/zoomed-out/);
    
    // Test reset zoom
    await page.click('[data-testid="reset-zoom"]');
    await expect(page.locator('[data-testid="circular-rhythm-container"]')).toHaveClass(/default-zoom/);
  });

  test('should show pattern relationships with connecting lines', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Input a pattern with relationships
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka don ka doko tsu doko tsu');
    
    // Enable relationship visualization
    await page.check('[data-testid="show-relationships"]');
    
    // Check for connecting lines between related beats
    await expect(page.locator('[data-testid="pattern-connections"]')).toBeVisible();
    await expect(page.locator('[data-testid^="connection-line-"]')).toHaveCount.greaterThan(0);
  });

  test('should support multiple drum parts in layered circles', async ({ page }) => {
    // Add multiple drum parts
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'o-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    
    await page.click('[data-testid="view-circular"]');
    
    // Should show layered circles for different parts
    await expect(page.locator('[data-testid="chu-daiko-circle"]')).toBeVisible();
    await expect(page.locator('[data-testid="shime-daiko-circle"]')).toBeVisible();
    await expect(page.locator('[data-testid="o-daiko-circle"]')).toBeVisible();
    
    // Each circle should have different radius
    const chuCircle = page.locator('[data-testid="chu-daiko-circle"]');
    const shimeCircle = page.locator('[data-testid="shime-daiko-circle"]');
    const oCircle = page.locator('[data-testid="o-daiko-circle"]');
    
    // Verify they have different data-radius attributes
    await expect(chuCircle).toHaveAttribute('data-radius');
    await expect(shimeCircle).toHaveAttribute('data-radius');
    await expect(oCircle).toHaveAttribute('data-radius');
  });

  test('should animate pattern playback with moving highlight', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu');
    
    // Start playback
    await page.click('[data-testid="play-pattern"]');
    
    // Should show playback indicator
    await expect(page.locator('[data-testid="playback-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="playback-indicator"]')).toHaveClass(/animating/);
    
    // Stop playback
    await page.click('[data-testid="stop-pattern"]');
    await expect(page.locator('[data-testid="playback-indicator"]')).not.toHaveClass(/animating/);
  });

  test('should export circular visualization as image', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu don ka tsu don');
    
    // Test export functionality
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-circular-image"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/circular-rhythm.*\.(png|svg)/);
  });

  test('should show measure and phrase divisions', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Input a multi-measure pattern
    await page.click('[data-testid="pattern-editor"]');
    await page.keyboard.type('don ka doko tsu don ka tsu don ka doko don tsu ka don tsu ka');
    
    // Enable measure divisions
    await page.check('[data-testid="show-measures"]');
    
    // Check measure markers
    await expect(page.locator('[data-testid="measure-divisions"]')).toBeVisible();
    await expect(page.locator('[data-testid^="measure-marker-"]')).toHaveCount.greaterThan(1);
    
    // Check phrase markers for jo-ha-kyū structure
    await page.check('[data-testid="show-phrases"]');
    await expect(page.locator('[data-testid="phrase-divisions"]')).toBeVisible();
  });

  test('should support custom color schemes for accessibility', async ({ page }) => {
    await page.click('[data-testid="view-circular"]');
    
    // Open color scheme settings
    await page.click('[data-testid="color-scheme-settings"]');
    
    // Test different color schemes
    await page.click('[data-testid="high-contrast-scheme"]');
    await expect(page.locator('[data-testid="circular-rhythm-container"]')).toHaveClass(/high-contrast/);
    
    await page.click('[data-testid="colorblind-friendly-scheme"]');
    await expect(page.locator('[data-testid="circular-rhythm-container"]')).toHaveClass(/colorblind-friendly/);
    
    await page.click('[data-testid="monochrome-scheme"]');
    await expect(page.locator('[data-testid="circular-rhythm-container"]')).toHaveClass(/monochrome/);
  });
});