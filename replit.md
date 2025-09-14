# CCTV: One Hour Lockdown

## Overview

CCTV: One Hour Lockdown is a luxury countdown application that creates an elegant, high-stakes countdown experience with UTC-based timing. The application features a sophisticated five-phase progression system that builds tension as it approaches an "unsealing" moment, transitioning from a locked state to revealing a feed grid. The system supports both one-shot events and recurring schedules, with a rich visual design emphasizing luxury aesthetics through metallic gold palettes, serif typography, and layered background effects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18+ with TypeScript**: Strict typing ensures code reliability and developer experience
- **Vite Build System**: Fast development server and optimized production builds
- **Component-Based Design**: Modular components for countdown display, feed grid, interactive elements, and visual effects
- **Custom Hook Pattern**: `useUtcCountdown` centralizes all countdown logic and state management
- **Accessibility-First**: Respects `prefers-reduced-motion` and `prefers-contrast` user preferences

### Design System
- **Luxury Visual Language**: Metallic gold (`#C9A76A`) and platinum (`#D6D6D6`) color palette with deep backgrounds
- **Typography Hierarchy**: Cormorant Garamond for headings, IBM Plex Mono for technical elements, Inter for body text
- **Layered Background Effects**: Particle veil, geometric lattice, grain texture, and vignette create depth
- **Five-Phase State Machine**: Visual progression from "Stillness" through "Calibration," "Synchronization," "Threshold," to "Unsealed"

### State Management
- **Phase-Based Logic**: Different visual states and behaviors based on remaining time thresholds
- **UTC-Only Timing**: No timezone dependencies, pure UTC calculations for universal consistency
- **Recurring vs One-Shot Modes**: Flexible scheduling system supporting daily, weekly, or specific datetime targets
- **Unseal State Tracking**: Manages transition from countdown to feed grid display with configurable display windows

### Configuration System
- **Environment-Driven**: All timing and integration settings managed through Replit Secrets
- **Validation Layer**: Runtime validation of configuration with graceful error handling
- **Schedule Computation**: Dynamic calculation of next target dates for recurring modes

### Visual Effects Architecture
- **Canvas-Based Particles**: Hardware-accelerated particle system with motion preference detection
- **CSS Animation Layers**: Multiple background effect layers using CSS animations and transforms
- **Responsive Design**: Mobile-first approach with adaptive layouts and touch-friendly interactions

### Backend Infrastructure
- **Express.js Server**: Minimal backend for static file serving and potential future API endpoints
- **Drizzle ORM**: Type-safe database operations with PostgreSQL schema support
- **Session Management**: PostgreSQL-backed session storage for future user features

## External Dependencies

### Core Framework Dependencies
- **React 18+**: Frontend framework with concurrent features
- **Vite 5+**: Build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **Tailwind CSS**: Utility-first styling framework with custom design tokens

### UI and Animation Libraries
- **Framer Motion**: Animation library for smooth transitions and micro-interactions
- **Radix UI**: Accessible component primitives for tooltips, dialogs, and form elements
- **Lucide React**: Icon library for consistent iconography

### Database and Backend
- **PostgreSQL**: Primary database (via Neon or similar cloud providers)
- **Drizzle ORM**: Type-safe database operations and migrations
- **Express.js**: Web server framework for static serving and API routes

### Development and Build Tools
- **ESLint + Prettier**: Code linting and formatting
- **PostCSS + Autoprefixer**: CSS processing and browser compatibility
- **tsx**: TypeScript execution for development server

### External Service Integrations
- **Etherscan API**: Blockchain contract address verification and links
- **Twitter/X Integration**: Social media profile linking with external handshake flow
- **UTC Time Services**: System clock synchronization for accurate countdown timing

### Environment Configuration
- **Replit Secrets Management**: Secure storage of configuration variables
- **ISO-8601 UTC Timestamps**: Standard datetime formatting for cross-platform compatibility
- **Contract Address Display**: Ethereum address truncation and verification links