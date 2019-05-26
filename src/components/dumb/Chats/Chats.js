import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import styled from 'styled-components';
import { size } from 'polished';
import { isEmpty, isEqual, find } from 'lodash';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';

import { AppContext } from '../../context/AppProvider';
import ContactPanel, { NoContactInfo } from '../../common/ContactPanel/ContactPanel';
import MessagePanel from '../../common/MessagePanel/MessagePanel';

import ChatsContainer from '../../smart/ChatsContainer';

import { getStyledProps, getSpacing } from '../../../styles';

const Wrapper = styled(Paper)`
  && {
    ${size('100%')};
    display: flex;
    align-items: stretch;
  }
`;

const InfoPanel = styled(Paper)`
  && {
    height: 100%;
    display: flex;
    flex-flow: column;
    padding: ${getSpacing(2)};
    background-color: ${getStyledProps('theme.palette.background.default')};
  }
`;

class Chats extends Component {
  state = {
    selected: null,
  }

  componentDidMount() {
    const selected = this.checkRoute();

    if (selected) {
      this.selectChat(selected);
    }
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (!isEqual(prevProps.location, location)) {
      const selected = this.checkRoute();

      if (!selected) {
        this.selectChat(null);
      } else {
        this.selectChat(selected);
      }
    }
  }

  checkRoute = () => {
    const { location: { search } } = this.props;
    const { chatId } = queryString.parse(search);

    return chatId;
  }

  selectChat = (chatId, changeRoute = false) => {
    const { history } = this.props;

    this.setState({ selected: chatId });

    if (changeRoute) {
      history.push(`/chats?chatId=${chatId}`);
    }
  }

  render() {
    const { selected } = this.state;

    return (
      <AppContext.Consumer>
        {({ user }) => (
          <ChatsContainer
            messageAddedSubscriptionProps={{
              variables: {
                chatId: selected,
              },
            }}
          >
            {({
              getMyChats: { data: { myContacts, myChats } },
            }) => {
              const selectedContact = find(myContacts, { chatId: selected });
              const selectedChat = find(myChats, { id: selected });

              return (
                <Wrapper square elevation={0}>
                  <Grid container spacing={0}>
                    <Grid item xs={12} sm={4} lg={3}>
                      <ContactPanel
                        contacts={myContacts}
                        chats={myChats}
                        selected={selected}
                        selectChat={chatId => this.selectChat(chatId, true)}
                      />
                    </Grid>
                    <Hidden xsDown>
                      <Grid item sm={8} lg={6}>
                        <Choose>
                          <When condition={isEmpty(myContacts)}>
                            {null}
                          </When>
                          <When condition={!selected}>
                            <NoContactInfo>
                              <Typography variant="subtitle2">
                                <p>Please select a chat to start messaging</p>
                              </Typography>
                            </NoContactInfo>
                          </When>
                          <Otherwise>
                            <MessagePanel
                              me={user}
                              contact={selectedContact}
                              chat={selectedChat}
                            />
                          </Otherwise>
                        </Choose>
                      </Grid>
                    </Hidden>
                    <Hidden mdDown>
                      <Grid item lg={3}>
                        <InfoPanel square elevation={0}>{null}</InfoPanel>
                      </Grid>
                    </Hidden>
                  </Grid>
                </Wrapper>
              );
            }}
          </ChatsContainer>
        )}
      </AppContext.Consumer>
    );
  }
}

export default withRouter(Chats);
