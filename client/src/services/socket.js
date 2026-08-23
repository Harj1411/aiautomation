import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to backend real-time stream:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from backend real-time stream');
    });
  }
  return socket;
};

export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s) {
    s.emit('join:execution', executionId);
  }
};

export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s) {
    s.emit('leave:execution', executionId);
  }
};
