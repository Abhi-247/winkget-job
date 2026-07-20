import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a connected socket for the given token.
 * Reuses the existing connection if already connected.
 */
export function getSocket(token: string): Socket {
  if (socket) return socket;

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  socket = io(url, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

/**
 * Disconnect and clear the singleton.
 * Call this on page unmount or sign-out.
 */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
