# Effortless - AI-Powered Personal Automation Platform

## Overview

Effortless is a full-stack web application that enables users to automate everyday tasks through natural language commands. Users can book cabs, pay bills, order groceries and food, and set reminders by simply typing or speaking their requests. The system uses Google's Gemini AI to parse natural language prompts into structured automation tasks, which are then executed through realistic mock simulations with real-time updates via WebSocket connections.

The application features a modern, futuristic design inspired by Notion's clean productivity interface, Framer's smooth animations, and Apple's precision timing, creating an ambient automation platform with glassmorphic effects and smooth transitions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and API caching

**UI Framework:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system
- Framer Motion for declarative animations and transitions
- Custom dark theme with indigo primary color (#6366F1) and glassmorphic effects

**Design System:**
- Component-based architecture with reusable UI primitives
- Centralized theme configuration in `index.css` with CSS variables
- Custom spacing, typography, and color systems following design guidelines
- Glassmorphic cards with backdrop blur and gradient overlays
- Responsive grid layouts (mobile-first approach)

**Key Frontend Patterns:**
- Separation of concerns: pages, components, hooks, and utilities in distinct directories
- Real-time updates via Socket.io client connection
- Optimistic UI updates with server reconciliation
- Toast notifications for user feedback
- Animation orchestration using Framer Motion's AnimatePresence

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js as the HTTP server framework
- TypeScript for type safety across the stack
- Socket.io for bidirectional real-time communication
- ESM (ES Modules) for modern JavaScript module system

**API Design:**
- RESTful endpoints for task CRUD operations
- `/api/ai/parse` endpoint for natural language processing
- `/api/order/create` - Generic order endpoint with internal routing (grocery/food/medicine)
- Mock automation endpoints simulating real-world services:
  - `/api/cab/book` - Multi-phase cab booking lifecycle
  - `/api/bill/pay` - Bill payment processing with 3D Secure simulation
  - `/api/grocery/order` - Grocery order with delivery tracking (BigBasket, Instamart, etc.)
  - `/api/food/order` - Food delivery with restaurant prep stages (Zomato, Swiggy, etc.)
  - `/api/medicine/order` - Medicine order with pharmacy delivery (Apollo, PharmEasy, etc.)
  - `/api/reminder/create` - Scheduled notifications via cron

**Real-Time Architecture:**
- Socket.io server broadcasts task updates to all connected clients
- Event-driven updates: `taskUpdate` events emitted during automation phases
- Stateful connections maintained throughout user session
- Multi-phase progress updates with percentage tracking

**Automation Execution:**
- Node-cron for scheduling recurring tasks and reminders
- Async/await pattern for simulating realistic delays
- Randomized data generation for authentic mock responses
- Status progression through defined lifecycle phases

### Data Storage

**Current Implementation:**
- In-memory storage using Map data structures for development
- `MemStorage` class implementing storage interface
- UUID-based task identification
- Timestamp tracking for created/updated fields

**Database Schema (Drizzle ORM Ready):**
- Configured for PostgreSQL via Drizzle Kit
- Neon Database serverless driver integration
- Schema defined in `shared/schema.ts` with Zod validation:
  - `tasks` table: automation task records with type, status, and metadata
  - Support for task types: cab, bill, grocery, food, reminder
  - Status tracking: pending, active, completed, failed, cancelled
  - Recurrence patterns: once, daily, weekly, monthly

**Migration Strategy:**
- Drizzle Kit configured for schema migrations
- Prepared for seamless transition from in-memory to PostgreSQL
- Shared schema types between client and server via TypeScript

### Authentication and Authorization

**Firebase Authentication:**
- Email/password authentication
- Google OAuth integration via Firebase redirect flow
- Client-side auth state management with Firebase SDK
- Redirect-based flow for OAuth providers (required for Replit environment)
- Auth state persistence using `onAuthStateChanged` observer
- User ID used for task isolation and data access control

**Security Considerations:**
- Environment variables for Firebase configuration
- No backend session management (stateless API with Firebase verification ready)
- Client-side route protection based on auth state

### AI Integration

**Gemini API Integration:**
- Google GenAI SDK for natural language understanding
- Structured prompt engineering for automation task extraction
- JSON response parsing with TypeScript interfaces
- Fallback mechanism to mock parsing when API key unavailable

**Prompt Processing:**
- System prompt defines task types and expected JSON schema
- Entity extraction: action, platform, time, recurrence, category
- Intent detection for booking, ordering, payment, and reminder actions
- Clarification questions when information is incomplete
- Friendly AI responses to build conversational experience

**Response Structure:**
- Parsed automation tasks include: taskType, action, platform, time, recurrence
- Confirmation flags for user validation before execution
- Reply messages for conversational feedback

## External Dependencies

### Third-Party Services

**Google Gemini AI:**
- Purpose: Natural language processing and intent recognition
- Integration: `@google/genai` SDK
- Configuration: API key via environment variable `GEMINI_API_KEY`
- Fallback: Mock parser when API unavailable

**Firebase:**
- Purpose: User authentication and identity management
- Services: Authentication (Email/Password, Google OAuth)
- Configuration: Environment variables for project ID, API key, app ID
- SDK: Firebase v10+ with modular imports

**Neon Database (Configured, Not Active):**
- Purpose: PostgreSQL database for production deployment
- Integration: `@neondatabase/serverless` driver
- Configuration: `DATABASE_URL` environment variable
- Status: Schema ready, in-memory storage currently active

### Development Tools

**Vite Plugins:**
- `@vitejs/plugin-react` - React Fast Refresh and JSX transformation
- `@replit/vite-plugin-runtime-error-modal` - Enhanced error reporting
- `@replit/vite-plugin-cartographer` - Development tooling (Replit-specific)
- `@replit/vite-plugin-dev-banner` - Development environment indicators

**Build and Development:**
- TypeScript compiler for type checking (`tsc`)
- esbuild for server-side bundling
- PostCSS with Tailwind CSS and Autoprefixer
- Path aliases: `@/` for client src, `@shared/` for shared types

### UI Component Libraries

**Radix UI Primitives:**
- Comprehensive set of unstyled, accessible component primitives
- Dialog, Dropdown Menu, Popover, Tabs, Toast, and 20+ other components
- ARIA-compliant with keyboard navigation support
- Customized via Tailwind CSS according to design system

**Supporting Libraries:**
- `socket.io-client` - Real-time WebSocket communication
- `framer-motion` - Animation and gesture library
- `react-hook-form` - Form state management with validation
- `zod` - Schema validation for runtime type safety
- `date-fns` - Date manipulation and formatting
- `lucide-react` - Icon library with consistent design
- `class-variance-authority` - Type-safe component variants
- `cmdk` - Command palette component

### Production Dependencies

**Core Runtime:**
- React 18+ with concurrent features
- Express.js server framework
- Socket.io for WebSocket server and client
- Drizzle ORM with PostgreSQL dialect

**Session Management (Configured):**
- `connect-pg-simple` - PostgreSQL session store for Express
- Ready for production session persistence

**Scheduling:**
- `node-cron` - Cron-based task scheduling for reminders and recurring automations