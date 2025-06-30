import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Account Registration', () => {
    test('should show registration form', async ({ page }) => {
      await page.click('[data-testid="sign-up-button"]');
      
      // Should show registration modal
      await expect(page.locator('[data-testid="registration-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="registration-form"]')).toBeVisible();
      
      // Should have required fields
      await expect(page.locator('[data-testid="register-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-password"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-confirm-password"]')).toBeVisible();
      
      // Should show terms and privacy links
      await expect(page.locator('[data-testid="terms-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="privacy-link"]')).toBeVisible();
    });

    test('should handle successful registration', async ({ page }) => {
      await page.click('[data-testid="sign-up-button"]');
      
      // Fill registration form
      await page.fill('[data-testid="register-email"]', 'newuser@example.com');
      await page.fill('[data-testid="register-name"]', 'New User');
      await page.fill('[data-testid="register-password"]', 'SecurePassword123!');
      await page.fill('[data-testid="register-confirm-password"]', 'SecurePassword123!');
      
      // Accept terms
      await page.check('[data-testid="accept-terms"]');
      
      // Submit registration
      await page.click('[data-testid="submit-registration"]');
      
      // Should show email verification notice
      await expect(page.locator('[data-testid="email-verification-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-verification-notice"]')).toContainText('Check your email');
      
      // Should close registration modal
      await expect(page.locator('[data-testid="registration-modal"]')).not.toBeVisible();
    });

    test('should validate registration form inputs', async ({ page }) => {
      await page.click('[data-testid="sign-up-button"]');
      
      // Submit empty form
      await page.click('[data-testid="submit-registration"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      
      // Test invalid email
      await page.fill('[data-testid="register-email"]', 'invalid-email');
      await page.click('[data-testid="submit-registration"]');
      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
      
      // Test password mismatch
      await page.fill('[data-testid="register-email"]', 'test@example.com');
      await page.fill('[data-testid="register-password"]', 'password123');
      await page.fill('[data-testid="register-confirm-password"]', 'different123');
      await page.click('[data-testid="submit-registration"]');
      await expect(page.locator('[data-testid="password-confirm-error"]')).toContainText('Passwords do not match');
      
      // Test weak password
      await page.fill('[data-testid="register-password"]', '123');
      await page.fill('[data-testid="register-confirm-password"]', '123');
      await page.click('[data-testid="submit-registration"]');
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be');
    });

    test('should handle registration errors', async ({ page }) => {
      await page.click('[data-testid="sign-up-button"]');
      
      // Fill form with existing email (mock server response)
      await page.route('**/api/auth/register', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Email already exists' })
        });
      });
      
      await page.fill('[data-testid="register-email"]', 'existing@example.com');
      await page.fill('[data-testid="register-name"]', 'Test User');
      await page.fill('[data-testid="register-password"]', 'SecurePassword123!');
      await page.fill('[data-testid="register-confirm-password"]', 'SecurePassword123!');
      await page.check('[data-testid="accept-terms"]');
      
      await page.click('[data-testid="submit-registration"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="registration-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="registration-error"]')).toContainText('Email already exists');
      
      // Should suggest signing in instead
      await expect(page.locator('[data-testid="suggest-signin"]')).toBeVisible();
    });
  });

  test.describe('User Login', () => {
    test('should show login form', async ({ page }) => {
      await page.click('[data-testid="sign-in-button"]');
      
      // Should show login modal
      await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      
      // Should have required fields
      await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
      
      // Should show forgot password link
      await expect(page.locator('[data-testid="forgot-password-link"]')).toBeVisible();
      
      // Should show social login options
      await expect(page.locator('[data-testid="google-login"]')).toBeVisible();
      await expect(page.locator('[data-testid="github-login"]')).toBeVisible();
    });

    test('should handle successful login', async ({ page }) => {
      await page.click('[data-testid="sign-in-button"]');
      
      // Mock successful login
      await page.route('**/api/auth/login', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            user: { 
              id: '123', 
              email: 'user@example.com', 
              name: 'Test User',
              subscription: { status: 'free' }
            },
            token: 'mock-jwt-token'
          })
        });
      });
      
      await page.fill('[data-testid="login-email"]', 'user@example.com');
      await page.fill('[data-testid="login-password"]', 'password123');
      await page.click('[data-testid="submit-login"]');
      
      // Should close login modal
      await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
      
      // Should show user menu
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
      
      // Should hide sign in/up buttons
      await expect(page.locator('[data-testid="sign-in-button"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="sign-up-button"]')).not.toBeVisible();
    });

    test('should handle login errors', async ({ page }) => {
      await page.click('[data-testid="sign-in-button"]');
      
      // Mock invalid credentials
      await page.route('**/api/auth/login', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' })
        });
      });
      
      await page.fill('[data-testid="login-email"]', 'user@example.com');
      await page.fill('[data-testid="login-password"]', 'wrongpassword');
      await page.click('[data-testid="submit-login"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid credentials');
      
      // Should keep modal open
      await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
    });

    test('should handle social login', async ({ page }) => {
      await page.click('[data-testid="sign-in-button"]');
      
      // Mock Google OAuth flow
      await page.route('**/api/auth/google', (route) => {
        route.fulfill({
          status: 302,
          headers: { Location: 'https://accounts.google.com/oauth/authorize?...' }
        });
      });
      
      await page.click('[data-testid="google-login"]');
      
      // Should redirect to Google OAuth (in real app)
      // For testing, we'll mock the return
      await page.evaluate(() => {
        window.postMessage({ 
          type: 'OAUTH_SUCCESS',
          user: { 
            id: '456', 
            email: 'google@example.com', 
            name: 'Google User',
            subscription: { status: 'free' }
          }
        }, '*');
      });
      
      // Should complete login
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Google User');
    });
  });

  test.describe('Password Reset', () => {
    test('should show forgot password form', async ({ page }) => {
      await page.click('[data-testid="sign-in-button"]');
      await page.click('[data-testid="forgot-password-link"]');
      
      // Should show password reset modal
      await expect(page.locator('[data-testid="password-reset-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="send-reset-email"]')).toBeVisible();
    });

    test('should handle password reset request', async ({ page }) => {
      await page.click('[data-testid="sign-in-button"]');
      await page.click('[data-testid="forgot-password-link"]');
      
      await page.fill('[data-testid="reset-email-input"]', 'user@example.com');
      await page.click('[data-testid="send-reset-email"]');
      
      // Should show confirmation message
      await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-email-sent"]')).toContainText('Password reset email sent');
    });

    test('should handle password reset completion', async ({ page }) => {
      // Navigate to reset password page with token
      await page.goto('/reset-password?token=mock-reset-token');
      
      // Should show reset password form
      await expect(page.locator('[data-testid="reset-password-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="new-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-new-password-input"]')).toBeVisible();
      
      await page.fill('[data-testid="new-password-input"]', 'NewSecurePassword123!');
      await page.fill('[data-testid="confirm-new-password-input"]', 'NewSecurePassword123!');
      await page.click('[data-testid="reset-password-submit"]');
      
      // Should show success message and redirect to login
      await expect(page.locator('[data-testid="password-reset-success"]')).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('User Session Management', () => {
    test('should persist login state across page reloads', async ({ page }) => {
      // Mock login state
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'user@example.com',
          name: 'Test User',
          subscription: { status: 'premium' }
        }));
      });
      
      await page.reload();
      
      // Should restore logged in state
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
      
      // Should show premium status
      await expect(page.locator('[data-testid="premium-status-indicator"]')).toBeVisible();
    });

    test('should handle logout', async ({ page }) => {
      // Setup logged in state
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'user@example.com',
          name: 'Test User'
        }));
      });
      
      await page.reload();
      
      // Click user menu and logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Should show logout confirmation
      await expect(page.locator('[data-testid="logout-confirmation"]')).toBeVisible();
      await page.click('[data-testid="confirm-logout"]');
      
      // Should clear user state
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="sign-up-button"]')).toBeVisible();
    });

    test('should handle session expiration', async ({ page }) => {
      // Setup expired token
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'expired-jwt-token');
      });
      
      // Mock API call with expired token
      await page.route('**/api/**', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token expired' })
        });
      });
      
      await page.reload();
      
      // Should show session expired notice
      await expect(page.locator('[data-testid="session-expired-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="session-expired-notice"]')).toContainText('Session expired');
      
      // Should prompt to log in again
      await expect(page.locator('[data-testid="login-again-button"]')).toBeVisible();
    });
  });

  test.describe('Account Settings', () => {
    test('should show account settings page', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'user@example.com',
          name: 'Test User'
        }));
      });
      
      await page.reload();
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="account-settings"]');
      
      // Should navigate to settings page
      await expect(page).toHaveURL(/\/account/);
      
      // Should show profile settings
      await expect(page.locator('[data-testid="profile-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-field"]')).toHaveValue('user@example.com');
      await expect(page.locator('[data-testid="name-field"]')).toHaveValue('Test User');
      
      // Should show security settings
      await expect(page.locator('[data-testid="security-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="change-password-button"]')).toBeVisible();
      
      // Should show account danger zone
      await expect(page.locator('[data-testid="danger-zone"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-account-button"]')).toBeVisible();
    });

    test('should handle profile updates', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'user@example.com',
          name: 'Test User'
        }));
      });
      
      await page.goto('/account');
      
      // Update name
      await page.fill('[data-testid="name-field"]', 'Updated Name');
      await page.click('[data-testid="save-profile"]');
      
      // Should show success message
      await expect(page.locator('[data-testid="profile-updated"]')).toBeVisible();
      
      // Should update user menu
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Updated Name');
    });

    test('should handle account deletion', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'user@example.com',
          name: 'Test User'
        }));
      });
      
      await page.goto('/account');
      
      // Click delete account
      await page.click('[data-testid="delete-account-button"]');
      
      // Should show confirmation modal
      await expect(page.locator('[data-testid="delete-account-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-consequences"]')).toBeVisible();
      
      // Should require password confirmation
      await page.fill('[data-testid="delete-password-confirm"]', 'password123');
      await page.fill('[data-testid="delete-confirmation-text"]', 'DELETE');
      await page.click('[data-testid="confirm-delete-account"]');
      
      // Should show deletion success and redirect
      await expect(page.locator('[data-testid="account-deleted"]')).toBeVisible();
      await expect(page).toHaveURL('/');
    });
  });
});