import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "");
const WS_URL = API_URL.replace(/^http/, "ws");

export function useProjectWebSocket(projectId: string) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}/ws/projects/${projectId}`);

    ws.onopen = () => {
      console.log(`[WS] Connected to project ${projectId}`);
    };

    ws.onmessage = (event) => {
      try {
        const { event: eventType } = JSON.parse(event.data);
        // Invalidate project data on any change
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });

        // Also invalidate notes if a note was added
        if (eventType === "project:note-added") {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
      } catch (e) {
        console.error("[WS] Failed to parse message", e);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected, reconnecting in 3s...");
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error("[WS] Error", error);
      ws.close();
    };

    wsRef.current = ws;
  }, [projectId, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
