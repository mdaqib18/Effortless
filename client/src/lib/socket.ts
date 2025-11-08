// Socket.io client for real-time task updates
import { io, Socket } from "socket.io-client";

export function createSocketConnection(onMessage: (data: any) => void): Socket {
  const socket = io(window.location.origin, {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket.io connected:', socket.id);
  });

  socket.on('taskUpdate', (data) => {
    onMessage(data);
  });

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket.io error:', error);
  });

  return socket;
}
