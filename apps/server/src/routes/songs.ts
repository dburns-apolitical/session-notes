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
