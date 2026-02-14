import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { projects } from "./routes/projects";
import { songs } from "./routes/songs";
import { steps } from "./routes/steps";
import { cells } from "./routes/cells";
import { notes } from "./routes/notes";
import { getWebSocketHandler, setServer } from "./ws";

const app = new Hono();

app.use("/*", cors({
  origin: ["http://localhost:8081", "http://localhost:19006"],
  credentials: true,
}));

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/health", (c) => c.json({ ok: true }));

app.route("/api/projects", projects);
app.route("/api", songs);
app.route("/api", steps);
app.route("/api", cells);
app.route("/api", notes);

const server = Bun.serve({
  port: 3000,
  fetch: async (req, server) => {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname.startsWith("/ws/projects/")) {
      const projectId = url.pathname.split("/")[3];
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

setServer(server);

console.log(`Server running on port ${server.port}`);
