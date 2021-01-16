/* global Parse */

function gameCommands(io, socket) {
  const { user } = socket;
  const username = user.get('username');
  const allowed = user.get('isMod') || user.get('isAdmin');

  const getResponse = (isGeneral) => {
    return isGeneral ? 'generalCommandResponse' : 'gameCommandResponse';
  };

  const notfound = 'No game with such code has been found.';
  const success = 'Successfully performed action.';
  const warning = 'You must fill all the required variables for this command to work.';
  const unauthorized = 'You are not authorized to use this command.';

  socket.on('pauseGame', (data) => {
    const { isGeneral } = data;

    if (allowed) {
      const { target, comment } = data;

      if (typeof target !== 'string') {
        socket.emit(getResponse(isGeneral), warning);
        return;
      }

      const gameQ = new Parse.Query('Game');

      gameQ
        .get(target, { useMasterKey: true })
        .then((g) => {
          const chat = g.get('chat');
          const code = g.get('code');

          g.set('frozen', true);
          g.save({}, { useMasterKey: true });

          chat
            .fetch({ useMasterKey: true })
            .then((c) => {
              c.moderationAction({
                action: 'PAUSE GAME',
                content: `Game #${code} has been paused.`,
                username,
                target,
                comment,
              });

              socket.emit(getResponse(isGeneral), success);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          socket.emit(getResponse(isGeneral), notfound);
          console.log(err);
        });
    } else {
      socket.emit(getResponse(isGeneral), unauthorized);
    }
  });

  socket.on('unpauseGame', (data) => {
    const { isGeneral } = data;

    if (allowed) {
      const { target, comment } = data;

      if (typeof target !== 'string') {
        socket.emit(getResponse(isGeneral), warning);
        return;
      }

      const gameQ = new Parse.Query('Game');

      gameQ
        .get(target, { useMasterKey: true })
        .then((g) => {
          const chat = g.get('chat');
          const code = g.get('code');

          g.set('frozen', false);
          g.save({}, { useMasterKey: true });

          chat
            .fetch({ useMasterKey: true })
            .then((c) => {
              c.moderationAction({
                action: 'UNPAUSE GAME',
                content: `Game #${code} has been resumed.`,
                username,
                target,
                comment,
              });

              socket.emit(getResponse(isGeneral), success);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          socket.emit(getResponse(isGeneral), notfound);
          console.log(err);
        });
    } else {
      socket.emit(getResponse(isGeneral), unauthorized);
    }
  });

  socket.on('endGame', (data) => {
    const { isGeneral } = data;

    if (allowed) {
      const { target, outcome, comment } = data;

      if (typeof target !== 'string') {
        socket.emit(getResponse(isGeneral), warning);
        return;
      }

      const gameQ = new Parse.Query('Game');

      gameQ
        .get(target, { useMasterKey: true })
        .then((g) => {
          const chat = g.get('chat');
          const code = g.get('code');

          if (outcome) {
            g.gameEnd(outcome === '1' ? 4 : 2);
          } else {
            g.set('ended', true);
          }

          g.save({}, { useMasterKey: true });

          chat
            .fetch({ useMasterKey: true })
            .then((c) => {
              c.moderationAction({
                action: 'END GAME',
                content: `Game #${code} has been ${outcome ? 'terminated' : 'voided'}.`,
                username,
                target,
                comment,
              });

              socket.emit(getResponse(isGeneral), success);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          socket.emit(getResponse(isGeneral), notfound);
          console.log(err);
        });
    } else {
      socket.emit(getResponse(isGeneral), unauthorized);
    }
  });

  socket.on('closeGame', (data) => {
    const { isGeneral } = data;

    if (allowed) {
      const { target, comment } = data;

      if (typeof target !== 'string') {
        socket.emit(getResponse(isGeneral), warning);
        return;
      }

      const gameQ = new Parse.Query('Game');

      gameQ
        .get(target, { useMasterKey: true })
        .then((g) => {
          const chat = g.get('chat');
          const code = g.get('code');

          g.set('active', false);
          g.save({}, { useMasterKey: true });

          chat
            .fetch({ useMasterKey: true })
            .then((c) => {
              c.moderationAction({
                action: 'CLOSE GAME',
                content: `Game #${code} has been closed.`,
                username,
                target,
                comment,
              });

              socket.emit(getResponse(isGeneral), success);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          socket.emit(getResponse(isGeneral), notfound);
          console.log(err);
        });
    } else {
      socket.emit(getResponse(isGeneral), unauthorized);
    }
  });

  socket.on('learnRoles', (data) => {
    const { isGeneral } = data;

    if (allowed) {
      const { target, comment } = data;

      if (typeof target !== 'string') {
        socket.emit(getResponse(isGeneral), warning);
        return;
      }

      const gameQ = new Parse.Query('Game');

      gameQ
        .get(target, { useMasterKey: true })
        .then((g) => {
          const chat = g.get('chat');

          const roles = g.get('roleList');

          g.add('privateKnowledgeNew', {
            username,
            knowledge: roles,
          });
          g.save({}, { useMasterKey: true });

          chat
            .fetch({ useMasterKey: true })
            .then((c) => {
              c.moderationAction({
                action: 'LEARNT ROLES',
                content: `A moderator has learnt the roles for this game.`,
                username,
                target,
                comment,
              });

              socket.emit(getResponse(isGeneral), success);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          socket.emit(getResponse(isGeneral), notfound);
          console.log(err);
        });
    } else {
      socket.emit(getResponse(isGeneral), unauthorized);
    }
  });
}

module.exports = gameCommands;
