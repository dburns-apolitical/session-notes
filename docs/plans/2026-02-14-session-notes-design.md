# Session Notes - Design Document

A collaborative planning app for bands to track the progress of their recording projects.

## Overview

Users sign up individually, create recording projects, and invite bandmates via a 6-digit invite code. Each project contains songs and steps (guitar, drums, vocals, mix, etc). The intersection of each song and step is a "cell" that can be marked complete and annotated with threaded plain-text notes. The primary view is a scrollable grid with songs as columns and steps as rows.

## Data Model

```
User
├── id, email, name, avatar
└── (managed by BetterAuth)

Project
├── id, name, inviteCode (6-char unique), createdBy (userId)
└── createdAt, updatedAt

ProjectMember
├── projectId, userId
└── joinedAt

Song
├── id, projectId, name, position (int, for ordering)
└── createdAt

Step
├── id, projectId, name, position (int, for ordering)
└── createdAt

Cell (Song x Step intersection)
├── id, songId, stepId, isComplete (boolean)
├── completedBy (userId, nullable), completedAt (nullable)
└── createdAt

Note
├── id, cellId, userId, content (plain text)
└── createdAt
```

Key decisions:
- Steps are project-level templates. Adding a step creates cells for all existing songs. Adding a song creates cells for all existing steps.
- Position fields enable drag-to-reorder in the future.
- Notes are a thread: multiple plain-text notes per cell, each attributed to a user with a timestamp.
- All members are equal (can add songs, steps, toggle cells, add notes). Only exception: project deletion is owner-only.

## Architecture

### Monorepo Structure

```
session-notes/
├── apps/
│   ├── mobile/          # Expo app (web, iOS, Android)
│   └── server/          # Bun + Hono server
├── packages/
│   └── shared/          # Shared types, Zod schemas, constants
├── package.json         # Bun workspace root
└── turbo.json           # Turborepo config
```

### Server

- **Runtime:** Bun
- **HTTP framework:** Hono
- **WebSockets:** Bun native pub/sub (topic per project)
- **ORM:** Drizzle
- **Database:** Neon Postgres
- **Auth:** BetterAuth
- **Validation:** Zod (shared with client)

### Client

- **Framework:** React Native + Expo (SDK 52+)
- **Routing:** Expo Router v4
- **Data fetching:** TanStack Query v5
- **API client:** Hono RPC client (`hono/client`)
- **Real-time:** Native WebSocket API with reconnect logic
- **UI library:** TBD (Tamagui, Nativewind, or plain StyleSheet)
- **Validation:** Zod (shared with server)

### Build Tooling

- **Package manager:** Bun workspaces
- **Build orchestration:** Turborepo

## Real-Time Architecture

Mutations go through HTTP (for validation, error handling, auth). WebSocket is used purely for push notifications to other connected clients.

1. User opens a project -> client opens WebSocket to `ws://server/ws/projects/:id`
2. User makes a change -> client sends HTTP request to the API
3. Server persists to DB, then broadcasts the change to all WebSocket subscribers on that project topic
4. Other clients receive the broadcast -> invalidate or directly update TanStack Query cache

### WebSocket Events (server -> client)

```
project:song-added      { song }
project:song-updated    { song }
project:song-deleted    { songId }
project:step-added      { step, cells[] }
project:step-updated    { step }
project:step-deleted    { stepId }
project:cell-updated    { cell }
project:note-added      { note }
project:member-joined   { member }
```

## API Routes

### Auth (BetterAuth)

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `GET /api/auth/session`

### Projects

- `GET /api/projects` - list user's projects (owned + member of)
- `POST /api/projects` - create project (auto-generates 6-digit invite code)
- `GET /api/projects/:id` - get project with songs, steps, cells, members
- `POST /api/projects/join` - join via invite code
- `DELETE /api/projects/:id` - delete project (owner only)

### Songs

- `POST /api/projects/:id/songs` - add song (auto-creates cells for all existing steps)
- `PATCH /api/songs/:id` - rename / reorder
- `DELETE /api/songs/:id` - remove song + its cells + notes

### Steps

- `POST /api/projects/:id/steps` - add step (auto-creates cells for all existing songs)
- `PATCH /api/steps/:id` - rename / reorder
- `DELETE /api/steps/:id` - remove step + its cells + notes

### Cells

- `PATCH /api/cells/:id` - toggle complete/incomplete

### Notes

- `GET /api/cells/:id/notes` - list notes for a cell
- `POST /api/cells/:id/notes` - add a note

## Screens & Navigation

### Auth (unauthenticated)

- **Sign Up / Sign In** - single screen with toggle between modes

### App (authenticated)

- **Projects List** - all projects (owned + member of), "Create Project" button, "Join Project" input for 6-digit code
- **Project Grid View** - main screen
  - Header: project name, invite code (tap to copy), member avatars
  - Grid: songs as columns (horizontal scroll), steps as rows (pinned left column)
  - Cells show completion status (visual indicator)
  - Tap cell -> modal (desktop) / bottom sheet (mobile) with completion toggle + notes thread
  - Add Song button (adds column), Add Step button (adds row)
- **Profile/Settings** - user profile, logout

### Expo Router Structure

```
(auth)/
  sign-in.tsx
  sign-up.tsx
(app)/
  (tabs)/
    index.tsx          # Projects list
    profile.tsx        # User profile/settings
  project/
    [id].tsx           # Project grid view
```

### Grid UX

- Mobile-first: horizontal scroll for songs, steps column pinned on left
- Cell expansion: modal on desktop, bottom sheet on mobile (cross-platform compatible)
- Design shared across all platforms

## Deployment

- **Server:** DigitalOcean Droplet (~$6/mo), Bun process managed by systemd or PM2. Handles both HTTP and WebSocket connections.
- **Web:** Expo web build deployed as static files to Netlify (free tier).
- **Mobile:** Expo EAS builds for iOS/Android (TestFlight, Play Store, EAS Updates for OTA).
- **macOS:** Deferred to v2. Web app in browser covers desktop use case for v1. Options later: native via react-native-macos (experimental) or Tauri wrapper.

## Open Decisions (to resolve during implementation)

- UI library choice: Tamagui vs Nativewind vs plain StyleSheet
- Grid component implementation: custom ScrollView-based or existing library
- WebSocket reconnection strategy: exponential backoff parameters
- Invite code format: alphanumeric vs numeric-only
