import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Hero Section', () => {
    test('should display hero content with compelling messaging', async ({ page }) => {
      // Check main headline
      await expect(page.locator('h1')).toContainText('Create Traditional Taiko Compositions');
      await expect(page.locator('h1')).toContainText('Taiko');
      
      // Check subtitle describes the platform
      await expect(page.getByText('digital platform for composing traditional Japanese taiko')).toBeVisible();
      
      // Check CTAs are present
      await expect(page.getByText('Start Free Trial')).toBeVisible();
      await expect(page.getByText('Watch Demo')).toBeVisible();
      
      // Check trust indicators
      await expect(page.getByText('14-day free trial')).toBeVisible();
      await expect(page.getByText('No credit card required')).toBeVisible();
      await expect(page.getByText('Cancel anytime')).toBeVisible();
    });

    test('should show app preview with notation demo', async ({ page }) => {
      // Check for app preview window
      await expect(page.locator('.preview-window')).toBeVisible();
      await expect(page.locator('.window-header')).toBeVisible();
      await expect(page.getByText('Taiko Composer')).toBeVisible();
      
      // Check notation syllables are displayed
      await expect(page.locator('.syllable.don')).toBeVisible();
      await expect(page.locator('.syllable.ka')).toBeVisible();
      await expect(page.locator('.syllable.doko')).toBeVisible();
      await expect(page.locator('.syllable.tsu')).toBeVisible();
      
      // Check circular visualization
      await expect(page.locator('.rhythm-circle')).toBeVisible();
    });

    test('should handle CTA button clicks', async ({ page }) => {
      // Test free trial CTA
      await page.click('text=Start Free Trial');
      // Should navigate to signup with trial parameter
      await expect(page).toHaveURL(/\/signup\?trial=true/);
      
      // Go back and test demo CTA
      await page.goBack();
      await page.click('text=Watch Demo');
      // Demo functionality would be implemented later
    });
  });

  test.describe('Features Section', () => {
    test('should display all key features with appropriate badges', async ({ page }) => {
      // Scroll to features section
      await page.locator('.features-section').scrollIntoViewIfNeeded();
      
      // Check section header
      await expect(page.getByText('Everything You Need for Taiko Composition')).toBeVisible();
      
      // Check free features (no premium badge)
      await expect(page.getByText('Kuchi Shōga Notation')).toBeVisible();
      await expect(page.getByText('Real-time Audio')).toBeVisible();
      
      // Check premium features (with premium badge)
      const ensembleCard = page.locator('.feature-card').filter({ hasText: 'Ensemble Coordination' });
      await expect(ensembleCard).toBeVisible();
      await expect(ensembleCard.locator('.premium-badge')).toBeVisible();
      
      const circularCard = page.locator('.feature-card').filter({ hasText: 'Circular Visualization' });
      await expect(circularCard).toBeVisible();
      await expect(circularCard.locator('.premium-badge')).toBeVisible();
      
      const regionalCard = page.locator('.feature-card').filter({ hasText: 'Regional Styles' });
      await expect(regionalCard).toBeVisible();
      await expect(regionalCard.locator('.premium-badge')).toBeVisible();
      
      const exportCard = page.locator('.feature-card').filter({ hasText: 'Export Capabilities' });
      await expect(exportCard).toBeVisible();
      await expect(exportCard.locator('.premium-badge')).toBeVisible();
    });

    test('should have appropriate feature descriptions', async ({ page }) => {
      await page.locator('.features-section').scrollIntoViewIfNeeded();
      
      // Check that descriptions mention authentic taiko concepts
      await expect(page.getByText('Traditional Japanese rhythm syllables')).toBeVisible();
      await expect(page.getByText('jo-ha-kyū principles')).toBeVisible();
      await expect(page.getByText('Kanto and Kansai notation variations')).toBeVisible();
      await expect(page.getByText('Web Audio API integration')).toBeVisible();
    });
  });

  test.describe('Pricing Section', () => {
    test('should display free and premium plans clearly', async ({ page }) => {
      await page.locator('.pricing-section').scrollIntoViewIfNeeded();
      
      // Check section header
      await expect(page.getByText('Simple, Transparent Pricing')).toBeVisible();
      
      // Check free plan
      const freePlan = page.locator('.pricing-card').first();
      await expect(freePlan.getByText('Free')).toBeVisible();
      await expect(freePlan.getByText('$0')).toBeVisible();
      await expect(freePlan.getByText('forever')).toBeVisible();
      await expect(freePlan.getByText('Get Started Free')).toBeVisible();
      
      // Check premium plan
      const premiumPlan = page.locator('.pricing-card.featured');
      await expect(premiumPlan.getByText('Premium')).toBeVisible();
      await expect(premiumPlan.getByText('$9.99')).toBeVisible();
      await expect(premiumPlan.getByText('/month')).toBeVisible();
      await expect(premiumPlan.getByText('Most Popular')).toBeVisible();
      await expect(premiumPlan.getByText('Start Free Trial')).toBeVisible();
    });

    test('should list features accurately for each plan', async ({ page }) => {
      await page.locator('.pricing-section').scrollIntoViewIfNeeded();
      
      // Free plan features
      const freePlan = page.locator('.pricing-card').first();
      await expect(freePlan.getByText('Basic kuchi shōga notation')).toBeVisible();
      await expect(freePlan.getByText('Single drum compositions')).toBeVisible();
      await expect(freePlan.getByText('Up to 3 saved compositions')).toBeVisible();
      
      // Premium plan features
      const premiumPlan = page.locator('.pricing-card.featured');
      await expect(premiumPlan.getByText('Everything in Free')).toBeVisible();
      await expect(premiumPlan.getByText('Unlimited compositions')).toBeVisible();
      await expect(premiumPlan.getByText('Multi-drum ensemble coordination')).toBeVisible();
      await expect(premiumPlan.getByText('Export capabilities')).toBeVisible();
      await expect(premiumPlan.getByText('Priority support')).toBeVisible();
    });

    test('should handle plan selection', async ({ page }) => {
      await page.locator('.pricing-section').scrollIntoViewIfNeeded();
      
      // Test free plan button
      await page.click('text=Get Started Free');
      await expect(page).toHaveURL(/\/signup/);
      
      // Go back and test premium plan button
      await page.goBack();
      await page.locator('.pricing-section').scrollIntoViewIfNeeded();
      await page.click('text=Start Free Trial');
      await expect(page).toHaveURL(/\/signup\?trial=true/);
    });
  });

  test.describe('Social Proof Section', () => {
    test('should display testimonials and stats', async ({ page }) => {
      await page.locator('.social-proof-section').scrollIntoViewIfNeeded();
      
      // Check section header
      await expect(page.getByText('Trusted by Taiko Communities Worldwide')).toBeVisible();
      
      // Check testimonials
      await expect(page.getByText('Finally, a digital tool that respects traditional taiko pedagogy')).toBeVisible();
      await expect(page.getByText('Yamada Sensei')).toBeVisible();
      await expect(page.getByText('Sarah Chen')).toBeVisible();
      await expect(page.getByText('Takeshi Tanaka')).toBeVisible();
      
      // Check stats
      await expect(page.getByText('500+')).toBeVisible();
      await expect(page.getByText('Compositions Created')).toBeVisible();
      await expect(page.getByText('50+')).toBeVisible();
      await expect(page.getByText('Taiko Groups')).toBeVisible();
      await expect(page.getByText('15')).toBeVisible();
      await expect(page.getByText('Countries')).toBeVisible();
    });

    test('should show authentic testimonial content', async ({ page }) => {
      await page.locator('.social-proof-section').scrollIntoViewIfNeeded();
      
      // Check for authentic taiko terminology in testimonials
      await expect(page.getByText('kuchi shōga implementation')).toBeVisible();
      await expect(page.getByText('circular visualization helped our ensemble')).toBeVisible();
      await expect(page.getByText('MIDI files for our recordings')).toBeVisible();
      
      // Check for cultural authenticity
      await expect(page.getByText('Tokyo')).toBeVisible();
      await expect(page.getByText('Kodo Apprentice')).toBeVisible();
    });
  });

  test.describe('FAQ Section', () => {
    test('should display FAQ items with expandable answers', async ({ page }) => {
      await page.locator('.faq-section').scrollIntoViewIfNeeded();
      
      // Check section header
      await expect(page.getByText('Frequently Asked Questions')).toBeVisible();
      
      // Check FAQ questions are visible
      await expect(page.getByText('What is kuchi shōga notation?')).toBeVisible();
      await expect(page.getByText('Can I use this without taiko experience?')).toBeVisible();
      await expect(page.getByText('What\'s included in the free version?')).toBeVisible();
      await expect(page.getByText('How does the 14-day trial work?')).toBeVisible();
      
      // Test FAQ expansion
      const firstFaq = page.locator('.faq-item').first();
      const firstAnswer = firstFaq.locator('.faq-answer');
      
      // Answer should be hidden initially
      await expect(firstAnswer).not.toHaveClass(/open/);
      
      // Click to expand
      await firstFaq.locator('.faq-question').click();
      await expect(firstAnswer).toHaveClass(/open/);
      await expect(page.getByText('traditional Japanese method of expressing taiko rhythms')).toBeVisible();
      
      // Click again to collapse
      await firstFaq.locator('.faq-question').click();
      await expect(firstAnswer).not.toHaveClass(/open/);
    });

    test('should address key concerns and objections', async ({ page }) => {
      await page.locator('.faq-section').scrollIntoViewIfNeeded();
      
      // Test specific FAQ content
      await page.click('text=What\'s included in the free version?');
      await expect(page.getByText('basic kuchi shōga notation, single drum compositions')).toBeVisible();
      
      await page.click('text=How does the 14-day trial work?');
      await expect(page.getByText('no credit card required')).toBeVisible();
      await expect(page.getByText('Cancel anytime')).toBeVisible();
      
      await page.click('text=Can I export my compositions?');
      await expect(page.getByText('Premium users can export to MIDI')).toBeVisible();
    });
  });

  test.describe('Final CTA Section', () => {
    test('should display compelling final call-to-action', async ({ page }) => {
      await page.locator('.final-cta-section').scrollIntoViewIfNeeded();
      
      // Check compelling headline
      await expect(page.getByText('Ready to Transform Your Taiko Composition?')).toBeVisible();
      await expect(page.getByText('Join hundreds of taiko artists')).toBeVisible();
      
      // Check CTA buttons
      await expect(page.locator('.final-cta-section').getByText('Start Free Trial')).toBeVisible();
      await expect(page.locator('.final-cta-section').getByText('View Pricing')).toBeVisible();
      
      // Check final trust indicators
      await expect(page.locator('.cta-features').getByText('14-day free trial')).toBeVisible();
      await expect(page.locator('.cta-features').getByText('No credit card required')).toBeVisible();
      await expect(page.locator('.cta-features').getByText('Cancel anytime')).toBeVisible();
    });

    test('should handle final CTA button clicks', async ({ page }) => {
      await page.locator('.final-cta-section').scrollIntoViewIfNeeded();
      
      // Test final trial CTA
      await page.locator('.final-cta-section').getByText('Start Free Trial').click();
      await expect(page).toHaveURL(/\/signup\?trial=true/);
      
      // Go back and test pricing CTA
      await page.goBack();
      await page.locator('.final-cta-section').scrollIntoViewIfNeeded();
      await page.locator('.final-cta-section').getByText('View Pricing').click();
      await expect(page).toHaveURL(/\/pricing/);
    });
  });

  test.describe('Footer', () => {
    test('should display comprehensive footer navigation', async ({ page }) => {
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      
      // Check brand section
      await expect(page.getByText('Taiko Composer')).toBeVisible();
      await expect(page.getByText('Traditional taiko composition for the digital age')).toBeVisible();
      
      // Check navigation sections
      await expect(page.getByText('Product')).toBeVisible();
      await expect(page.getByText('Support')).toBeVisible();
      await expect(page.getByText('Company')).toBeVisible();
      await expect(page.getByText('Legal')).toBeVisible();
      
      // Check specific links
      await expect(page.locator('.footer-links').getByText('Pricing')).toBeVisible();
      await expect(page.locator('.footer-links').getByText('Features')).toBeVisible();
      await expect(page.locator('.footer-links').getByText('Help Center')).toBeVisible();
      await expect(page.locator('.footer-links').getByText('Privacy')).toBeVisible();
      
      // Check copyright
      await expect(page.getByText('© 2024 Taiko Composer. All rights reserved.')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work properly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      // Check hero section adapts
      await expect(page.locator('.hero-title')).toBeVisible();
      await expect(page.getByText('Start Free Trial')).toBeVisible();
      
      // Check features grid adapts
      await page.locator('.features-section').scrollIntoViewIfNeeded();
      await expect(page.getByText('Kuchi Shōga Notation')).toBeVisible();
      
      // Check pricing cards stack
      await page.locator('.pricing-section').scrollIntoViewIfNeeded();
      await expect(page.getByText('Free')).toBeVisible();
      await expect(page.getByText('Premium')).toBeVisible();
      
      // Check FAQ works on mobile
      await page.locator('.faq-section').scrollIntoViewIfNeeded();
      const firstFaq = page.locator('.faq-item').first();
      await firstFaq.locator('.faq-question').click();
      await expect(page.getByText('traditional Japanese method')).toBeVisible();
    });

    test('should work properly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      // Check layout adapts but remains functional
      await expect(page.locator('.hero-title')).toBeVisible();
      await expect(page.locator('.features-grid')).toBeVisible();
      await expect(page.locator('.pricing-cards')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check h1 is present and unique
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      await expect(page.locator('h1')).toContainText('Create Traditional Taiko Compositions');
      
      // Check h2 headings for sections
      await expect(page.getByRole('heading', { level: 2 }).filter({ hasText: 'Everything You Need' })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2 }).filter({ hasText: 'Simple, Transparent Pricing' })).toBeVisible();
    });

    test('should have accessible buttons and links', async ({ page }) => {
      // Check buttons have accessible text
      await expect(page.getByRole('button', { name: 'Start Free Trial' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Watch Demo' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible();
      
      // Check interactive elements are keyboard accessible
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      // Should navigate (basic keyboard navigation test)
    });

    test('should load key images and visual elements', async ({ page }) => {
      // Check that visual elements are present
      await expect(page.locator('.rhythm-circle')).toBeVisible();
      await expect(page.locator('.syllable.don')).toBeVisible();
      await expect(page.locator('.feature-icon')).toBeVisible();
      
      // Check premium badges are visible
      await expect(page.locator('.premium-badge')).toBeVisible();
    });
  });

  test.describe('Conversion Tracking', () => {
    test('should track key conversion events', async ({ page }) => {
      // Mock analytics tracking
      await page.addInitScript(() => {
        (window as any).conversionEvents = [];
        (window as any).trackConversion = (event: string) => {
          (window as any).conversionEvents.push(event);
        };
      });
      
      // Test trial signup tracking
      await page.click('text=Start Free Trial');
      
      // In a real implementation, this would track conversion events
      // For now, we just verify the navigation works
      await expect(page).toHaveURL(/\/signup\?trial=true/);
    });
  });
});