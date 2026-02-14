# Session Notes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a collaborative recording project tracker for bands with real-time updates, a grid UI, and cross-platform support via Expo.

**Architecture:** Bun monorepo with Hono server (HTTP + WebSocket), Expo client (web/iOS/Android), and a shared package for types and validation. Mutations go through HTTP; WebSocket broadcasts changes to other clients.

**Tech Stack:** Bun, Hono, Drizzle, Neon Postgres, BetterAuth, Expo, Expo Router, TanStack Query, Zod, Nativewind

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (workspace root)
- Create: `turbo.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `apps/server/package.json`
- Create: `apps/server/tsconfig.json`
- Create: `apps/server/src/index.ts`
- Create: `.gitignore`

**Step 1: Initialize root workspace**

Create root `package.json` with Bun workspaces:

```json
{
  "name": "session-notes",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

Create `.gitignore` with `node_modules`, `dist`, `.expo`, `.env`, etc.

**Step 2: Create shared package**

Create `packages/shared/package.json`:

```json
{
  "name": "@session-notes/shared",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

Create `packages/shared/tsconfig.json` with strict TypeScript config.

Create `packages/shared/src/index.ts` with a placeholder export.

**Step 3: Create server package**

Create `apps/server/package.json`:

```json
{
  "name": "@session-notes/server",
  "private": true,
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun"
  },
  "dependencies": {
    "@session-notes/shared": "workspace:*"
  }
}
```

Create `apps/server/src/index.ts`:

```typescript
console.log("Server starting...");
```

**Step 4: Install dependencies and verify**

Run: `bun install`
Run: `bun run --filter @session-notes/server dev`
Expected: "Server starting..." printed to console.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold monorepo with bun workspaces and turborepo"
```

---

## Task 2: Expo App Scaffolding

**Files:**
- Create: `apps/mobile/` (via `create-expo-app`)
- Modify: root `package.json` (already includes `apps/*` workspace)

**Step 1: Create Expo app**

Run from repo root:

```bash
cd apps && bunx create-expo-app mobile --template tabs
cd ..
```

**Step 2: Add shared package dependency**

Add to `apps/mobile/package.json`:

```json
"dependencies": {
  "@session-notes/shared": "workspace:*"
}
```

Run: `bun install`

**Step 3: Verify Expo starts**

Run: `cd apps/mobile && bunx expo start --web`
Expected: Expo dev server starts, web page loads with default tab template.

**Step 4: Clean up template**

Remove default template screens and replace with minimal placeholder screens matching our route structure:

- `apps/mobile/app/(auth)/sign-in.tsx` - placeholder "Sign In" text
- `apps/mobile/app/(auth)/sign-up.tsx` - placeholder "Sign Up" text
- `apps/mobile/app/(app)/(tabs)/index.tsx` - placeholder "Projects" text
- `apps/mobile/app/(app)/(tabs)/profile.tsx` - placeholder "Profile" text
- `apps/mobile/app/(app)/project/[id].tsx` - placeholder "Project" text

