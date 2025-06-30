# Taiko Composer

A web application for traditional taiko ensemble composition using kuchi shōga notation.

## Description

This application provides a digital platform for creating and composing traditional Japanese taiko drumming pieces. It supports kuchi shōga notation, which is the traditional oral method of expressing taiko rhythms using syllables.

## Features

### ✅ Implemented
- **Kuchi Shōga Notation System** - Complete syllable input and validation (don, ka, doko, tsu)
- **Regional Style Support** - Standard, Kanto, and Kansai notation variations
- **Pattern Input** - Text and visual notation modes with conversion
- **Linear Grid Interface** - Interactive beat-by-beat pattern editing with visual feedback
- **Circular Rhythm Visualization** - Polar coordinate beat cycle display with interactive editing
- **Ensemble Coordination System** - Multi-drum role management with traditional hierarchy
  - Ensemble mode toggle for advanced composition workflows
  - Traditional role assignment (lead, accompaniment, foundation, accent)
  - Smart volume balancing based on drum characteristics
  - Mute/Solo controls with manual vs automatic tracking
  - Overview grid with statistics and visual indicators
  - Hierarchy view following traditional jo-ha-kyū principles
- **Pronunciation Guide** - Interactive syllable reference with audio examples
- **Settings Management** - Customizable notation preferences with localStorage
- **Hand Sticking Notation** - R/L indicators for technique specification
- **Real-time Audio Playback** - Complete Web Audio API integration for kuchi shōga syllables
  - Individual syllable sound generation with drum-specific timbres
  - Tempo-synchronized pattern playback with beat indicators
  - Ensemble coordination with multi-part audio mixing
  - Volume balancing per drum type with master volume control
  - Loop mode and metronome integration with visual feedback
  - Audio feedback for pattern editing and beat interaction
  - Pitch adjustment and playback rate controls
  - Real-time audio context management and browser compatibility
- **Freemium Business Model** - Complete subscription and payment system
  - Free tier with 3 composition limit and basic features
  - Premium tier with unlimited access and advanced features
  - Feature gating system with premium upgrade prompts
  - Usage tracking and analytics
  - Subscription state management with localStorage persistence
- **Mock Stripe Integration** - Full payment processing simulation
  - Professional checkout flow with billing forms
  - Free trial management (14-day trials)
  - Payment success/failure handling
  - Subscription lifecycle management (cancel, upgrade, retry)
  - Invoice generation and billing history
  - Tax calculation by region
  - Comprehensive pricing page with feature comparison
- **Landing Page & Marketing** - Conversion-optimized marketing website
  - Hero section with 3D app preview and compelling CTAs
  - Features showcase with premium badges and authentic taiko terminology
  - Integrated pricing section with trial signup flows
  - Social proof with testimonials and usage statistics
  - Interactive FAQ addressing common concerns
  - Final conversion CTA with multiple engagement paths
  - Professional footer with comprehensive navigation
  - Mobile-responsive design with smooth animations
  - SEO-optimized structure and performance

### ✅ Implemented (continued)
- **Complete User Authentication System** - Full signup, login, and session management
  - Email/password authentication with validation
  - Social login (Google, GitHub OAuth)
  - Password reset and email verification flows
  - Secure session management with localStorage persistence
  - Profile management and account settings
  - Account deletion with confirmation flows
- **Authentication UI Components** - Professional modal-based auth interface
  - LoginModal with social auth and remember me
  - SignupModal with password strength validation
  - ForgotPasswordModal for password reset flows
  - UserMenu with subscription status and account access
- **Integrated Navigation & Authentication** - Seamless user experience
  - Fixed navigation header with authentication buttons
  - Route-based modal system (/login, /signup, /forgot-password)
  - Responsive design with mobile optimization
  - Authentication state management across the application
- **Complete Account Dashboard** - Full subscription and profile management
  - Profile information management with validation
  - Subscription status display (Free, Trial, Premium)
  - Usage tracking and limits for free tier users
  - Billing information and payment method management
  - Password change functionality with security validation
  - Account deletion with multi-step confirmation
  - Trial status tracking with upgrade prompts
  - Comprehensive subscription management interface

### 🚧 In Development
- **Feature Gating System** - Restrict premium features for free users
- **Usage Tracking** - Real-time limits for free tier users

### 📋 Planned
- **Real-time Collaboration** - Multi-user composition sessions
- **Pattern Library** - Traditional tetsuke patterns collection
- **AI-Powered Suggestions** - Smart composition recommendations
- Traditional jo-ha-kyū form structure
- Polyrhythmic analysis tools
- Tempo transition controls
- Choreography integration
- Advanced export capabilities (enhanced MIDI, audio, sheet music)
- Real Stripe integration (replacing mock)
- Advanced usage analytics and insights

## Live Demo

🎵 **[Try it live at trustquote.vercel.app](https://trustquote.vercel.app)**

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Payments**: Mock Stripe integration (ready for production Stripe)
- **Authentication**: Complete auth system with social login (ready for real auth provider)
- **Testing**: Vitest, Playwright
- **Build Tool**: Vite
- **Deployment**: Vercel

## Project Structure

- `/src` - Source code
  - `/components` - Vue components including premium gates, pricing, and auth modals
  - `/composables` - Vue composables for freemium and subscription logic
  - `/services` - Business logic services (subscription, stripe, auth, audio)
  - `/types` - TypeScript type definitions including auth types
  - `/views` - Page components (landing, composition, pricing, checkout, success)
- `/tests` - Test files
  - `/e2e` - Playwright end-to-end tests for landing page, freemium, payment, and auth flows
- `/public` - Static assets

## Application Routes

- `/` - Landing page with marketing content and conversion CTAs
- `/compose` - Main composition application interface
- `/pricing` - Detailed pricing page with feature comparison
- `/checkout` - Payment processing and subscription signup
- `/payment-success` - Post-purchase confirmation and onboarding
- `/signup` - User registration with trial options
- `/login` - User authentication with social login
- `/forgot-password` - Password reset flow
- `/reset-password` - Password reset confirmation
- `/account` - Account management and billing dashboard

## Freemium Model

### Free Tier
- ✅ Basic kuchi shōga notation (don, ka, doko, tsu)
- ✅ Single drum compositions
- ✅ Linear grid interface
- ✅ Basic audio playback
- ✅ Pronunciation guide
- ✅ Up to 3 saved compositions

### Premium Tier ($9.99/month)
- ✅ Everything in free tier
- ✅ Unlimited compositions
- ✅ Multi-drum ensemble coordination
- ✅ Circular rhythm visualization
- ✅ Regional style variations (Kanto, Kansai)
- ✅ Export capabilities (MIDI, audio, sheet music)
- 🚧 Real-time collaboration
- 📋 Pattern library access
- 📋 AI-powered composition suggestions
- 📋 Advanced audio features

### Payment System
- ✅ 14-day free trial
- ✅ Professional checkout flow
- ✅ Subscription management
- ✅ Usage tracking and limits
- ✅ Premium feature gates
- ✅ Billing and invoice management

### Marketing & Conversion
- ✅ Landing page with hero section and 3D app preview
- ✅ Features showcase with premium differentiation
- ✅ Social proof and testimonials
- ✅ Interactive FAQ section
- ✅ Multiple conversion CTAs and trial signup flows
- ✅ Mobile-responsive design
- ✅ SEO optimization and performance
- ✅ Integrated navigation with authentication
- ✅ Route-based authentication modals
- ✅ Complete user onboarding flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Submit a pull request

## License

This project is licensed under the MIT License.