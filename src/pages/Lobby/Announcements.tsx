// External

import React from 'react';
import { Link } from 'react-router-dom';

// Internal

import Parse from '../../parse/parse';
import AvalonScrollbars from '../../components/utils/AvalonScrollbars';

// Styles

import '../../styles/Lobby/Announcements.scss';

// Types

interface AnnouncementsState {
  articles: any[];
}

interface AnnouncementProps {
  date: number;
  text: string;
  id: string;
}

// Declaration

const Announcement = (props: AnnouncementProps) => {
  const dateObj = new Date(props.date);
  const month = ('00' + (dateObj.getUTCMonth() + 1)).slice(-2);
  const day = ('00' + dateObj.getUTCDate()).slice(-2);
  const year = dateObj.getUTCFullYear();

  return (
    <p className="announcement">
      <span className="date">
        {year}/{month}/{day}
      </span>
      <Link to={'/article/' + props.id}>{props.text}</Link>
    </p>
  );
};

class Announcements extends React.PureComponent<{}, AnnouncementsState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      articles: [],
    };
  }
  envSub: any = null;

  componentDidMount = () => {
    this.setSubscription();
  };

  componentWillUnmount = () => {
    this.envSub.unsubscribe();
  };

  setSubscription = async () => {
    const envQ = new Parse.Query('Environment');

    this.envSub = await envQ.subscribe();

    this.envSub.on('open', this.latestAnnouncementsRequest);
    this.envSub.on('update', (env: any) => {
      this.latestAnnouncementsResponse(env.get('announcementLogs').slice(-5));
    });
  };

  latestAnnouncementsRequest = () => {
    Parse.Cloud.run('latestAnnouncementsRequest').then((result) =>
      this.latestAnnouncementsResponse(result)
    );
  };

  latestAnnouncementsResponse = (articles: any[]) => {
    articles = articles.reverse();
    this.setState({ articles });
  };

  render() {
    return (
      <div id="Announcements" className="row">
        <h3>
          <p>LATEST ANNOUNCEMENTS</p>
        </h3>
        <AvalonScrollbars>
          {this.state.articles.map((a, i) => (
            <Announcement
              date={a.timestamp}
              text={a.title}
              id={a.id}
              key={a.id + a.timestamp}
            />
          ))}
        </AvalonScrollbars>
      </div>
    );
  }
}

export default Announcements;
