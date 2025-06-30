<template>
  <div class="landing-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Create Traditional <span class="highlight">Taiko</span> Compositions
            </h1>
            <p class="hero-subtitle">
              The first digital platform for composing traditional Japanese taiko drumming pieces using authentic kuchi shōga notation.
            </p>
            
            <div class="hero-cta">
              <button 
                class="cta-primary"
                @click="startFreeTrial"
              >
                Start Free Trial
              </button>
              <button 
                class="cta-secondary"
                @click="watchDemo"
              >
                <svg class="play-icon" viewBox="0 0 24 24" fill="none">
                  <path d="m3 2 18 10L3 22V2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                </svg>
                Watch Demo
              </button>
            </div>
            
            <div class="hero-features">
              <div class="feature-badge">
                <span class="badge-icon">✓</span>
                <span>14-day free trial</span>
              </div>
              <div class="feature-badge">
                <span class="badge-icon">✓</span>
                <span>No credit card required</span>
              </div>
              <div class="feature-badge">
                <span class="badge-icon">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div class="hero-visual">
            <div class="app-preview">
              <div class="preview-window">
                <div class="window-header">
                  <div class="window-controls">
                    <div class="control red"></div>
                    <div class="control yellow"></div>
                    <div class="control green"></div>
                  </div>
                  <div class="window-title">Taiko Composer</div>
                </div>
                <div class="window-content">
                  <div class="notation-demo">
                    <div class="notation-line">
                      <span class="syllable don">don</span>
                      <span class="syllable ka">ka</span>
                      <span class="syllable don">don</span>
                      <span class="syllable ka">ka</span>
                    </div>
                    <div class="notation-line">
                      <span class="syllable doko">doko</span>
                      <span class="syllable tsu">tsu</span>
                      <span class="syllable don">don</span>
                      <span class="syllable ka">ka</span>
                    </div>
                  </div>
                  <div class="circular-preview">
                    <div class="circle-container">
                      <svg class="rhythm-circle" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#6366f1" stroke-width="2"/>
                        <circle cx="100" cy="20" r="6" fill="#ff6b6b"/>
                        <circle cx="180" cy="100" r="6" fill="#10b981"/>
                        <circle cx="100" cy="180" r="6" fill="#f59e0b"/>
                        <circle cx="20" cy="100" r="6" fill="#8b5cf6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2>Everything You Need for Taiko Composition</h2>
          <p>From traditional notation to modern ensemble coordination</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🥁</div>
            <h3>Kuchi Shōga Notation</h3>
            <p>Traditional Japanese rhythm syllables (don, ka, doko, tsu) with authentic pronunciation guides and audio examples.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎼</div>
            <h3>Ensemble Coordination</h3>
            <p>Multi-drum compositions with traditional hierarchy following jo-ha-kyū principles and role-based volume balancing.</p>
            <div class="premium-badge">Premium</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⭕</div>
            <h3>Circular Visualization</h3>
            <p>Interactive polar coordinate rhythm display for intuitive beat cycle understanding and advanced editing.</p>
            <div class="premium-badge">Premium</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔊</div>
            <h3>Real-time Audio</h3>
            <p>High-quality Web Audio API integration with drum-specific timbres and tempo-synchronized playback.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🌍</div>
            <h3>Regional Styles</h3>
            <p>Support for Kanto and Kansai notation variations alongside standard kuchi shōga syllables.</p>
            <div class="premium-badge">Premium</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📤</div>
            <h3>Export Capabilities</h3>
            <p>Export compositions to MIDI, audio files, sheet music, and traditional kuchi shōga notation formats.</p>
            <div class="premium-badge">Premium</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section">
      <div class="container">
        <div class="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Start free, upgrade when you're ready</p>
        </div>
        
        <div class="pricing-cards">
          <!-- Free Plan -->
          <div class="pricing-card">
            <div class="plan-header">
              <h3>Free</h3>
              <div class="plan-price">
                <span class="amount">$0</span>
                <span class="period">forever</span>
              </div>
              <p class="plan-description">Perfect for getting started</p>
            </div>
            
            <div class="plan-features">
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Basic kuchi shōga notation</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Single drum compositions</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Linear grid interface</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Basic audio playback</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Up to 3 saved compositions</span>
              </div>
            </div>
            
            <button class="plan-button free-button" @click="getStartedFree">
              Get Started Free
            </button>
          </div>
          
          <!-- Premium Plan -->
          <div class="pricing-card featured">
            <div class="popular-badge">Most Popular</div>
            <div class="plan-header">
              <h3>Premium</h3>
              <div class="plan-price">
                <span class="amount">$9.99</span>
                <span class="period">/month</span>
              </div>
              <p class="plan-description">For serious composers</p>
            </div>
            
            <div class="plan-features">
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Everything in Free</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Unlimited compositions</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Multi-drum ensemble coordination</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Circular rhythm visualization</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Regional style variations</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Export capabilities</span>
              </div>
              <div class="feature-item">
                <span class="check">✓</span>
                <span>Priority support</span>
              </div>
            </div>
            
            <button class="plan-button premium-button" @click="startPremiumTrial">
              Start Free Trial
            </button>
            <p class="trial-note">14 days free, then $9.99/month</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof Section -->
    <section class="social-proof-section">
      <div class="container">
        <div class="section-header">
          <h2>Trusted by Taiko Communities Worldwide</h2>
        </div>
        
        <div class="testimonials">
          <div class="testimonial">
            <div class="testimonial-content">
              <p>"Finally, a digital tool that respects traditional taiko pedagogy while embracing modern technology. The kuchi shōga implementation is authentic and the ensemble features are game-changing."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">
                <div class="avatar-placeholder">山</div>
              </div>
              <div class="author-info">
                <div class="author-name">Yamada Sensei</div>
                <div class="author-title">Taiko Master, Tokyo</div>
              </div>
            </div>
          </div>
          
          <div class="testimonial">
            <div class="testimonial-content">
              <p>"The circular visualization helped our ensemble understand complex polyrhythms instantly. Our students are composing pieces we never thought possible at their level."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">
                <div class="avatar-placeholder">S</div>
              </div>
              <div class="author-info">
                <div class="author-name">Sarah Chen</div>
                <div class="author-title">Music Educator, San Francisco Taiko</div>
              </div>
            </div>
          </div>
          
          <div class="testimonial">
            <div class="testimonial-content">
              <p>"Being able to export MIDI files for our recordings while maintaining traditional notation workflow is exactly what we needed. This bridges old and new perfectly."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">
                <div class="avatar-placeholder">田</div>
              </div>
              <div class="author-info">
                <div class="author-name">Takeshi Tanaka</div>
                <div class="author-title">Composer, Kodo Apprentice</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="stats-bar">
          <div class="stat">
            <div class="stat-number">500+</div>
            <div class="stat-label">Compositions Created</div>
          </div>
          <div class="stat">
            <div class="stat-number">50+</div>
            <div class="stat-label">Taiko Groups</div>
          </div>
          <div class="stat">
            <div class="stat-number">15</div>
            <div class="stat-label">Countries</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <div class="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        
        <div class="faq-grid">
          <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
            <div class="faq-question" @click="toggleFaq(index)">
              <h3>{{ faq.question }}</h3>
              <span class="faq-toggle" :class="{ expanded: faq.isOpen }">+</span>
            </div>
            <div class="faq-answer" :class="{ open: faq.isOpen }">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="final-cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Transform Your Taiko Composition?</h2>
          <p>Join hundreds of taiko artists already using Taiko Composer to create authentic, powerful drumming pieces.</p>
          
          <div class="cta-buttons">
            <button class="cta-primary large" @click="startFreeTrial">
              Start Free Trial
            </button>
            <button class="cta-secondary large" @click="viewPricing">
              View Pricing
            </button>
          </div>
          
          <div class="cta-features">
            <span>✓ 14-day free trial</span>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3>Taiko Composer</h3>
            <p>Traditional taiko composition for the digital age</p>
          </div>
          
          <div class="footer-links">
            <div class="link-group">
              <h4>Product</h4>
              <a href="/pricing">Pricing</a>
              <a href="/features">Features</a>
              <a href="/demo">Demo</a>
            </div>
            
            <div class="link-group">
              <h4>Support</h4>
              <a href="/help">Help Center</a>
              <a href="/contact">Contact</a>
              <a href="/tutorials">Tutorials</a>
            </div>
            
            <div class="link-group">
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/blog">Blog</a>
              <a href="/careers">Careers</a>
            </div>
            
            <div class="link-group">
              <h4>Legal</h4>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/security">Security</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 Taiko Composer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// FAQ data
