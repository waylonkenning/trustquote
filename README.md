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
- **Anonymous User Experience** - Friction-free "try before you buy" approach
  - Immediate composition access without registration
  - Guest mode with clear status indicators
  - Auto-save to localStorage for session persistence
  - Smart save system with dual options (signup vs download)
  - Seamless transition from anonymous to authenticated state
  - Contextual upgrade prompts and premium feature gates
  - JSON export for local backup and sharing
- **Comprehensive E2E Testing** - Full test coverage for user journeys
  - Anonymous user flows and composition creation
  - Authentication system and modal interactions
  - Feature gating and premium restrictions
  - Freemium model and subscription workflows
  - Stripe payment processing and billing
  - Landing page conversion funnels
  - Error handling and edge cases

### 🚧 In Development
- **Feature Gating System** - Complete premium feature restrictions (95% complete)
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

## User Experience Design

### Anonymous-First Approach
The application implements a "try before you buy" philosophy:

1. **Immediate Access**: Users can start composing without any barriers
2. **Progressive Enhancement**: Features unlock as users engage more deeply
3. **Smart Conversion**: Contextual prompts encourage registration at optimal moments
4. **Data Preservation**: Work is never lost during the signup process

### User Journey
```
Anonymous User → Create Composition → Try to Save → Sign Up & Save Forever
                                                 ↘ Download JSON (alternative)
```

### Authentication States
- **Anonymous**: Guest mode with localStorage persistence
- **Free**: Registered with cloud sync and composition limits
- **Premium**: Full feature access with unlimited usage

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite
- **State Management**: Pinia + Reactive Services
- **Routing**: Vue Router with modal-based auth
- **Testing**: Playwright E2E + Comprehensive test coverage
- **Payments**: Mock Stripe integration (production-ready)
- **Authentication**: Complete auth system with social login
- **Storage**: localStorage + Cloud sync hybrid approach
- **Build Tool**: Vite
- **Deployment**: Vercel

### Test Coverage
- `anonymous-user.spec.ts` - Anonymous user flows and composition creation
- `feature-gating.spec.ts` - Premium restrictions and upgrade flows
- `freemium-model.spec.ts` - Subscription tiers and usage limits  
- `stripe-payments.spec.ts` - Payment processing and billing
- `user-authentication.spec.ts` - Auth system and modal interactions
- `landing-page.spec.ts` - Marketing page and conversion funnels

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

### Anonymous Users (No Registration Required)
- ✅ Immediate composition access in guest mode
- ✅ Basic kuchi shōga notation (don, ka, doko, tsu)
- ✅ Single drum compositions with auto-save
- ✅ Linear grid interface and audio playback
- ✅ Settings and pronunciation guide
- ✅ JSON export for local backup
- ✅ Smart save prompts with signup incentives

### Free Tier (Registered Users)
- ✅ Everything anonymous users have
- ✅ Cloud save and sync across devices
- ✅ Up to 3 saved compositions
- ✅ Account dashboard and profile management

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