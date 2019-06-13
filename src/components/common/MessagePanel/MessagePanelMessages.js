import React, { Component, Fragment, createRef } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { InView } from 'react-intersection-observer';
import styled from 'styled-components';
import { position } from 'polished';
import {
  map, findIndex, includes, isEqual,
} from 'lodash';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import RootRef from '@material-ui/core/RootRef';

import grey from '@material-ui/core/colors/grey';
import blue from '@material-ui/core/colors/blue';

import { getStyledProps, getSpacing } from '../../../styles';
import {
  messageTimeParser,
  messageHistoryDateParser,
  isSameDay,
} from '../../../helpers';

const Wrapper = styled.div`
  flex: 1 auto;
  position: relative;
  overflow: hidden;
`;

const MessagePanelListView = styled.div`
  ${position('absolute', 0, '-17px', 0, 0)};
  display: flex;
  flex-flow: column;
  overflow-x: hidden;
  overflow-y: scroll;
  z-index: 15;
`;

const MessagePanelList = styled(({ scrollbarPresence, ...rest }) => <List {...rest} />)`
  && {
    margin-top: auto;
    display: flex;
    flex-flow: column;
    position: relative;
    padding: 17px 0;
    z-index: 10;
  }
`;

const MessagePanelListItem = styled(ListItem)`
  && {
    flex-flow: column;
  }
`;

const MessagePanelListItemMessageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column;
  align-items: ${({ alignItems }) => alignItems};
`;

const ListScrollbar = styled.div`
  ${position('absolute', 0, 0, 0, null)};
  width: 4px;
  display: ${({ presence }) => (presence ? 'block' : 'none')};
  background-color: ${getStyledProps('theme.palette.grey.300')};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: .25s ease;
  z-index: 20;

  div {
    ${position('absolute', null, 0, 0, 0)};
    background-color: ${getStyledProps('theme.palette.primary.main')};
  }
`;

const MessagePanelHistoryDivider = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  margin: ${getSpacing(1)} 0;

  p {
    height: 1px;
    flex: 1 auto;
    display: inline-flex;
    background-color: ${grey[500]};
    border-radius: 2px;
  }

  span {
    padding: 0 ${getSpacing(2)};
    color: ${grey[500]};
  }
`;

const MessagePanelMessage = styled.div`
  max-width: 49%;
  padding: ${getSpacing(1)};
  ${({ isMyMessage }) => ({
    [`border-bottom-${isMyMessage ? 'left' : 'right'}-radius`]: 0,
  })};
  background-color: ${({ isMyMessage }) => (isMyMessage ? grey[100] : blue[100])};
  border-radius: 5px;
  opacity: ${({ isAdding }) => (isAdding ? 0.3 : 1)};
  word-break: break-all;
  ${getStyledProps('theme.typography.body2')};

  &:hover {
    cursor: text;
  }
`;

const MessagePanelSystemMessage = styled.div`
  padding: ${getSpacing(1)};
  color: ${grey[500]};
  background-color: ${grey[100]};
  border-radius: 10px;
`;

const MessagePanelMessageTime = styled.div`
  display: flex;
  justify-content: flex-start;

  span {
    ${getStyledProps('theme.typography.caption')};
    color: ${getStyledProps('theme.palette.text.secondary')};
  }
`;

const MessagePanelLoading = styled.div`
  height: 20px;
  display: flex;
  justify-content: center;
  margin: ${getSpacing(1)} 0;
`;

class MessagePanelMessages extends Component {
  listRef = createRef();

  listViewRef = createRef();

  scrollbarThumbRef = createRef();

  state = {
    dragging: false,
    scrollbar: false,
    scrollbarPresence: false,
    scrollbarThumbHeight: 50,
    observableId: null,
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { observableId } = this.state;

    if (!isEqual(observableId, nextState.observableId)) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    const { observableId } = this.state;
    const { loading, chatId, messages } = this.props;

    if (!isEqual(prevProps.chatId, chatId)) {
      const { id } = messages[0];

      this.setObservableId(id);
      this.scrollToBottom();
    }

    if (!isEqual(prevProps.messages, messages) && isEqual(prevProps.chatId, chatId)) {
      if (messages.length) {
        const { id } = messages[0];

        if (observableId) {
          this.scrollToMessage(observableId);
        } else {
          this.scrollToBottom();
        }
        this.setObservableId(id);
      } else {
        this.setObservableId();
      }
    }
  }

  onScroll = () => {
    this.calculateScrollbarPosition();
  }

  toggleScrollbar = (scrollbar) => {
    const { dragging, scrollbarPresence } = this.state;

    if (dragging || !scrollbarPresence) {
      return;
    }
    this.setState({ scrollbar });
  }

  calculateScrollbarPosition = () => {
    const { scrollbarThumbHeight } = this.state;
    const { scrollTop } = this.listViewRef.current;
    const { height: listHeight } = this.listRef.current.getBoundingClientRect();
    const { height: listViewHeight } = this.listViewRef.current.getBoundingClientRect();
    const scrollHeight = listHeight - listViewHeight;
    const ratioPercent = scrollTop / scrollHeight;
    const scrollbarHeight = (listViewHeight - scrollbarThumbHeight);
    const thumbPosition = scrollbarHeight - (ratioPercent * scrollbarHeight);

    this.scrollbarThumbRef.current.style.bottom = `${thumbPosition}px`;
  }

  onResize = (width, height) => {
    const listViewRect = this.listViewRef.current.getBoundingClientRect();
    const { height: listViewHeight } = listViewRect;

    if (height > listViewHeight) {
      this.setScrollbarPresence(true);
      this.calculateScrollbarPosition();
    } else {
      this.setScrollbarPresence(false);
    }
  }

