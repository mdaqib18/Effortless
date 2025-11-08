# Effortless Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from Notion (clean productivity), Framer (smooth motion), and Apple Clock (precision timing) to create a futuristic, ambient automation platform.

## Core Visual Identity

### Color System
- **Primary**: Indigo `#6366F1` - Main actions, focus states, AI elements
- **Success**: Green `#22C55E` - Completed tasks, confirmations
- **Base**: Dark `#0F172A` - Background foundation
- **Glow Accents**: `rgba(99,102,241,0.3)` - Soft halos, glassmorphic effects

### Typography
- **Font Stack**: Inter / Manrope / Satoshi (Google Fonts CDN)
- **Hierarchy**: 
  - Hero text: 2.5rem+ bold
  - Section headers: 1.5-2rem semibold
  - Body: 1rem regular
  - Micro-copy: 0.875rem medium

### Spacing System
**Tailwind units**: Consistently use `p-4`, `p-6`, `p-8` for cards; `gap-4`, `gap-6` for grids; `space-y-6`, `space-y-8` for vertical flow.

## Layout Architecture

### Authentication Pages
- Centered card layout (`max-w-md mx-auto`)
- Floating glassmorphic container with soft backdrop blur
- Input fields with glow-on-focus treatment
- "Welcome back, [Name] 👋" greeting post-login
- Smooth transition between sign-in/sign-up states

### Chat Interface
- Floating chat positioned bottom-right or as full-screen overlay
- Message bubbles: user (right-aligned, indigo), AI (left-aligned, dark with glow)
- Typing indicator: pulsing dots animation
- Action cards slide in below AI responses with icon + description
- Voice mic button with ripple-on-press effect

### Dashboard
- **Grid Layout**: Multi-column card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Task Cards**: Glassmorphic design with:
  - Category icon (top-left): 🚕 cabs, 🛒 groceries, 💳 bills, 🍔 food, ⏰ reminders
  - Live progress bar with animated fill
  - Status badge (pending/active/completed)
  - Action icons (Run ▶️, Pause ⏸, Edit ✏️, Delete 🗑) with functional hover states
- **Tabs**: Active, Routine, Completed - underline indicator slides between states
- **Spacing**: Generous padding (`p-6` cards, `gap-6` grid)

### Notification System
- **Alarm Popups**: Full-screen translucent overlay (`backdrop-blur-xl`)
- Centered modal with:
  - Large countdown timer
  - Task description
  - Three buttons: [Proceed ✅] [Snooze 💤] [Dismiss ❌]
- Slide-up entrance with scale pulse
- Auto-dismiss timer visual feedback

## Component Design

### Buttons
- Primary: Indigo fill, white text, subtle glow on hover
- Secondary: Outline with indigo border, transparent background
- **Critical**: Buttons on images need blurred backgrounds (`backdrop-blur-md bg-white/10`)
- Ripple press effect, no custom hover states (use defaults)

### Cards
- Glassmorphic: `bg-white/5 backdrop-blur-lg border border-white/10`
- Rounded corners: `rounded-2xl`
- Shadow: `shadow-xl` with colored glow for active states
- Hover: Subtle lift (`hover:translate-y-[-2px]`) and glow intensification

### Loading States
- **Shimmer placeholders**: Gradient animation for skeleton cards
- **Spinners**: Circular indigo loader with rotating motion
- **Progress bars**: Animated width transition, gradient fill

### Icons
- **Library**: Lucide React (CDN)
- **Sizes**: 20px standard, 24px for primary actions, 16px for micro-icons
- **Treatment**: All functional, no decorative-only icons
- Hover glow on interactive icons

## Animation & Motion

### Timing
- **Standard transitions**: `0.4s` for cards, buttons, modals
- **Complex animations**: `0.6-0.8s` for page transitions, multi-step flows
- **Easing**: Spring physics (`type: "spring", stiffness: 300, damping: 30`)

### Key Animations
- **Chat bubbles**: Slide-in from bottom with fade
- **Task cards**: Staggered entrance with slight scale
- **Confetti**: Burst effect on task completion
- **Status updates**: Smooth gradient shift, pulse effect
- **AI thinking**: Pulsing dots, typing indicator

### Micro-interactions
- Button press: Depth animation (`scale: 0.95`)
- Icon hover: Glow effect
- Input focus: Border glow and scale
- Success states: Bounce-in effect

## Page-Specific Treatments

### No Hero Image
This is a web application dashboard - no marketing hero needed. Launch directly into authentication or dashboard.

### Real-time Updates
- Socket.io-driven status changes animate smoothly
- Multi-phase lifecycle indicators (driver found → en route → arrived)
- Live ETA countdown with numeric updates
- Progress bars fill dynamically with smooth transitions

## Accessibility & Functionality
- All icons functional with click/tap handlers
- Keyboard navigation for all interactive elements
- Focus states visible with indigo glow
- Screen reader labels on all actions
- Sound alerts optional (user-controlled)

## Visual Cohesion
- Consistent glassmorphic treatment across all containers
- Unified color palette throughout (no arbitrary colors)
- Smooth transitions between all states (no jarring cuts)
- Ambient glow effects reinforce futuristic aesthetic
- Every element serves functional purpose while looking premium