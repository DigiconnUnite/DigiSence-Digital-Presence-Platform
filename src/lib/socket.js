let _io = null;

exports.setIo = (io) => {
  _io = io;
};

exports.getIo = () => {
  if (!_io) {
    throw new Error('Socket.io not initialized. Call setIo first.');
  }
  return _io;
};

exports.emitToRoom = (room, event, data) => {
  _io?.to(room).emit(event, data);
};

exports.emitToUser = (userId, event, data) => {
  _io?.to(`user:${userId}`).emit(event, data);
};

exports.broadcast = (event, data) => {
  _io?.emit(event, data);
};