  onIntersectionChange = (inView, { target: { id } }) => {
    const { observableId } = this.state;
    const { getMessages, loading } = this.props;

    if (inView && (observableId === id) && !loading) {
      getMessages();
    }
  }

  setObservableId = (id = null) => {
    const { observableId } = this.state;

    if (observableId !== id) {
      this.setState({ observableId: id });
    }
  }

  setScrollbarPresence = (scrollbarPresence) => {
    this.setState({ scrollbarPresence });
  }

  scrollToBottom = () => {
    const { height: listHeight } = this.listRef.current.getBoundingClientRect();
    const { height: listViewHeight } = this.listViewRef.current.getBoundingClientRect();

    if (listHeight > listViewHeight) {
      this.listViewRef.current.scrollTop = this.listViewRef.current.scrollHeight;
    }
  }

  scrollToMessage = (messageId) => {
    const el = document.getElementById(messageId);

    this.listViewRef.current.scrollTop = el.offsetTop;
  }

  onMouseDown = (e) => {
    e.preventDefault();
    const { dragging } = this.state;
    const { clientY: initialClientY } = e;
    const listViewRect = this.listViewRef.current.getBoundingClientRect();
    const scrollThumbRect = this.scrollbarThumbRef.current.getBoundingClientRect();
    const thumbOffset = scrollThumbRect.bottom - listViewRect.top;
    const mouseOffset = initialClientY - listViewRect.top;
    const diff = thumbOffset - mouseOffset;

    if (!dragging) {
      this.setState({ dragging: true });
    }

    const onMouseMove = ({ clientY }) => {
      const listRect = this.listRef.current.getBoundingClientRect();
      const currentMouseOffset = clientY - listViewRect.top;
      const positionInView = listViewRect.height - (currentMouseOffset + diff);
      const ratioPercent = positionInView / listViewRect.height;
      const scrollHeight = listRect.height - listViewRect.height;
      const scrollTop = scrollHeight - (ratioPercent * scrollHeight);
      let valid = scrollTop;

      if (scrollTop < 0) valid = 0;
      if (scrollTop > scrollHeight) valid = scrollHeight;

      this.listViewRef.current.scrollTop = valid;
    };

    const onMouseUp = () => {
      if (dragging) {
        this.setState({ dragging: false, scrollbar: false });
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  render() {
    const { scrollbar, scrollbarPresence, scrollbarThumbHeight } = this.state;
    const { messages, myId, loading, sendedIds } = this.props;

    const renderMessages = () => {
      return map(messages, ({
        id,
        senderId,
        type,
        time,
        content,
      }, index) => {
        const isSystem = type === 'system';
        const isFirst = messages[0].id === id;
        const isMyMessage = senderId === myId;
        const isAdding = includes(sendedIds, id);
        const direction = isMyMessage ? 'start' : 'end';
        const alignItems = isSystem ? 'center' : `flex-${direction}`;
        let divider = false;

        if (index > 0) {
          const { time: prevMessageTime } = messages[index - 1];

          divider = !isSameDay(time, prevMessageTime);
        }

        return (
          <InView key={id} onChange={this.onIntersectionChange}>
            {({ ref }) => (
              <RootRef rootRef={ref}>
                <MessagePanelListItem id={id}>
                  <MessagePanelListItemMessageWrapper alignItems={alignItems}>
                    <If condition={isFirst || divider}>
                      <MessagePanelHistoryDivider>
                        <p />
                        <span>{messageHistoryDateParser(time)}</span>
                        <p />
                      </MessagePanelHistoryDivider>
                    </If>
                    <Choose>
                      <When condition={isSystem}>
                        <MessagePanelSystemMessage>
                          <p>{content}</p>
                        </MessagePanelSystemMessage>
                      </When>
                      <Otherwise>
                        <MessagePanelMessage
                          isMyMessage={isMyMessage}
                          isAdding={isAdding}
                        >
                          {content}
                        </MessagePanelMessage>
                        <MessagePanelMessageTime>
                          <span>{messageTimeParser(time, 'wide')}</span>
                        </MessagePanelMessageTime>
                      </Otherwise>
                    </Choose>
                  </MessagePanelListItemMessageWrapper>
                </MessagePanelListItem>
              </RootRef>
            )}
          </InView>
        );
      });
    };

    return (
      <Wrapper>
        <ListScrollbar
          show={scrollbar}
          presence={scrollbarPresence}
          onMouseEnter={() => this.toggleScrollbar(true)}
          onMouseLeave={() => this.toggleScrollbar(false)}
        >
          <RootRef rootRef={this.scrollbarThumbRef}>
            <div
              style={{ height: `${scrollbarThumbHeight}px` }}
              onDragStart={() => false}
              onMouseDown={this.onMouseDown}
            />
          </RootRef>
        </ListScrollbar>
        <RootRef rootRef={this.listViewRef}>
          <MessagePanelListView
            onScroll={this.onScroll}
            onMouseOver={() => !scrollbar && this.toggleScrollbar(true)}
            onMouseLeave={() => this.toggleScrollbar(false)}
          >
            <RootRef rootRef={this.listRef}>
              <MessagePanelList disablePadding scrollbarPresence={scrollbarPresence}>
                <Fragment>
                  <MessagePanelLoading>
                    <If condition={loading}>
                      <CircularProgress size={20} color="primary" />
                    </If>
                  </MessagePanelLoading>
                </Fragment>
                <ReactResizeDetector handleHeight onResize={this.onResize}>
                  {renderMessages()}
                </ReactResizeDetector>
              </MessagePanelList>
            </RootRef>
          </MessagePanelListView>
        </RootRef>
      </Wrapper>
    );
  }
}

export default MessagePanelMessages;