const faqs = reactive([
  {
    question: "What is kuchi shōga notation?",
    answer: "Kuchi shōga is the traditional Japanese method of expressing taiko rhythms using syllables like 'don', 'ka', 'doko', and 'tsu'. Each syllable represents different drum sounds and playing techniques.",
    isOpen: false
  },
  {
    question: "Can I use this without taiko experience?",
    answer: "Absolutely! Our built-in pronunciation guide and tutorials make it easy for beginners to learn traditional taiko notation while experienced players can dive into advanced ensemble features.",
    isOpen: false
  },
  {
    question: "What's included in the free version?",
    answer: "The free version includes basic kuchi shōga notation, single drum compositions, linear grid interface, basic audio playback, and up to 3 saved compositions - perfect for learning and simple pieces.",
    isOpen: false
  },
  {
    question: "How does the 14-day trial work?",
    answer: "Start your trial instantly with just an email - no credit card required. You'll have full access to all premium features for 14 days. Cancel anytime or continue with our monthly subscription.",
    isOpen: false
  },
  {
    question: "Can I export my compositions?",
    answer: "Premium users can export to MIDI files for digital audio workstations, audio files (MP3/WAV), sheet music (PDF), and traditional kuchi shōga notation (TXT). Free users can view but not export.",
    isOpen: false
  },
  {
    question: "Do you support different regional styles?",
    answer: "Yes! Premium users can switch between Standard, Kanto, and Kansai notation styles, each with authentic syllable variations used in different regions of Japan.",
    isOpen: false
  }
])

