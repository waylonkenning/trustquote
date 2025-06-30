import { test, expect } from '@playwright/test';

test.describe('Debug Feature Gating', () => {
  test('debug anonymous user on compose page', async ({ page }) => {
    await page.goto('/compose');
    
    // Clear any existing user data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check localStorage state
    const authState = await page.evaluate(() => {
      return {
        userData: localStorage.getItem('user_data'),
        authToken: localStorage.getItem('auth_token'),
        isLoggedIn: window.subscriptionService?.isLoggedIn
      }
    });
    console.log('Auth state:', authState);
    
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'debug-anonymous-compose.png', fullPage: true });
    
    // Log all buttons
    const buttons = await page.locator('button').all();
    console.log('Found buttons:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const testId = await button.getAttribute('data-testid');
      console.log(`Button ${i}: "${text}" (data-testid: ${testId})`);
    }
    
    // Log all elements with data-testid
    const testIdElements = await page.locator('[data-testid]').all();
    console.log('Found elements with data-testid:', testIdElements.length);
    
    for (let i = 0; i < Math.min(testIdElements.length, 20); i++) {
      const element = testIdElements[i];
      const testId = await element.getAttribute('data-testid');
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      console.log(`Element ${i}: <${tagName.toLowerCase()}> data-testid="${testId}" text="${text?.slice(0, 50)}"`);
    }
  });

  test('debug free user on compose page', async ({ page }) => {
    await page.goto('/compose');
    
    // Mock logged in free user
    await page.evaluate(() => {
      const freeUser = {
        id: 'free-user-123',
        email: 'freeuser@example.com',
        name: 'Free User',
        subscription: {
          status: 'free',
          plan: 'free'
        }
      };
      localStorage.setItem('user_data', JSON.stringify(freeUser));
      localStorage.setItem('auth_token', 'mock-free-token');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-free-user-compose.png', fullPage: true });
    
    // Check if user menu is visible
    const userMenu = page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      console.log('User menu is visible for logged in user');
    } else {
      console.log('User menu not found for logged in user');
    }
    
    // Check if create composition button exists
    const createButton = page.locator('[data-testid="create-composition"]');
    if (await createButton.isVisible()) {
      console.log('Create composition button is visible');
      const isDisabled = await createButton.isDisabled();
      console.log('Create composition button disabled:', isDisabled);
    } else {
      console.log('Create composition button not found');
    }
  });
});