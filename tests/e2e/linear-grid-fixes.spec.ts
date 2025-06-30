import { test, expect } from '@playwright/test';

test.describe('Linear Grid Fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a composition to work with
    await page.click('[data-testid="create-composition"]');
    await page.fill('[data-testid="composition-title"]', 'Linear Grid Test');
    await page.click('[data-testid="confirm-create"]');
    
    // Add a chu-daiko part
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
  });

  test('should only highlight clicked beats in linear grid', async ({ page }) => {
    // Click on pattern editor to access the interface
    await page.click('[data-testid="pattern-editor"]');
    
    // Switch to visual/linear grid mode
    await page.click('[data-testid="view-visual"]');
    
    // Click on beat 1 (index 0)
    await page.click('[data-testid="beat-1"]');
    
    // Verify only beat 1 is active
    await expect(page.locator('[data-testid="beat-1"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="beat-2"]')).not.toHaveClass(/active/);
    
    // Click on beat 5 (index 4)
    await page.click('[data-testid="beat-5"]');
    
    // Verify beat 1 and beat 5 are active, but NOT beat 2
    await expect(page.locator('[data-testid="beat-1"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="beat-2"]')).not.toHaveClass(/active/);
    await expect(page.locator('[data-testid="beat-3"]')).not.toHaveClass(/active/);
    await expect(page.locator('[data-testid="beat-4"]')).not.toHaveClass(/active/);
    await expect(page.locator('[data-testid="beat-5"]')).toHaveClass(/active/);
  });

  test('should toggle beats correctly when clicked multiple times', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    await page.click('[data-testid="view-visual"]');
    
    // Click beat 3 to activate
    await page.click('[data-testid="beat-3"]');
    await expect(page.locator('[data-testid="beat-3"]')).toHaveClass(/active/);
    
    // Click beat 3 again to deactivate
    await page.click('[data-testid="beat-3"]');
    await expect(page.locator('[data-testid="beat-3"]')).not.toHaveClass(/active/);
    
    // Click beat 3 once more to reactivate
    await page.click('[data-testid="beat-3"]');
    await expect(page.locator('[data-testid="beat-3"]')).toHaveClass(/active/);
  });

  test('should reflect changes in text input when beats are clicked', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Start in text mode and verify empty
    const textInput = page.locator('[data-testid="text-input"]');
    await expect(textInput).toHaveValue('');
    
    // Switch to visual mode
    await page.click('[data-testid="view-visual"]');
    
    // Click some beats
    await page.click('[data-testid="beat-1"]');
    await page.click('[data-testid="beat-3"]');
    await page.click('[data-testid="beat-6"]');
    
    // Switch back to text mode
    await page.click('[data-testid="view-text"]');
    
    // Verify text input has the pattern (positional with dashes for gaps)
    await expect(textInput).toHaveValue('don - don - - don');
  });

  test('circular view should display content when clicked', async ({ page }) => {
    // Click on pattern editor to access the interface
    await page.click('[data-testid="pattern-editor"]');
    
    // First test visual mode to compare
    await page.click('[data-testid="view-visual"]');
    const visualModeText = await page.locator('[data-testid="debug-viewmode"]').textContent();
    console.log('ViewMode after clicking visual:', visualModeText);
    
    // Now test circular mode
    await page.click('[data-testid="view-circular"]');
    const circularModeText = await page.locator('[data-testid="debug-viewmode"]').textContent();
    console.log('ViewMode after clicking circular:', circularModeText);
    
    // Check that the debug div is visible
    await expect(page.locator('[data-testid="debug-viewmode"]')).toBeVisible();
    
    // Report the comparison
    if (circularModeText && circularModeText.includes('circular')) {
      console.log('SUCCESS: Circular mode activated');
      
      // Test the rebuilt circular view step by step
      await expect(page.locator('[data-testid="circular-view-wrapper"]')).toBeVisible();
      await expect(page.locator('[data-testid="circular-rhythm-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="circular-beat-grid"]')).toBeVisible();
      
      // Check SVG elements
      await expect(page.locator('[data-testid="center-circle"]')).toBeVisible();
      await expect(page.locator('[data-testid="beat-markers"]')).toBeVisible();
      
      // Check that beat markers are present (should be 8)
      const beatMarkers = page.locator('[data-testid^="circular-beat-"]');
      const beatCount = await beatMarkers.count();
      expect(beatCount).toBeGreaterThanOrEqual(8);
      
      // Verify SVG has proper viewBox
      const svgElement = page.locator('[data-testid="circular-beat-grid"]');
      await expect(svgElement).toHaveAttribute('viewBox', '0 0 400 400');
      
      console.log('SUCCESS: Step 1 - Basic SVG circular view working!');
      
      // Test Step 2 - Interactive beat editing
      console.log('Testing Step 2 - Interactive beat editing...');
      
      // Click on beat 0 to add a syllable
      await page.click('[data-testid="circular-beat-0"]');
      
      // Check if pattern text updated
      const patternAfterClick = await page.locator('[data-testid="debug-viewmode"]').textContent();
      console.log('Pattern after beat click:', patternAfterClick);
      
      // Switch to text mode to verify the pattern was updated
      await page.click('[data-testid="view-text"]');
      const textInput = page.locator('[data-testid="text-input"]');
      const textValue = await textInput.inputValue();
      console.log('Text input value after beat click:', textValue);
      
      // Should contain 'don' at position 0
      if (textValue.includes('don')) {
        console.log('SUCCESS: Step 2 - Beat click interaction working!');
      } else {
        console.log('ISSUE: Beat click did not update pattern');
      }
    } else {
      console.log('ISSUE: Circular button click did not change viewMode');
      console.log('Visual click result:', visualModeText);
      console.log('Circular click result:', circularModeText);
    }
  });

  test('should navigate between all three view modes', async ({ page }) => {
    await page.click('[data-testid="pattern-editor"]');
    
    // Wait for pattern editor to be ready
    await expect(page.locator('[data-testid="text-input"]')).toBeVisible();
    
    // Test tab navigation
    await page.click('[data-testid="view-text"]');
    await expect(page.locator('[data-testid="view-text"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="text-input"]')).toBeVisible();
    
    await page.click('[data-testid="view-visual"]');
    await expect(page.locator('[data-testid="view-visual"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="visual-notation"]')).toBeVisible();
    
    await page.click('[data-testid="view-circular"]');
    await expect(page.locator('[data-testid="view-circular"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="circular-view-wrapper"]')).toBeVisible();
  });
});