Set up the root layout (`app/_layout.tsx`) with the route groups.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold expo app with route structure"
```

---

## Task 3: Database Schema with Drizzle

**Files:**
- Create: `apps/server/src/db/schema.ts`
- Create: `apps/server/src/db/index.ts`
- Create: `apps/server/drizzle.config.ts`
- Modify: `apps/server/package.json` (add deps)

**Step 1: Install Drizzle dependencies**

```bash
cd apps/server && bun add drizzle-orm postgres && bun add -d drizzle-kit
```

Note: We use the `postgres` driver (not `@neondatabase/serverless`) because we're running a persistent Bun server, not serverless functions. The standard postgres driver gives us connection pooling and is more performant for long-lived processes.

**Step 2: Create database schema**

Create `apps/server/src/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectMember = pgTable("project_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const song = pgTable("song", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const step = pgTable("step", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cell = pgTable("cell", {
  id: uuid("id").defaultRandom().primaryKey(),
  songId: uuid("song_id").notNull().references(() => song.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").notNull().references(() => step.id, { onDelete: "cascade" }),
  isComplete: boolean("is_complete").default(false).notNull(),
  completedBy: text("completed_by"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const note = pgTable("note", {
  id: uuid("id").defaultRandom().primaryKey(),
  cellId: uuid("cell_id").notNull().references(() => cell.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

Note: `user` table is managed by BetterAuth and will be added in Task 4. The `userId`/`createdBy` fields are `text` to match BetterAuth's ID format.

**Step 3: Create database connection**

Create `apps/server/src/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

**Step 4: Create Drizzle config**

Create `apps/server/drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 5: Create .env.example**

Create `apps/server/.env.example`:

```
DATABASE_URL=postgresql://user:password@host/dbname
```

**Step 6: Generate and run migrations**

Run: `cd apps/server && bunx drizzle-kit generate`
Expected: Migration files created in `apps/server/drizzle/`

Run: `cd apps/server && bunx drizzle-kit push`
Expected: Schema pushed to Neon database (requires DATABASE_URL set in `.env`)

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add drizzle schema for projects, songs, steps, cells, notes"
```

---

## Task 4: BetterAuth Setup

**Files:**
- Create: `apps/server/src/auth.ts`
- Modify: `apps/server/src/db/schema.ts` (BetterAuth will add its tables)
- Modify: `apps/server/src/index.ts` (mount auth routes)
- Modify: `apps/server/package.json` (add deps)

**Step 1: Install BetterAuth**

```bash
cd apps/server && bun add better-auth
```

**Step 2: Configure BetterAuth**

Create `apps/server/src/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

**Step 3: Generate BetterAuth schema**

Run: `cd apps/server && bunx @better-auth/cli generate`

This will create the BetterAuth tables (user, session, etc.) and add them to the Drizzle schema or create a separate auth schema file. Follow the CLI prompts.

Run: `cd apps/server && bunx drizzle-kit push`

**Step 4: Mount auth routes on Hono**

Install Hono: `cd apps/server && bun add hono`

Update `apps/server/src/index.ts`:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";

const app = new Hono();

app.use("/*", cors({
  origin: ["http://localhost:8081", "http://localhost:19006"],
  credentials: true,
}));

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/health", (c) => c.json({ ok: true }));

export default {
  port: 3000,
  fetch: app.fetch,
};
```

**Step 5: Verify auth endpoint responds**

Run: `cd apps/server && bun run dev`
Run: `curl http://localhost:3000/health`
Expected: `{"ok":true}`

Run: `curl http://localhost:3000/api/auth/ok`
Expected: BetterAuth responds (may return session info or error, but should not 404)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add betterauth with email/password and hono server"
```

---

## Task 5: Shared Zod Schemas

**Files:**
- Modify: `packages/shared/src/index.ts`
- Create: `packages/shared/src/schemas.ts`
- Modify: `packages/shared/package.json` (add zod dep)

**Step 1: Install Zod in shared package**

```bash
cd packages/shared && bun add zod
```

**Step 2: Create validation schemas**

Create `packages/shared/src/schemas.ts`:

```typescript
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
});

export const joinProjectSchema = z.object({
  inviteCode: z.string().length(6),
});

export const createSongSchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateSongSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  position: z.number().int().min(0).optional(),
});

export const createStepSchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateStepSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  position: z.number().int().min(0).optional(),
});

export const toggleCellSchema = z.object({
  isComplete: z.boolean(),
});

export const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});
```

**Step 3: Export from index**

Update `packages/shared/src/index.ts`:

```typescript
export * from "./schemas";
```

**Step 4: Verify import works from server**

Add a temporary import in `apps/server/src/index.ts`:

```typescript
import { createProjectSchema } from "@session-notes/shared";
console.log(createProjectSchema.shape);
```

Run: `cd apps/server && bun run dev`
Expected: Zod schema shape printed, no import errors.

Remove the temporary import.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared zod validation schemas"
```

---

## Task 6: Server API Routes - Projects

**Files:**
- Create: `apps/server/src/routes/projects.ts`
- Create: `apps/server/src/lib/invite-code.ts`
- Create: `apps/server/src/middleware/auth.ts`
- Modify: `apps/server/src/index.ts` (mount routes)

