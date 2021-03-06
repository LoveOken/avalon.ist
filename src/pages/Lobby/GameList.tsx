// External

import React from 'react';
import { Link } from 'react-router-dom';
import Parse from 'parse';

// Internal

import AvalonScrollbars from '../../components/utils/AvalonScrollbars';
import queryClient from '../../parse/queryClient';
import GameForm from './GameForm';

// Styles

import '../../styles/Lobby/GameList.scss';

// Types

interface AvatarProps {
  url: string;
}

interface GameLinkProps {
  gameId: string;
  code: string;
  missionResults: (boolean | undefined)[];
  avatars: string[];
  host: string;
  mode: string;
  spectators: number;
  state: -1 | 0 | 1 | 2 | 3 | 4;
}

interface GameListState {
  games: GameLinkProps[];
  showCreate: boolean;
}

// Declaration

const Avatar = (props: AvatarProps) => {
  return <div className="avatar" style={{ backgroundImage: `url(${props.url})` }} />;
};

class GameLink extends React.PureComponent<GameLinkProps> {
  gameStateClass = ['waiting', 'in-progress', 'finished', 'paused', 'frozen'];
  gameState = ['Waiting', 'In Progress', 'Finished', 'Paused', 'Frozen'];

  render() {
    const {
      gameId,
      code,
      state,
      host,
      mode,
      spectators,
      missionResults,
      avatars,
    } = this.props;
    const _missionResults: (boolean | undefined)[] = new Array(5);
    _missionResults.fill(undefined);
    _missionResults.unshift(...missionResults);

    return (
      <Link className="game" to={`/game/${gameId}`}>
        <h3>
          <p>ROOM #{code}</p>
          {state > -1 ? (
            <p className={this.gameStateClass[state]}>{this.gameState[state]}</p>
          ) : null}
        </h3>
        <p className="tracker">
          {_missionResults.slice(0, 5).map((r, i) => (
            <span key={i} className={'mission ' + r} />
          ))}
        </p>
        <p>
          <span className="title">HOST:</span>
          {host}
        </p>
        <p>
          <span className="title">MODE:</span>
          {mode}
        </p>
        <p>
          <span className="title">SPECTATORS:</span>
          {spectators}
        </p>
        <div className="avatars">
          {avatars.map((r, i) => (
            <Avatar key={i} url={r} />
          ))}
        </div>
      </Link>
    );
  }
}

// Class

class GameList extends React.PureComponent<{}, GameListState> {
  state = {
    games: [],
    showCreate: false,
  };
  mounted: boolean = true;
  listSub: any = null;

  componentDidMount = () => {
    this.setSubscription();
  };

  componentWillUnmount = () => {
    this.mounted = false;
    if (this.listSub) queryClient.unsubscribe(this.listSub);
  };

  setSubscription = () => {
    const listQ = new Parse.Query('Lists');

    this.listSub = queryClient.subscribe(listQ);

    this.listSub.on('open', this.playerListRequest);
    this.listSub.on('update', (lists: any) => {
      this.parseRoomList(lists.get('roomList'));
    });
  };

  playerListRequest = () => {
    Parse.Cloud.run('generalCommands', { call: 'roomListRequest' }).then(
      this.parseRoomList
    );
  };

  parseRoomList = (games: GameLinkProps[]) => {
    if (!this.mounted) {
      queryClient.unsubscribe(this.listSub);
      return;
    }

    this.setState({ games });
  };

  showCreateForm = () => {
    const { showCreate } = this.state;

    this.setState({ showCreate: !showCreate });
  };

  exitCreateForm = () => {
    this.setState({ showCreate: false });
  };

  render() {
    const { games, showCreate }: GameListState = this.state;
    return (
      <div id="Game-List" className="row">
        <h3>
          <p>CURRENT GAMES</p>
        </h3>
        <div className="game-list-settings">
          <button className="game-list-create" onClick={this.showCreateForm}>
            CREATE
          </button>
        </div>
        <AvalonScrollbars>
          {games.map((g) => <GameLink {...g} key={'Game' + g.code} />).reverse()}
        </AvalonScrollbars>
        {showCreate ? (
          <GameForm
            title="CREATE A NEW GAME"
            onExit={this.exitCreateForm}
            createsGame={true}
            gameId={'none'}
          />
        ) : null}
      </div>
    );
  }
}

export default GameList;
