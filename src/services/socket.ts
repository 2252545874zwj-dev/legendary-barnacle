import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

let socket: Socket | null = null;

export interface InfoEventData {
  id: number;
  title?: string;
  content?: string;
  category?: string;
  userId?: number;
  isPrivate?: number;
}

export interface CommentEventData {
  id: number;
  infoId?: number;
  userId?: number;
  userName?: string;
  content?: string;
}

export const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onInfoCreated = (callback: (data: InfoEventData) => void): void => {
  const s = connectSocket();
  s.on('infoCreated', callback);
};

export const onInfoUpdated = (callback: (data: InfoEventData) => void): void => {
  const s = connectSocket();
  s.on('infoUpdated', callback);
};

export const onInfoDeleted = (callback: (data: { id: number }) => void): void => {
  const s = connectSocket();
  s.on('infoDeleted', callback);
};

export const onCommentAdded = (callback: (data: CommentEventData) => void): void => {
  const s = connectSocket();
  s.on('commentAdded', callback);
};

export const onCommentDeleted = (callback: (data: { id: number }) => void): void => {
  const s = connectSocket();
  s.on('commentDeleted', callback);
};

export const offInfoCreated = (callback?: (data: InfoEventData) => void): void => {
  if (socket) {
    socket.off('infoCreated', callback);
  }
};

export const offInfoUpdated = (callback?: (data: InfoEventData) => void): void => {
  if (socket) {
    socket.off('infoUpdated', callback);
  }
};

export const offInfoDeleted = (callback?: (data: { id: number }) => void): void => {
  if (socket) {
    socket.off('infoDeleted', callback);
  }
};

export const offCommentAdded = (callback?: (data: CommentEventData) => void): void => {
  if (socket) {
    socket.off('commentAdded', callback);
  }
};

export const offCommentDeleted = (callback?: (data: { id: number }) => void): void => {
  if (socket) {
    socket.off('commentDeleted', callback);
  }
};