**Step 1: Create auth middleware**

Create `apps/server/src/middleware/auth.ts`:

```typescript
import { createMiddleware } from "hono/factory";
import { auth } from "../auth";

type AuthSession = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

export const requireAuth = createMiddleware<{
  Variables: { authSession: AuthSession };
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("authSession", session);
  await next();
});
```

**Step 2: Create invite code generator**

Create `apps/server/src/lib/invite-code.ts`:

```typescript
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
```

**Step 3: Create project routes**

Create `apps/server/src/routes/projects.ts`:

```typescript
import { Hono } from "hono";
import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { project, projectMember, song, step, cell } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { generateInviteCode } from "../lib/invite-code";
import { createProjectSchema, joinProjectSchema } from "@session-notes/shared";

const projects = new Hono()
  .use(requireAuth)
  .get("/", async (c) => {
    const { user } = c.get("authSession");
    const memberships = await db
      .select({ projectId: projectMember.projectId })
      .from(projectMember)
      .where(eq(projectMember.userId, user.id));
    const memberProjectIds = memberships.map((m) => m.projectId);

    const owned = await db
      .select()
      .from(project)
      .where(eq(project.createdBy, user.id));

    const memberOf = memberProjectIds.length > 0
      ? await db
          .select()
          .from(project)
          .where(or(...memberProjectIds.map((id) => eq(project.id, id))))
      : [];

    // Deduplicate (owner is also a member)
    const allProjects = [...owned];
    for (const p of memberOf) {
      if (!allProjects.find((op) => op.id === p.id)) {
        allProjects.push(p);
      }
    }

    return c.json(allProjects);
  })
  .post("/", async (c) => {
    const { user } = c.get("authSession");
    const body = createProjectSchema.parse(await c.req.json());
    const inviteCode = generateInviteCode();

    const [newProject] = await db
      .insert(project)
      .values({
        name: body.name,
        inviteCode,
        createdBy: user.id,
      })
      .returning();

    // Add owner as member
    await db.insert(projectMember).values({
      projectId: newProject.id,
      userId: user.id,
    });

    return c.json(newProject, 201);
  })
  .get("/:id", async (c) => {
    const projectId = c.req.param("id");
    const { user } = c.get("authSession");

    // Verify membership
    const membership = await db
      .select()
      .from(projectMember)
      .where(eq(projectMember.projectId, projectId))
      .then((rows) => rows.find((r) => r.userId === user.id));

    if (!membership) {
      return c.json({ error: "Not a member" }, 403);
    }

    const [proj] = await db.select().from(project).where(eq(project.id, projectId));
    if (!proj) return c.json({ error: "Not found" }, 404);

    const songs = await db.select().from(song).where(eq(song.projectId, projectId));
    const steps = await db.select().from(step).where(eq(step.projectId, projectId));
    const cells = songs.length > 0
      ? await db.select().from(cell).where(
          or(...songs.map((s) => eq(cell.songId, s.id)))
        )
      : [];
    const members = await db.select().from(projectMember).where(eq(projectMember.projectId, projectId));

    return c.json({ ...proj, songs, steps, cells, members });
  })
  .post("/join", async (c) => {
    const { user } = c.get("authSession");
    const body = joinProjectSchema.parse(await c.req.json());

    const [proj] = await db
      .select()
      .from(project)
      .where(eq(project.inviteCode, body.inviteCode.toUpperCase()));

    if (!proj) return c.json({ error: "Invalid invite code" }, 404);

    // Check if already a member
    const existing = await db
      .select()
      .from(projectMember)
      .where(eq(projectMember.projectId, proj.id))
      .then((rows) => rows.find((r) => r.userId === user.id));

    if (existing) return c.json({ error: "Already a member" }, 409);

    await db.insert(projectMember).values({
      projectId: proj.id,
      userId: user.id,
    });

    return c.json(proj);
  })
  .delete("/:id", async (c) => {
    const projectId = c.req.param("id");
    const { user } = c.get("authSession");

    const [proj] = await db.select().from(project).where(eq(project.id, projectId));
    if (!proj) return c.json({ error: "Not found" }, 404);
    if (proj.createdBy !== user.id) return c.json({ error: "Only the owner can delete" }, 403);

    await db.delete(project).where(eq(project.id, projectId));
    return c.json({ ok: true });
  });

export { projects };
```

