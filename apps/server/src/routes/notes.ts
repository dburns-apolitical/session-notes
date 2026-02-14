import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { note, cell, song } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { createNoteSchema } from "@session-notes/shared";
import { broadcast } from "../ws";

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

    // Get projectId via cell -> song
    const [noteCell] = await db.select().from(cell).where(eq(cell.id, cellId));
    if (noteCell) {
      const [noteSong] = await db.select().from(song).where(eq(song.id, noteCell.songId));
      if (noteSong) {
        broadcast(noteSong.projectId, "project:note-added", newNote);
      }
    }

    return c.json(newNote, 201);
  });

export { notes };
