/**
 * Socket.IO singleton — created once in index.ts, imported everywhere else.
 * Avoids circular dependency between index.ts → messageRoutes → messageController → index.ts.
 */
import { Server } from "socket.io";

let _io: Server | null = null;

export function initIO(server: Server): void {
  _io = server;
}

export function getIO(): Server {
  if (!_io) throw new Error("Socket.IO has not been initialised yet");
  return _io;
}
