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
