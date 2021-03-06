/* global Parse */

const notfound = 'No game with such code has been found.';
const success = 'Successfully performed action.';
const warning = 'You must fill all the required variables for this command to work.';
const unauthorized = 'You are not authorized to use this command.';

const pauseGame = async (request) => {
  const { user } = request;
  //no user in request return false
  if (!user) return false;

  const isAllowed = user.get('isMod') || user.get('isAdmin');
  const username = user.get('username');

  if (isAllowed) {
    const { target, comment } = request.params;

    if (!target) {
      return warning;
    }

    const gameQ = new Parse.Query('Game');

    return await gameQ
      .get(target, { useMasterKey: true })
      .then((g) => {
        const chat = g.get('chat');
        const code = g.get('code');
        //freeze game
        g.set('frozen', true);
        g.save({}, { useMasterKey: true });
        //send notification to players
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
          })
          .catch((err) => console.log(err));

        return success;
      })
      .catch((err) => {
        console.log(err);
        return notfound;
      });
  } else {
    return unauthorized;
  }
};

const unpauseGame = async (request) => {
  const { user } = request;

  if (!user) return false;

  const isAllowed = user.get('isMod') || user.get('isAdmin');
  const username = user.get('username');

  if (isAllowed) {
    const { target, comment } = request.params;

    if (!target) {
      return warning;
    }

    const gameQ = new Parse.Query('Game');

    return await gameQ
      .get(target, { useMasterKey: true })
      .then((g) => {
        const chat = g.get('chat');
        const code = g.get('code');
        //unpause game
        g.set('frozen', false);
        g.save({}, { useMasterKey: true });
        //send notification to players
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
          })
          .catch((err) => console.log(err));

        return success;
      })
      .catch((err) => {
        console.log(err);
        return notfound;
      });
  } else {
    return unauthorized;
  }
};

const endGame = async (request) => {
  const { user } = request;

  if (!user) return false;

  const isAllowed = user.get('isMod') || user.get('isAdmin');
  const username = user.get('username');

  if (isAllowed) {
    const { target, comment, outcome } = request.params;

    if (!target) {
      return warning;
    }

    const gameQ = new Parse.Query('Game');

    return await gameQ
      .get(target, { useMasterKey: true })
      .then((g) => {
        const chat = g.get('chat');
        const code = g.get('code');
        //check outcome and void/terminate game accordingly
        if (outcome) {
          g.gameEnd(outcome === '1' ? 4 : 2);
        } else {
          g.set('ended', true);
        }

        g.save({}, { useMasterKey: true });
        //send notification to players about whether game has been voided or terminated
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
          })
          .catch((err) => console.log(err));

        return success;
      })
      .catch((err) => {
        console.log(err);
        return notfound;
      });
  } else {
    return unauthorized;
  }
};

const closeGame = async (request) => {
  const { user } = request;

  if (!user) return false;

  const isAllowed = user.get('isMod') || user.get('isAdmin');
  const username = user.get('username');

  if (isAllowed) {
    const { target, comment } = request.params;

    if (!target) {
      return warning;
    }

    const gameQ = new Parse.Query('Game');

    return await gameQ
      .get(target, { useMasterKey: true })
      .then((g) => {
        const chat = g.get('chat');
        const code = g.get('code');
        //close game
        g.set('active', false);
        g.save({}, { useMasterKey: true });
        //send notification to players
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
          })
          .catch((err) => console.log(err));

        return success;
      })
      .catch((err) => {
        console.log(err);
        return notfound;
      });
  } else {
    return unauthorized;
  }
};

const learnRoles = async (request) => {
  const { user } = request;

  if (!user) return false;

  const isAllowed = user.get('isMod') || user.get('isAdmin');
  const username = user.get('username');

  if (isAllowed) {
    const { target, comment } = request.params;

    if (!target) {
      return warning;
    }

    const gameQ = new Parse.Query('Game');

    return await gameQ
      .get(target, { useMasterKey: true })
      .then((g) => {
        const chat = g.get('chat');

        const roles = g.get('roleList');
        //send roles to moderator
        g.add('privateKnowledgeNew', {
          username,
          knowledge: roles,
        });
        g.save({}, { useMasterKey: true });
        //send notification to players that moderator learnt roles
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
          })
          .catch((err) => console.log(err));

        return success;
      })
      .catch((err) => {
        console.log(err);
        return notfound;
      });
  } else {
    return unauthorized;
  }
};

module.exports = { pauseGame, unpauseGame, endGame, closeGame, learnRoles };
