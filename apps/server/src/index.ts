import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { projects } from "./routes/projects";

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

export default {
  port: 3000,
  fetch: app.fetch,
};