**Step 4: Mount routes**

Update `apps/server/src/index.ts` to add:

```typescript
import { projects } from "./routes/projects";

app.route("/api/projects", projects);
```

**Step 5: Verify server starts without errors**

Run: `cd apps/server && bun run dev`
Expected: Server starts on port 3000, no errors.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add project CRUD API routes with auth middleware"
```

---

## Task 7: Server API Routes - Songs, Steps, Cells, Notes

**Files:**
- Create: `apps/server/src/routes/songs.ts`
- Create: `apps/server/src/routes/steps.ts`
- Create: `apps/server/src/routes/cells.ts`
- Create: `apps/server/src/routes/notes.ts`
- Modify: `apps/server/src/index.ts` (mount routes)

**Step 1: Create song routes**

Create `apps/server/src/routes/songs.ts`:

```typescript
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { song, step, cell } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { createSongSchema, updateSongSchema } from "@session-notes/shared";

const songs = new Hono()
  .use(requireAuth)
  .post("/projects/:projectId/songs", async (c) => {
    const projectId = c.req.param("projectId");
    const body = createSongSchema.parse(await c.req.json());

    // Get max position
    const existing = await db.select().from(song).where(eq(song.projectId, projectId));
    const maxPos = existing.reduce((max, s) => Math.max(max, s.position), -1);

    const [newSong] = await db
      .insert(song)
      .values({ name: body.name, projectId, position: maxPos + 1 })
      .returning();

    // Create cells for all existing steps
    const steps = await db.select().from(step).where(eq(step.projectId, projectId));
    if (steps.length > 0) {
      await db.insert(cell).values(
        steps.map((s) => ({ songId: newSong.id, stepId: s.id }))
      );
    }

    return c.json(newSong, 201);
  })
  .patch("/songs/:id", async (c) => {
    const songId = c.req.param("id");
    const body = updateSongSchema.parse(await c.req.json());

    const [updated] = await db
      .update(song)
      .set(body)
      .where(eq(song.id, songId))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json(updated);
  })
  .delete("/songs/:id", async (c) => {
    const songId = c.req.param("id");
    await db.delete(song).where(eq(song.id, songId));
    return c.json({ ok: true });
  });

export { songs };
```

**Step 2: Create step routes**

Create `apps/server/src/routes/steps.ts` (mirrors songs pattern):

```typescript
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { song, step, cell } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { createStepSchema, updateStepSchema } from "@session-notes/shared";

const steps = new Hono()
  .use(requireAuth)
  .post("/projects/:projectId/steps", async (c) => {
    const projectId = c.req.param("projectId");
    const body = createStepSchema.parse(await c.req.json());

    const existing = await db.select().from(step).where(eq(step.projectId, projectId));
    const maxPos = existing.reduce((max, s) => Math.max(max, s.position), -1);

    const [newStep] = await db
      .insert(step)
      .values({ name: body.name, projectId, position: maxPos + 1 })
      .returning();

    // Create cells for all existing songs
    const projectSongs = await db.select().from(song).where(eq(song.projectId, projectId));
    const newCells = [];
    if (projectSongs.length > 0) {
      const inserted = await db.insert(cell).values(
        projectSongs.map((s) => ({ songId: s.id, stepId: newStep.id }))
      ).returning();
      newCells.push(...inserted);
    }

    return c.json({ step: newStep, cells: newCells }, 201);
  })
  .patch("/steps/:id", async (c) => {
    const stepId = c.req.param("id");
    const body = updateStepSchema.parse(await c.req.json());

    const [updated] = await db
      .update(step)
      .set(body)
      .where(eq(step.id, stepId))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json(updated);
  })
  .delete("/steps/:id", async (c) => {
    const stepId = c.req.param("id");
    await db.delete(step).where(eq(step.id, stepId));
    return c.json({ ok: true });
  });

