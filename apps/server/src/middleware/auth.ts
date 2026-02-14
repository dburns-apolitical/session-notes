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
