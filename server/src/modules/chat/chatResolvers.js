import { PubSub, withFilter } from 'graphql-subscriptions';
import { includes, find } from 'lodash';

import AuthProvider from '../auth/AuthProvider';
import ChatProvider from './ChatProvider';

import { CHAT_CREATED, MESSAGE_ADDED } from '../subscriptions';

export default {
  Query: {
    chats: (_, args, { injector }) => injector.get(ChatProvider).getChats(),
    myChats: (_, args, { injector }) => injector.get(ChatProvider).getMyChats(),
  },
  Mutation: {
    createChat: (_, { userId }, { injector }) => injector.get(ChatProvider).createChat(userId),
    addMessage: (_, { chatId, content }, { injector }) => injector.get(ChatProvider).addMessage(chatId, content),
    removeChat: (_, { chatId }, { injector }) => injector.get(ChatProvider).removeChat(chatId),
    removeChats: (_, args, { injector }) => injector.get(ChatProvider).removeChats(),
  },
  Subscription: {
    chatCreated: {
      subscribe: withFilter(
        (_, args, { injector }) => injector.get(PubSub).asyncIterator([CHAT_CREATED]),
        ({ chatCreated }, variables, { injector }) => {
          const { chat: { members }, contact: { userInfo } } = chatCreated;
          const { id } = injector.get(AuthProvider).user;
          const accept = includes(members, id) && userInfo.id !== id;

          return accept;
        },
      ),
    },
    messageAdded: {
      subscribe: withFilter(
        (_args, { injector }) => injector.get(PubSub).asyncIterator([MESSAGE_ADDED]),
        async ({ messageAdded }, variables, { injector }) => {
          const { chatId, message } = messageAdded;
          const { senderId } = message;
          const { id, contacts } = await injector.get(AuthProvider).getMe();
          const accept = find(contacts, { chatId }) && senderId !== id;

          return accept;
        },
      ),
    },
  },
};
