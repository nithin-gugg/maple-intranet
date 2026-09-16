/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";

export function useWebSocket() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Use ws:// for localhost, wss:// for production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Assuming backend runs on 8000, or we can use the same host if deployed
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsHost = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    
    const connect = () => {
      const ws = new WebSocket(`${wsHost}/api/v1/ws/${user.id}`);
      
      ws.onopen = () => {
        console.log('Connected to websocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.onclose = () => {
        console.log('Websocket disconnected, retrying in 3s...');
        setTimeout(connect, 3000);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent retry on unmount
        wsRef.current.close();
      }
    };
  }, [user?.id]);

  return { lastMessage };
}