export { steps };
```

**Step 3: Create cell routes**

Create `apps/server/src/routes/cells.ts`:

```typescript
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { cell } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { toggleCellSchema } from "@session-notes/shared";

const cells = new Hono()
  .use(requireAuth)
  .patch("/cells/:id", async (c) => {
    const cellId = c.req.param("id");
    const { user } = c.get("authSession");
    const body = toggleCellSchema.parse(await c.req.json());

    const [updated] = await db
      .update(cell)
      .set({
        isComplete: body.isComplete,
        completedBy: body.isComplete ? user.id : null,
        completedAt: body.isComplete ? new Date() : null,
      })
      .where(eq(cell.id, cellId))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json(updated);
  });

export { cells };
```

**Step 4: Create note routes**

Create `apps/server/src/routes/notes.ts`:

```typescript
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { note } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { createNoteSchema } from "@session-notes/shared";

const notes = new Hono()
  .use(requireAuth)
  .get("/cells/:cellId/notes", async (c) => {
    const cellId = c.req.param("cellId");
    const cellNotes = await db
      .select()
      .from(note)
      .where(eq(note.cellId, cellId))
      .orderBy(note.createdAt);
    return c.json(cellNotes);
  })
  .post("/cells/:cellId/notes", async (c) => {
    const cellId = c.req.param("cellId");
    const { user } = c.get("authSession");
    const body = createNoteSchema.parse(await c.req.json());

    const [newNote] = await db
      .insert(note)
      .values({ cellId, userId: user.id, content: body.content })
      .returning();

    return c.json(newNote, 201);
  });

export { notes };
```

**Step 5: Mount all routes**

Update `apps/server/src/index.ts`:

```typescript
import { songs } from "./routes/songs";
import { steps } from "./routes/steps";
import { cells } from "./routes/cells";
import { notes } from "./routes/notes";

app.route("/api", songs);
app.route("/api", steps);
app.route("/api", cells);
app.route("/api", notes);
```

**Step 6: Verify server starts**

Run: `cd apps/server && bun run dev`
Expected: No errors.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add song, step, cell, and note API routes"
```

---

## Task 8: WebSocket Server

**Files:**
- Create: `apps/server/src/ws.ts`
- Modify: `apps/server/src/index.ts` (add WebSocket upgrade)
- Modify route files to broadcast after mutations

**Step 1: Create WebSocket handler**

Create `apps/server/src/ws.ts`:

```typescript
import type { ServerWebSocket } from "bun";

type WSData = {
  projectId: string;
  userId: string;
};

export type WS = ServerWebSocket<WSData>;

export function getWebSocketHandler() {
  return {
    open(ws: WS) {
      ws.subscribe(`project:${ws.data.projectId}`);
    },
    close(ws: WS) {
      ws.unsubscribe(`project:${ws.data.projectId}`);
    },
    message(ws: WS, message: string | Buffer) {
      // Client-to-server messages not used; mutations go through HTTP
    },
  };
}

export function broadcast(server: any, projectId: string, event: string, data: any) {
  server.publish(
    `project:${projectId}`,
    JSON.stringify({ event, data })
  );
}
```

**Step 2: Update server to handle WebSocket upgrades**

Update `apps/server/src/index.ts` to use `Bun.serve` with both fetch and websocket:

```typescript
import { getWebSocketHandler, broadcast } from "./ws";
import { auth } from "./auth";

const server = Bun.serve({
  port: 3000,
  fetch: async (req, server) => {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname.startsWith("/ws/projects/")) {
      const projectId = url.pathname.split("/")[3];
      // Verify auth via session cookie
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) {
        return new Response("Unauthorized", { status: 401 });
      }
      const success = server.upgrade(req, {
        data: { projectId, userId: session.user.id },
      });
      if (success) return undefined;
      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    return app.fetch(req);
  },
  websocket: getWebSocketHandler(),
});

// Make server available for broadcasting
export { server };
```

**Step 3: Add broadcast calls to route handlers**

After each mutation in the route files, add a broadcast call. For example, in `songs.ts` after creating a song:

