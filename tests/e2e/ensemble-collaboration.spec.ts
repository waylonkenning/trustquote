import { test, expect } from '@playwright/test';

test.describe('Ensemble Collaboration Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create collaborative session', async ({ page }) => {
    // Create new collaborative composition
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Ensemble Test');
    await page.fill('[data-testid="session-name"]', 'Practice Session');
    
    // Set ensemble size
    await page.selectOption('[data-testid="ensemble-size"]', '6');
    await page.click('[data-testid="create-session"]');
    
    // Should show session details
    await expect(page.locator('[data-testid="session-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-url"]')).toBeVisible();
    
    // Copy session link
    await page.click('[data-testid="copy-session-link"]');
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
  });

  test('should join collaborative session', async ({ page, context }) => {
    // Create session in first tab
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Join Test');
    await page.click('[data-testid="create-session"]');
    
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    
    // Open second tab to join session
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.click('[data-testid="join-session"]');
    await page2.fill('[data-testid="session-code-input"]', sessionCode!);
    await page2.fill('[data-testid="participant-name"]', 'Player 2');
    await page2.click('[data-testid="join-collaboration"]');
    
    // Should join successfully
    await expect(page2.locator('[data-testid="collaboration-view"]')).toBeVisible();
    await expect(page2.locator('[data-testid="participant-list"]')).toContainText('Player 2');
    
    // First tab should show new participant
    await expect(page.locator('[data-testid="participant-list"]')).toContainText('Player 2');
  });

  test('should assign drum parts to participants', async ({ page, context }) => {
    // Setup collaborative session
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Part Assignment');
    await page.click('[data-testid="create-session"]');
    
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    
    // Join with second participant
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.click('[data-testid="join-session"]');
    await page2.fill('[data-testid="session-code-input"]', sessionCode!);
    await page2.fill('[data-testid="participant-name"]', 'Shime Player');
    await page2.click('[data-testid="join-collaboration"]');
    
    // Leader assigns parts
    await page.click('[data-testid="manage-parts"]');
    await page.dragAndDrop('[data-testid="participant-shime-player"]', '[data-testid="part-shime-daiko"]');
    await page.dragAndDrop('[data-testid="participant-leader"]', '[data-testid="part-chu-daiko"]');
    
    // Verify assignments
    await expect(page.locator('[data-testid="part-shime-daiko"] [data-testid="assigned-player"]')).toContainText('Shime Player');
    await expect(page2.locator('[data-testid="my-part"]')).toContainText('shime-daiko');
  });

  test('should sync real-time composition changes', async ({ page, context }) => {
    // Setup session with two participants
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Real-time Sync');
    await page.click('[data-testid="create-session"]');
    
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.click('[data-testid="join-session"]');
    await page2.fill('[data-testid="session-code-input"]', sessionCode!);
    await page2.fill('[data-testid="participant-name"]', 'Collaborator');
    await page2.click('[data-testid="join-collaboration"]');
    
    // Add part on first page
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    
    // Should appear on second page
    await expect(page2.locator('[data-testid="part-chu-daiko"]')).toBeVisible();
    
    // Edit pattern on second page
    await page2.click('[data-testid="part-chu-daiko"] [data-testid="pattern-editor"]');
    await page2.keyboard.type('don ka doko tsu');
    
    // Should sync to first page
    await expect(page.locator('[data-testid="part-chu-daiko"] [data-testid="pattern-text"]')).toContainText('don ka doko tsu');
  });

  test('should handle ensemble playback synchronization', async ({ page, context }) => {
    // Setup ensemble session
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Sync Playback');
    await page.click('[data-testid="create-session"]');
    
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    
    // Add multiple participants
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.click('[data-testid="join-session"]');
    await page2.fill('[data-testid="session-code-input"]', sessionCode!);
    await page2.fill('[data-testid="participant-name"]', 'Player 2');
    await page2.click('[data-testid="join-collaboration"]');
    
    // Add parts and patterns
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'chu-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    
    await page.click('[data-testid="add-part"]');
    await page.selectOption('[data-testid="drum-type"]', 'shime-daiko');
    await page.click('[data-testid="confirm-add-part"]');
    
    // Start synchronized playback
    await page.click('[data-testid="ensemble-play"]');
    
    // Both pages should show playing state
    await expect(page.locator('[data-testid="playback-status"]')).toContainText('Playing');
    await expect(page2.locator('[data-testid="playback-status"]')).toContainText('Playing');
    
    // Stop from second page
    await page2.click('[data-testid="ensemble-stop"]');
    
    // Both should stop
    await expect(page.locator('[data-testid="playback-status"]')).toContainText('Stopped');
    await expect(page2.locator('[data-testid="playback-status"]')).toContainText('Stopped');
  });

  test('should support ensemble chat and communication', async ({ page, context }) => {
    // Setup session
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Chat Test');
    await page.click('[data-testid="create-session"]');
    
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.click('[data-testid="join-session"]');
    await page2.fill('[data-testid="session-code-input"]', sessionCode!);
    await page2.fill('[data-testid="participant-name"]', 'Chatter');
    await page2.click('[data-testid="join-collaboration"]');
    
    // Open chat panel
    await page.click('[data-testid="chat-toggle"]');
    await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
    
    // Send message
    await page.fill('[data-testid="chat-input"]', 'Lets work on the intro section');
    await page.click('[data-testid="send-message"]');
    
    // Should appear in chat
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Lets work on the intro section');
    
    // Should appear on other participant's screen
    await page2.click('[data-testid="chat-toggle"]');
    await expect(page2.locator('[data-testid="chat-messages"]')).toContainText('Lets work on the intro section');
    
    // Reply from second participant
    await page2.fill('[data-testid="chat-input"]', 'Good idea! I can handle the shime part');
    await page2.click('[data-testid="send-message"]');
    
    // Should sync back to first participant
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Good idea! I can handle the shime part');
  });

  test('should handle participant disconnect and reconnect', async ({ page, context }) => {
    // Setup session
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Disconnect Test');
    await page.click('[data-testid="create-session"]');
    
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.click('[data-testid="join-session"]');
    await page2.fill('[data-testid="session-code-input"]', sessionCode!);
    await page2.fill('[data-testid="participant-name"]', 'Disconnector');
    await page2.click('[data-testid="join-collaboration"]');
    
    // Verify participant is connected
    await expect(page.locator('[data-testid="participant-list"]')).toContainText('Disconnector');
    await expect(page.locator('[data-testid="participant-disconnector"]')).toHaveClass(/connected/);
    
    // Simulate disconnect by closing second page
    await page2.close();
    
    // Should show as disconnected
    await expect(page.locator('[data-testid="participant-disconnector"]')).toHaveClass(/disconnected/);
    
    // Reconnect
    const page3 = await context.newPage();
    await page3.goto('/');
    await page3.click('[data-testid="join-session"]');
    await page3.fill('[data-testid="session-code-input"]', sessionCode!);
    await page3.fill('[data-testid="participant-name"]', 'Disconnector');
    await page3.click('[data-testid="join-collaboration"]');
    
    // Should show as reconnected
    await expect(page.locator('[data-testid="participant-disconnector"]')).toHaveClass(/connected/);
  });

  test('should support conductor mode for tempo changes', async ({ page, context }) => {
    // Setup session with conductor
    await page.click('[data-testid="create-collaboration"]');
    await page.fill('[data-testid="composition-title"]', 'Conductor Test');
    await page.check('[data-testid="enable-conductor-mode"]');
    await page.click('[data-testid="create-session"]');
    
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.click('[data-testid="join-session"]');
    await page2.fill('[data-testid="session-code-input"]', sessionCode!);
    await page2.fill('[data-testid="participant-name"]', 'Player');
    await page2.click('[data-testid="join-collaboration"]');
    
    // Conductor should have tempo controls
    await expect(page.locator('[data-testid="conductor-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="tempo-control"]')).toBeVisible();
    
    // Player should not have tempo controls
    await expect(page2.locator('[data-testid="tempo-control"]')).not.toBeVisible();
    
    // Conductor changes tempo
    await page.fill('[data-testid="tempo-control"]', '140');
    await page.keyboard.press('Enter');
    
    // Should sync to all participants
    await expect(page2.locator('[data-testid="current-tempo"]')).toContainText('140');
    
    // Start synchronized playback with tempo
    await page.click('[data-testid="conductor-play"]');
    await expect(page2.locator('[data-testid="playback-status"]')).toContainText('Playing');
  });
});