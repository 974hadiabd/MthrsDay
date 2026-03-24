# Beats of You - PWA

## Project Overview
A romantic Progressive Web App (PWA) with a gothic aesthetic that features a password-protected heart animation experience.

## Architecture
- **Frontend**: React 19 with Framer Motion for animations
- **Storage**: localStorage only (no backend required for user data)
- **PWA**: Service Worker + Web App Manifest for native-like experience

## Core Features Implemented
1. **Password Gate** - Dark gothic screen with cobwebs, accepts two passwords
2. **Heart Animation** - Broken heart that mends with audio (Web Audio API)
3. **Swipeable Reasons** - Tinder-style card deck for "Reasons Why"
4. **Timeline View** - Vertical timeline with images and captions
5. **Editor Mode** - Full CRUD for content management
6. **PWA Support** - manifest.json, service-worker.js, iOS/Android install support

## Passwords
- **Editor Password**: `Hxdi.132` (full access, 3 tabs)
- **User Password**: `1234` (view only, 2 tabs)

### To Change User Password
Edit `/app/frontend/src/utils/storage.js` line 3:
```js
export const USER_PASSWORD = '1234'; // Change this value
```

## User Personas
- **User**: Views romantic content (reasons, timeline), experiences heart animation once
- **Editor**: Creates and manages content, skips heart animation

## P0 Features (Implemented)
- [x] Password authentication gate
- [x] Heart transition animation with audio
- [x] Swipeable reasons cards
- [x] Timeline with image support
- [x] Editor CRUD operations
- [x] localStorage persistence
- [x] PWA manifest & service worker

## P1 Features (Future)
- [ ] Export/import data functionality
- [ ] Multiple theme options
- [ ] Push notification reminders

## File Structure
```
/app/frontend/
├── public/
│   ├── manifest.json       # PWA configuration
│   ├── service-worker.js   # Offline support
│   └── icons/              # App icons (72-512px)
└── src/
    ├── components/
    │   ├── PasswordGate.jsx
    │   ├── HeartTransition.jsx
    │   ├── SwipeDeck.jsx
    │   ├── Timeline.jsx
    │   ├── EditorDashboard.jsx
    │   ├── BottomNav.jsx
    │   └── CobwebSVG.jsx
    ├── hooks/
    │   └── useHeartAudio.js
    ├── utils/
    │   └── storage.js
    └── App.js
```

## Date Log
- 2026-01-24: Initial PWA implementation complete