```typescript
import { server } from "../index";
import { broadcast } from "../ws";

// After insert:
broadcast(server, projectId, "project:song-added", newSong);
```

Repeat pattern for all mutations across songs, steps, cells, and notes routes.

**Step 4: Verify WebSocket connects**

Run: `cd apps/server && bun run dev`
Test with a WebSocket client (e.g., `websocat` or browser devtools):
```
websocat ws://localhost:3000/ws/projects/test-id
```
Expected: Connection upgrades (will fail auth without session cookie, but should not crash server).

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add websocket pub/sub for real-time project updates"
```

---

## Task 9: Client Auth Setup

**Files:**
- Create: `apps/mobile/lib/auth-client.ts`
- Create: `apps/mobile/lib/api.ts`
- Create: `apps/mobile/contexts/auth.tsx`
- Modify: `apps/mobile/app/_layout.tsx` (add auth provider)
- Modify: `apps/mobile/app/(auth)/sign-in.tsx`
- Modify: `apps/mobile/app/(auth)/sign-up.tsx`
- Modify: `apps/mobile/package.json` (add deps)

**Step 1: Install client dependencies**

```bash
cd apps/mobile && bun add better-auth @tanstack/react-query hono zod @session-notes/shared
```

**Step 2: Create BetterAuth client**

Create `apps/mobile/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
});
```

**Step 3: Create API client with Hono RPC**

Create `apps/mobile/lib/api.ts`:

```typescript
import { hc } from "hono/client";
import type { AppType } from "@session-notes/server/src/index";

const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export const api = hc<AppType>(baseUrl, {
  init: {
    credentials: "include", // Send session cookies
  },
});
```

Note: For Hono RPC to work, the server needs to export the app type. Add `export type AppType = typeof app;` to the server's `index.ts`.

**Step 4: Create auth context and provider**

Create `apps/mobile/contexts/auth.tsx` with:
- A context that wraps BetterAuth's session
- Auto-redirect to sign-in when unauthenticated
- Auto-redirect to app when authenticated

**Step 5: Build sign-in and sign-up screens**

Update `apps/mobile/app/(auth)/sign-in.tsx`:
- Email and password inputs
- Sign in button calling `authClient.signIn.email()`
- Link to sign-up screen

Update `apps/mobile/app/(auth)/sign-up.tsx`:
- Name, email, and password inputs
- Sign up button calling `authClient.signUp.email()`
- Link to sign-in screen

**Step 6: Wire up root layout**

Update `apps/mobile/app/_layout.tsx`:
- Wrap with `QueryClientProvider` (TanStack Query)
- Wrap with auth context provider
- Route groups handle auth vs app navigation

**Step 7: Verify auth flow**

Run both server and Expo:
```bash
cd apps/server && bun run dev
cd apps/mobile && bunx expo start --web
```

Expected: Can sign up, sign in, and be redirected to projects list.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add client auth with betterauth, tanstack query, and hono rpc"
```

---

## Task 10: Projects List Screen

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/index.tsx`
- Create: `apps/mobile/hooks/use-projects.ts`
- Create: `apps/mobile/components/CreateProjectModal.tsx`
- Create: `apps/mobile/components/JoinProjectInput.tsx`

**Step 1: Create projects hook**

Create `apps/mobile/hooks/use-projects.ts`:
- `useProjects()` - TanStack Query hook that fetches `GET /api/projects`
- `useCreateProject()` - mutation hook for `POST /api/projects`
- `useJoinProject()` - mutation hook for `POST /api/projects/join`

**Step 2: Build projects list screen**

Update `apps/mobile/app/(app)/(tabs)/index.tsx`:
- FlatList of projects showing name and invite code
- Each item navigates to `/project/[id]`
- "Create Project" button at top
- "Join Project" input field for 6-digit code

**Step 3: Build create project modal**

Create `apps/mobile/components/CreateProjectModal.tsx`:
- Text input for project name
- Create button
- On success: dismiss modal, navigate to new project

**Step 4: Build join project input**

Create `apps/mobile/components/JoinProjectInput.tsx`:
- 6-character text input (auto-uppercase)
- Join button
- On success: navigate to joined project

**Step 5: Verify end-to-end**

With server running, create a project and see it appear in the list. Navigate to it (will show placeholder). Join with an invite code from another account.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add projects list screen with create and join"
```

