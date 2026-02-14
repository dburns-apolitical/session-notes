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
