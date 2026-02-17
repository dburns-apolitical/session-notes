import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { projects } from "./routes/projects";
import { songs } from "./routes/songs";
import { steps } from "./routes/steps";
import { cells } from "./routes/cells";
import { notes } from "./routes/notes";
import { getWebSocketHandler, setServer } from "./ws";

const allowedOrigins = ["http://localhost:8081", "http://localhost:19006", "https://session-notes-web.netlify.app", "https://app.session-sync.com", "https://api.session-sync.com"];

function setCorsHeaders(res: Response, origin: string | null): Response {
  const matched = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  res.headers.set("Access-Control-Allow-Origin", matched);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

const app = new Hono();

app.use("/*", cors({
  origin: allowedOrigins,
  credentials: true,
}));

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

    // Auth routes — handle before Hono so sub-router auth middleware doesn't intercept
    if (url.pathname.startsWith("/api/auth")) {
      const origin = req.headers.get("origin");
      if (req.method === "OPTIONS") {
        return setCorsHeaders(new Response(null, { status: 204 }), origin);
      }

      // === DIAGNOSTIC LOGGING (remove after debugging) ===
      if (url.pathname.includes("/signin/google") || url.pathname.includes("/callback/google")) {
        const cookieHeader = req.headers.get("cookie") || "(no cookies)";
        const host = req.headers.get("host") || "(no host)";
        const xForwardedHost = req.headers.get("x-forwarded-host") || "(none)";
        const xForwardedProto = req.headers.get("x-forwarded-proto") || "(none)";
        console.log(`\n=== AUTH DEBUG: ${url.pathname} ===`);
        console.log(`  Method: ${req.method}`);
        console.log(`  Full URL: ${req.url}`);
        console.log(`  Host header: ${host}`);
        console.log(`  X-Forwarded-Host: ${xForwardedHost}`);
        console.log(`  X-Forwarded-Proto: ${xForwardedProto}`);
        console.log(`  Cookies: ${cookieHeader}`);
        console.log(`  Query params: ${url.search}`);
      }

      const response = await auth.handler(req);

      if (url.pathname.includes("/signin/google") || url.pathname.includes("/callback/google")) {
        console.log(`  Response status: ${response.status}`);
        console.log(`  Location: ${response.headers.get("location") || "(none)"}`);
        const setCookies = response.headers.getSetCookie?.() || [];
        console.log(`  Set-Cookie headers (${setCookies.length}):`);
        setCookies.forEach((c: string) => console.log(`    ${c}`));
        console.log(`=== END AUTH DEBUG ===\n`);
      }
      // === END DIAGNOSTIC LOGGING ===

      return setCorsHeaders(response, origin);
    }

    return app.fetch(req);
  },
  websocket: getWebSocketHandler(),
});

setServer(server);

console.log(`Server running on port ${server.port}`);