---

## Task 11: Project Grid View

**Files:**
- Modify: `apps/mobile/app/(app)/project/[id].tsx`
- Create: `apps/mobile/hooks/use-project.ts`
- Create: `apps/mobile/components/ProjectGrid.tsx`
- Create: `apps/mobile/components/GridCell.tsx`
- Create: `apps/mobile/components/ProjectHeader.tsx`

**Step 1: Create project data hook**

Create `apps/mobile/hooks/use-project.ts`:
- `useProject(id)` - fetches `GET /api/projects/:id` (returns project with songs, steps, cells, members)
- `useAddSong(projectId)` - mutation for adding songs
- `useAddStep(projectId)` - mutation for adding steps
- `useToggleCell()` - mutation for toggling cell completion
- `useAddNote(cellId)` - mutation for adding notes

**Step 2: Build project header**

Create `apps/mobile/components/ProjectHeader.tsx`:
- Project name
- Invite code with tap-to-copy (using `Clipboard` API)
- Member avatar row

**Step 3: Build grid component**

Create `apps/mobile/components/ProjectGrid.tsx`:

This is the core UI. Structure:
- Outer `ScrollView` (vertical, for when steps exceed screen height)
- Inner `ScrollView` (horizontal, for songs)
- Steps column pinned on the left (position: absolute or separate column)
- Header row with song names
- Grid cells at each intersection

The grid uses a `View` with `flexDirection: "row"` for each step row. The first column (step name) is fixed-width. Song columns scroll horizontally together.

**Step 4: Build grid cell**

Create `apps/mobile/components/GridCell.tsx`:
- Shows completion status (checkmark or empty)
- Note count indicator
- `onPress` triggers the cell detail modal (Task 12)

**Step 5: Add "Add Song" and "Add Step" buttons**

- "Add Song" button appears as the last column header (+ icon)
- "Add Step" button appears as the last row label (+ icon)
- Both open a small inline input or modal for the name

**Step 6: Verify grid renders**

With server running and a project with some songs and steps, the grid should render correctly with horizontal scrolling.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add project grid view with songs, steps, and cells"
```

---

## Task 12: Cell Detail Modal

**Files:**
- Create: `apps/mobile/components/CellDetailModal.tsx`
- Create: `apps/mobile/components/NoteThread.tsx`
- Create: `apps/mobile/hooks/use-notes.ts`

**Step 1: Create notes hook**

Create `apps/mobile/hooks/use-notes.ts`:
- `useNotes(cellId)` - fetches notes for a cell
- `useAddNote(cellId)` - mutation to add a note

**Step 2: Build cell detail modal**

Create `apps/mobile/components/CellDetailModal.tsx`:
- Modal component (uses React Native `Modal`)
- Header: song name + step name
- Completion toggle (switch or checkbox)
- Notes thread below
- Text input + send button for new notes
- Close button

On mobile this should feel like a bottom sheet. Consider using `@gorhom/bottom-sheet` if the default Modal doesn't feel right, but start with the standard Modal for simplicity.

**Step 3: Build note thread**

Create `apps/mobile/components/NoteThread.tsx`:
- FlatList of notes
- Each note shows: author name, content, timestamp
- Sorted chronologically (oldest first)

**Step 4: Wire cell tap to modal**

Update `GridCell.tsx` to pass cell data to the modal when tapped. The modal should be rendered in the project view and controlled via state.

**Step 5: Verify end-to-end**

Tap a cell, toggle completion, add a note. Verify changes persist on page refresh.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add cell detail modal with completion toggle and notes"
```

---

## Task 13: WebSocket Client for Real-Time Updates

**Files:**
- Create: `apps/mobile/hooks/use-project-websocket.ts`
- Modify: `apps/mobile/app/(app)/project/[id].tsx` (connect WebSocket)

