// External

import React from 'react';
import { Link } from 'react-router-dom';
import queryClient from '../../parse/queryClient';

// Internal

// Styles

import Parse from 'parse';
import '../../styles/Lobby/NewAvatars.scss';

// Declaration

interface AvatarProps {
  user: string;
  avatar: string;
}

interface NewAvatarsState {
  avatarList: any[];
}

const Avatar = (props: AvatarProps) => {
  return (
    <Link
      to={`/profile/${props.user}`}
      className="avatar"
      style={{ backgroundImage: `url(${props.avatar})` }}
    />
  );
};

class NewAvatars extends React.PureComponent<{}, NewAvatarsState> {
  state = {
    avatarList: [],
  };
  mounted: boolean = true;
  avatarsSub: any = null;

  componentDidMount = () => {
    this.setSubscription();
  };

  componentWillUnmount = () => {
    this.mounted = false;
    if (this.avatarsSub) queryClient.unsubscribe(this.avatarsSub);
  };

  setSubscription = () => {
    const avatarsQ = new Parse.Query('Avatar');

    this.avatarsSub = queryClient.subscribe(avatarsQ);

    this.avatarsSub.on('open', this.latestAvatarsRequest);
    this.avatarsSub.on('create', this.newAvatar);
  };

  latestAvatarsRequest = () => {
    Parse.Cloud.run('generalCommands', { call: 'latestAvatarsRequest' }).then((result) =>
      this.latestAvatarsResponse(result)
    );
  };

  latestAvatarsResponse = (avatarList: any) => {
    if (!this.mounted) {
      queryClient.unsubscribe(this.avatarsSub);
      return;
    }

    this.setState({ avatarList });
  };

  newAvatar = (avatar: any) => {
    if (!this.mounted) {
      queryClient.unsubscribe(this.avatarsSub);
      return;
    }

    const avatarList = [avatar.toJSON(), ...this.state.avatarList].slice(0, 3);

    this.setState({ avatarList });
  };

  render() {
    return (
      <div id="New-Avatars" className="row">
        <h3>
          <p>LATEST AVATARS</p>
        </h3>
        <div className="ave-container">
          {this.state.avatarList.map((a: any, i) => (
            <Avatar avatar={a.avatar} user={a.user} key={a.objectId} />
          ))}
        </div>
      </div>
    );
  }
}

export default NewAvatars;
