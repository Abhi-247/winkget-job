import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a connected socket for the given token.
 * Reuses the existing connection if already connected.
 */
export function getSocket(token: string): Socket {
  if (socket && socket.connected) return socket;

  // Disconnect any stale socket before creating a new one
  socket?.disconnect();

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
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
