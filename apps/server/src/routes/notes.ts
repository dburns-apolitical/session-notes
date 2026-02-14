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
