const linkSocketIO = async (request) => {
  const { link, sockets } = require('../../routes/init');

  const {
    user,
    params: { io },
  } = request;

  let address = null;

  try {
    address =
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      (request.connection.socket ? request.connection.socket.remoteAddress : null);
  } catch (err) {
    address = request.ip;
  }

  if (address.indexOf(',') > -1) {
    address = address.split(',')[0];
  }

  const socket = sockets.find((s) => s.id === io);

  socket.user = user;
  link(socket);

  if (user) {
    user.checkForBans({ address, io });
    socket.emit('updateStyle', user.toStyle());

    return user.get('lockedOut') || false;
  }

  return false;
};

module.exports = linkSocketIO;
