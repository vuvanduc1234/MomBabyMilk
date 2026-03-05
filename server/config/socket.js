/**
 * Socket.IO singleton — set once in server.js, used everywhere else.
 */
let _io = null;

const setIO = (io) => {
  _io = io;
};

const getIO = () => {
  if (!_io) throw new Error("Socket.IO has not been initialised yet.");
  return _io;
};

module.exports = { setIO, getIO };