**Step 1: Create WebSocket hook**

Create `apps/mobile/hooks/use-project-websocket.ts`:

```typescript
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useProjectWebSocket(projectId: string) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const baseUrl = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000")
      .replace("http", "ws");
    const ws = new WebSocket(`${baseUrl}/ws/projects/${projectId}`);

    ws.onmessage = (event) => {
      const { event: eventType, data } = JSON.parse(event.data);
      // Invalidate the project query to refetch latest data
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    };

    ws.onclose = () => {
      // Reconnect after delay
      setTimeout(() => {
        // Reconnect logic (will be handled by the effect cleanup/re-run)
      }, 3000);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [projectId, queryClient]);
}
```

**Step 2: Connect in project view**

Update `apps/mobile/app/(app)/project/[id].tsx`:

```typescript
import { useProjectWebSocket } from "../../../hooks/use-project-websocket";

// Inside component:
useProjectWebSocket(id);
```

**Step 3: Verify real-time updates**

Open the same project in two browser tabs. Toggle a cell in one tab. The other tab should update within a few seconds (after the query invalidation refetch).

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add websocket client for real-time project updates"
```

---

## Task 14: Profile Screen & Polish

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/profile.tsx`
- Styling pass across all screens

**Step 1: Build profile screen**

Update `apps/mobile/app/(app)/(tabs)/profile.tsx`:
- Show user name and email
- Logout button (calls `authClient.signOut()`)

**Step 2: Styling pass**

Apply consistent styling across all screens. Use the chosen UI library (Nativewind) to ensure mobile-first responsive design. Key areas:
- Auth screens: centered form, clean inputs
- Projects list: card-style items
- Grid: clear visual distinction between complete/incomplete cells
- Cell modal: clean layout with clear sections

**Step 3: Verify across platforms**

Run on web and iOS simulator (or Android emulator if available):
```bash
cd apps/mobile && bunx expo start --web
cd apps/mobile && bunx expo start --ios
```

Verify the grid scrolls correctly, modals work, and auth flow is smooth.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add profile screen and polish UI"
```

---

## Task 15: Deployment Setup

**Files:**
- Create: `apps/server/Dockerfile` (or systemd service file)
- Create: `apps/mobile/netlify.toml`
- Create: `apps/server/.env.production.example`

**Step 1: Server deployment config**

Create a Dockerfile for the Bun server (for DigitalOcean deployment):

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN bun install --production
COPY packages/shared packages/shared
COPY apps/server apps/server
EXPOSE 3000
CMD ["bun", "run", "apps/server/src/index.ts"]
```

**Step 2: Netlify config for web**

Create `apps/mobile/netlify.toml`:

```toml
[build]
  command = "bunx expo export --platform web"
  publish = "dist"

[build.environment]
  EXPO_PUBLIC_API_URL = "https://api.yourdomain.com"
```

**Step 3: Document environment variables**

Create `apps/server/.env.production.example`:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=generate-a-random-secret
BETTER_AUTH_URL=https://api.yourdomain.com
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add deployment config for digitalocean and netlify"
```

---

## Summary of Tasks

| # | Task | Key Output |
|---|------|------------|
| 1 | Monorepo scaffolding | Bun workspaces + Turborepo |
| 2 | Expo app scaffolding | Route structure with placeholders |
| 3 | Database schema | Drizzle schema + migrations |
| 4 | BetterAuth setup | Auth on Hono server |
| 5 | Shared Zod schemas | Validation shared between client/server |
| 6 | Project API routes | CRUD + join via invite code |
| 7 | Song/Step/Cell/Note routes | All remaining API endpoints |
| 8 | WebSocket server | Real-time pub/sub per project |
| 9 | Client auth | Sign in/up + auth context + API client |
| 10 | Projects list screen | Create, join, list projects |
| 11 | Project grid view | Core grid UI with songs/steps/cells |
| 12 | Cell detail modal | Completion toggle + notes thread |
| 13 | WebSocket client | Real-time updates in grid |
| 14 | Profile & polish | Logout, styling, cross-platform check |
| 15 | Deployment setup | Dockerfile + Netlify config |
