import { Hono } from "hono";
import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { project, projectMember, song, step, cell } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { generateInviteCode } from "../lib/invite-code";
import { createProjectSchema, joinProjectSchema } from "@session-notes/shared";
import { broadcast } from "../ws";

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

    await db.insert(projectMember).values({
      projectId: newProject.id,
      userId: user.id,
    });

    return c.json(newProject, 201);
  })
  .get("/:id", async (c) => {
    const projectId = c.req.param("id");
    const { user } = c.get("authSession");

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

    broadcast(proj.id, "project:member-joined", { userId: user.id, projectId: proj.id });

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
