import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { song, step, cell, projectMember } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { createSongSchema, updateSongSchema } from "@session-notes/shared";
import { broadcast } from "../ws";

const songs = new Hono()
  .use(requireAuth)
  .post("/projects/:projectId/songs", async (c) => {
    const projectId = c.req.param("projectId");
    const { user } = c.get("authSession");
    const body = createSongSchema.parse(await c.req.json());

    const membership = await db
      .select()
      .from(projectMember)
      .where(eq(projectMember.projectId, projectId))
      .then((rows) => rows.find((r) => r.userId === user.id));

    if (!membership) {
      return c.json({ error: "Not a member" }, 403);
    }

    const existing = await db.select().from(song).where(eq(song.projectId, projectId));
    const maxPos = existing.reduce((max, s) => Math.max(max, s.position), -1);

    const [newSong] = await db
      .insert(song)
      .values({ name: body.name, projectId, position: maxPos + 1 })
      .returning();

    const steps = await db.select().from(step).where(eq(step.projectId, projectId));
    if (steps.length > 0) {
      await db.insert(cell).values(
        steps.map((s) => ({ songId: newSong.id, stepId: s.id }))
      );
    }

    broadcast(projectId, "project:song-added", newSong);

    return c.json(newSong, 201);
  })
  .patch("/songs/:id", async (c) => {
    const songId = c.req.param("id");
    const { user } = c.get("authSession");
    const body = updateSongSchema.parse(await c.req.json());

    const [existing] = await db.select().from(song).where(eq(song.id, songId));
    if (!existing) return c.json({ error: "Not found" }, 404);

    const membership = await db
      .select()
      .from(projectMember)
      .where(eq(projectMember.projectId, existing.projectId))
      .then((rows) => rows.find((r) => r.userId === user.id));

    if (!membership) {
      return c.json({ error: "Not a member" }, 403);
    }

    const [updated] = await db
      .update(song)
      .set(body)
      .where(eq(song.id, songId))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);

    broadcast(updated.projectId, "project:song-updated", updated);

    return c.json(updated);
  })
  .delete("/songs/:id", async (c) => {
    const songId = c.req.param("id");
    const { user } = c.get("authSession");

    const [existing] = await db.select().from(song).where(eq(song.id, songId));
    if (!existing) return c.json({ error: "Not found" }, 404);

    const membership = await db
      .select()
      .from(projectMember)
      .where(eq(projectMember.projectId, existing.projectId))
      .then((rows) => rows.find((r) => r.userId === user.id));

    if (!membership) {
      return c.json({ error: "Not a member" }, 403);
    }

    await db.delete(song).where(eq(song.id, songId));

    broadcast(existing.projectId, "project:song-deleted", { songId });

    return c.json({ ok: true });
  });

export { songs };
