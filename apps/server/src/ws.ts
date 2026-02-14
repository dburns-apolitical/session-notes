import type { ServerWebSocket } from "bun";

type WSData = {
  projectId: string;
  userId: string;
};

export type WS = ServerWebSocket<WSData>;

export function getWebSocketHandler() {
  return {
    open(ws: WS) {
      ws.subscribe(`project:${ws.data.projectId}`);
    },
    close(ws: WS) {
      ws.unsubscribe(`project:${ws.data.projectId}`);
    },
    message(ws: WS, message: string | Buffer) {
      // Client-to-server messages not used; mutations go through HTTP
    },
  };
}

export function broadcast(projectId: string, event: string, data: any) {
  server.publish(
    `project:${projectId}`,
    JSON.stringify({ event, data })
  );
}

// Will be set when server starts
let server: ReturnType<typeof Bun.serve>;
export function setServer(s: typeof server) {
  server = s;
}