// Methods
const toggleFaq = (index: number) => {
  faqs[index].isOpen = !faqs[index].isOpen
}

const startFreeTrial = () => {
  router.push('/signup?trial=true')
}

const startPremiumTrial = () => {
  router.push('/signup?trial=true&plan=premium')
}

const getStartedFree = () => {
  router.push('/signup')
}

const viewPricing = () => {
  router.push('/pricing')
}

const watchDemo = () => {
  // Would open demo video modal or redirect to demo page
  console.log('Demo clicked')
}
</script>

<style scoped>
.landing-view {
  background: #1a1a1a;
  color: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero-section {
  padding: 4rem 0 6rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.highlight {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #cccccc;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cta-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.cta-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: #cccccc;
  border: 1px solid #3a3a3a;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-secondary:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.play-icon {
  width: 16px;
  height: 16px;
}

.hero-features {
  display: flex;
  gap: 2rem;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-size: 0.875rem;
}

.badge-icon {
  width: 16px;
  height: 16px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* App Preview */
.app-preview {
  position: relative;
  perspective: 1000px;
}

.preview-window {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  overflow: hidden;
  transform: rotateY(-15deg) rotateX(5deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #3a3a3a;
  border-bottom: 1px solid #4a4a4a;
}

.window-controls {
  display: flex;
  gap: 0.5rem;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control.red { background: #ff5f57; }
.control.yellow { background: #ffbd2e; }
.control.green { background: #28ca42; }

.window-title {
  font-weight: 600;
  color: #ffffff;
}

.window-content {
  padding: 2rem;
  height: 300px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.notation-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notation-line {
  display: flex;
  gap: 0.5rem;
}

.syllable {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-family: monospace;
}

.syllable.don { background: #ff6b6b; color: white; }
.syllable.ka { background: #4ecdc4; color: white; }
.syllable.doko { background: #45b7d1; color: white; }
.syllable.tsu { background: #f9ca24; color: black; }

.circular-preview {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-container {
  position: relative;
}

.rhythm-circle {
  width: 120px;
  height: 120px;
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: #2a2a2a;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.125rem;
  color: #cccccc;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #cccccc;
  line-height: 1.6;
}

.premium-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Pricing Section */
.pricing-section {
  padding: 6rem 0;
  background: #1a1a1a;
}

.pricing-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.pricing-card {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.pricing-card.featured {
  border-color: #6366f1;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.plan-price .amount {
  font-size: 2.5rem;
  font-weight: 800;
}

.plan-price .period {
  font-size: 1rem;
  color: #888;
  margin-left: 0.25rem;
}

.plan-description {
  color: #888;
  margin: 0;
}

.plan-features {
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.check {
  color: #10b981;
  font-weight: bold;
}

.plan-button {
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  margin-bottom: 0.5rem;
}

.free-button {
  background: transparent;
  color: #cccccc;
  border: 1px solid #3a3a3a;
}

.free-button:hover {
  background: #3a3a3a;
  color: #ffffff;
}

.premium-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.premium-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.trial-note {
  text-align: center;
  color: #888;
  font-size: 0.75rem;
  margin: 0;
}

/* Social Proof Section */
.social-proof-section {
  padding: 6rem 0;
  background: #2a2a2a;
}

.testimonials {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.testimonial {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 2rem;
}

.testimonial-content {
  margin-bottom: 1.5rem;
}

.testimonial-content p {
  font-style: italic;
  line-height: 1.6;
  color: #cccccc;
  margin: 0;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.author-name {
  font-weight: 600;
  color: #ffffff;
}

.author-title {
  font-size: 0.875rem;
  color: #888;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 4rem;
  padding: 2rem 0;
  border-top: 1px solid #3a3a3a;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #888;
  font-size: 0.875rem;
}

/* FAQ Section */
.faq-section {
  padding: 6rem 0;
  background: #1a1a1a;
}

.faq-grid {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid #3a3a3a;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  cursor: pointer;
  transition: color 0.2s;
}

.faq-question:hover {
  color: #6366f1;
}

.faq-question h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.faq-toggle {
  font-size: 1.5rem;
  font-weight: 300;
  transition: transform 0.2s;
}

.faq-toggle.expanded {
  transform: rotate(45deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-answer.open {
  max-height: 200px;
}

.faq-answer p {
  padding-bottom: 1.5rem;
  color: #cccccc;
  line-height: 1.6;
  margin: 0;
}

/* Final CTA Section */
.final-cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cta-primary.large,
.cta-secondary.large {
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
}

.cta-primary.large {
  background: white;
  color: #6366f1;
}

.cta-secondary.large {
  background: transparent;
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Footer */
.site-footer {
  background: #1a1a1a;
  border-top: 1px solid #3a3a3a;
  padding: 3rem 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  margin-bottom: 2rem;
}

.footer-brand h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.footer-brand p {
  color: #888;
  margin: 0;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.link-group h4 {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #ffffff;
}

.link-group a {
  display: block;
  color: #888;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.link-group a:hover {
  color: #6366f1;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #3a3a3a;
}

.footer-bottom p {
  color: #888;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-cta {
    flex-direction: column;
  }
  
  .hero-features {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .pricing-cards {
    grid-template-columns: 1fr;
  }
  
  .stats-bar {
    gap: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-features {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>