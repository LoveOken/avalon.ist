// External

import React from 'react';
import { Link } from 'react-router-dom';

// Internal

import Parse from 'parse';
import queryClient from '../../parse/queryClient';
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
  url: string;
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
      <Link to={'/article/' + props.url}>{props.text}</Link>
    </p>
  );
};

class Announcements extends React.PureComponent<{}, AnnouncementsState> {
  state = {
    articles: [],
  };
  mounted: boolean = true;
  announcementSub: any = null;

  componentDidMount = () => {
    this.setSubscription();
  };

  componentWillUnmount = () => {
    this.mounted = false;
    if (this.announcementSub) queryClient.unsubscribe(this.announcementSub);
  };

  setSubscription = () => {
    const announcementQ = new Parse.Query('Announcement');

    this.announcementSub = queryClient.subscribe(announcementQ);

    this.announcementSub.on('open', this.latestAnnouncementsRequest);
    this.announcementSub.on('update', this.latestAnnouncementsRequest);
    this.announcementSub.on('create', this.latestAnnouncementsRequest);
  };

  latestAnnouncementsRequest = () => {
    Parse.Cloud.run('generalCommands', { call: 'latestAnnouncementsRequest' }).then(
      this.latestAnnouncementsResponse
    );
  };

  latestAnnouncementsResponse = (articles: any[]) => {
    if (!this.mounted) {
      queryClient.unsubscribe(this.announcementSub);
      return;
    }

    this.setState({ articles });
  };

  render() {
    return (
      <div id="Announcements" className="row">
        <h3>
          <p>LATEST ANNOUNCEMENTS</p>
        </h3>
        <AvalonScrollbars>
          {this.state.articles.map((a: any) => (
            <Announcement
              date={a.timestamp}
              text={a.title}
              url={a.url}
              key={a.objectId}
            />
          ))}
        </AvalonScrollbars>
      </div>
    );
  }
}

export default Announcements;
