module.exports = async (request) => {
  const { user } = request;

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

  if (user) {
    await user.checkForBans({ address, skip: false });

    return !(user.get('lockedOut') || false);
  }

  return false;
};
