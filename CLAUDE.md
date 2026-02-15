# Session Notes

Collaborative recording project tracker for bands. Users create projects, invite bandmates via 6-digit codes, and track recording progress through a grid (songs × steps) with real-time sync.

## Monorepo Structure

```
apps/mobile/    — Expo 54 (React Native) app (web/iOS/Android)
apps/server/    — Bun + Hono API server
packages/shared/ — Zod schemas & shared types
```

**Tooling:** Bun workspaces, Turborepo, TypeScript strict mode

## Tech Stack

| Layer | Tech |
|-------|------|
| Mobile | React Native 0.81, Expo Router 6, TanStack Query 5 |
| Server | Bun, Hono, Drizzle ORM, PostgreSQL (Neon) |
| Auth | BetterAuth (email/password, session cookies) |
| Real-time | Bun native WebSocket pub/sub |
| Validation | Zod (shared between client/server) |
| API client | Hono RPC (type-safe) |

## Commands

```bash
bun install                              # install all deps
cd apps/server && bun run dev            # server on :3000
cd apps/mobile && bunx expo start --web  # mobile web
cd apps/mobile && bunx expo start --ios  # iOS simulator
turbo build                              # build all
turbo typecheck                          # typecheck all
cd apps/mobile && bun lint               # lint mobile (eslint-config-expo)
```

## Key Files

- `apps/server/src/index.ts` — Hono app entry + Bun.serve
- `apps/server/src/db/schema.ts` — Drizzle schema (project, song, step, cell, note, projectMember)
- `apps/server/src/auth.ts` — BetterAuth config
- `apps/server/src/routes/` — API routes (projects, songs, steps, cells, notes)
- `apps/server/src/ws.ts` — WebSocket handler
- `apps/mobile/app/_layout.tsx` — Root layout with auth context
- `apps/mobile/app/(app)/project/[id].tsx` — Grid view
- `packages/shared/src/index.ts` — Shared Zod schemas

## Architecture Notes

- **Auth flow:** BetterAuth sessions via cookies, `credentials: "include"` on fetch
- **Real-time pattern:** HTTP for mutations → server broadcasts via WebSocket → clients invalidate TanStack Query cache
- **Grid model:** Songs = columns, Steps = rows, Cells = intersections (completable + annotatable with threaded notes)
- **Invite codes:** 6-char alphanumeric (excludes ambiguous chars 0/O/1/I)
- **Authorization:** All mutations require auth. Project delete = owner only. Other mutations = project members.

## Conventions

- TypeScript strict mode everywhere
- Zod for all validation (shared package)
- `workspace:*` protocol for internal deps
- Path alias `@/*` in mobile app
- ESLint via `eslint-config-expo` for mobile
- No explicit linter for server (relies on TS strict)

## Environment Variables

**Mobile** (`apps/mobile/.env`): `EXPO_PUBLIC_API_URL`
**Server** (`apps/server/.env`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
