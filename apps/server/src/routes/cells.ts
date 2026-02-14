import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { cell, song, projectMember } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { toggleCellSchema } from "@session-notes/shared";
import { broadcast } from "../ws";

const cells = new Hono()
  .use(requireAuth)
  .patch("/cells/:id", async (c) => {
    const cellId = c.req.param("id");
    const { user } = c.get("authSession");
    const body = toggleCellSchema.parse(await c.req.json());

    const [existingCell] = await db.select().from(cell).where(eq(cell.id, cellId));
    if (!existingCell) return c.json({ error: "Not found" }, 404);

    const [cellSongRecord] = await db.select().from(song).where(eq(song.id, existingCell.songId));
    if (!cellSongRecord) return c.json({ error: "Not found" }, 404);

    const membership = await db
      .select()
      .from(projectMember)
      .where(eq(projectMember.projectId, cellSongRecord.projectId))
      .then((rows) => rows.find((r) => r.userId === user.id));

    if (!membership) {
      return c.json({ error: "Not a member" }, 403);
    }

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

    // Get projectId via the cell's song
    const [cellSong] = await db.select().from(song).where(eq(song.id, updated.songId));
    if (cellSong) {
      broadcast(cellSong.projectId, "project:cell-updated", updated);
    }

    return c.json(updated);
  });

export { cells };
