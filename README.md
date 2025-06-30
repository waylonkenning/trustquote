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
- **Audio Synthesis** - Web Audio API integration for syllable playback

### 🚧 In Development
- **Real-time Collaboration** - Multi-user composition sessions

### 📋 Planned
- Traditional jo-ha-kyū form structure
- Pattern library with named tetsuke patterns
- Polyrhythmic analysis tools
- Tempo transition controls
- AI-powered pattern recognition
- Choreography integration
- Export capabilities

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
- **Testing**: Vitest, Playwright
- **Build Tool**: Vite

## Project Structure

- `/src` - Source code
- `/tests` - Test files
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Submit a pull request

## License

This project is licensed under the MIT License.