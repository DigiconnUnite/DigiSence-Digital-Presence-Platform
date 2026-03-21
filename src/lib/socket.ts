import { Server } from 'socket.io';

let _io: Server | null = null;

export const setIo = (io: Server) => {
  _io = io;
};

export const getIo = () => {
  if (!_io) {
    throw new Error('Socket.io not initialized. Call setIo first.');
  }
  return _io;
};

export const emitToRoom = (room: string, event: string, data: unknown) => {
  _io?.to(room).emit(event, data);
};

export const emitToUser = (userId: string, event: string, data: unknown) => {
  _io?.to(`user:${userId}`).emit(event, data);
};

export const broadcast = (event: string, data: unknown) => {
  _io?.emit(event, data);
};
