import io from 'socket.io-client';
import env from '../common/env';
import { ClientEvents, ServerEvents } from './EventNames';
import { onAuthenticated } from './events/connectionEvents';
import { onFriendRemoved, onFriendRequestAccepted, onFriendRequestPending, onFriendRequestSent } from './events/friendEvents';
import { onInboxOpened } from './events/inboxEvents';
import { onMessageCreated, onMessageDeleted } from './events/messageEvents';
import { onServerChannelCreated, onServerChannelUpdated, onServerJoined, onServerMemberJoined, onServerUpdated } from './events/serverEvents';
import { onNotificationDismissed, onUserPresenceUpdate } from './events/userEvents';


const socket = io(env.SERVER_URL, { transports: ['websocket'], autoConnect: false});

let token: undefined | string;

export default {
  login: (newToken?: string) => {
    token = newToken;
    socket.connect()
  },
  id: () => socket.id,
  socket
}


socket.on(ServerEvents.CONNECT, () => {
  socket.emit(ClientEvents.AUTHENTICATE, {token});
})

socket.on(ServerEvents.USER_AUTHENTICATED, onAuthenticated);


socket.on(ServerEvents.USER_PRESENCE_UPDATE, onUserPresenceUpdate)

socket.on(ServerEvents.FRIEND_REQUEST_SENT, onFriendRequestSent)
socket.on(ServerEvents.FRIEND_REQUEST_PENDING, onFriendRequestPending)
socket.on(ServerEvents.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted)
socket.on(ServerEvents.FRIEND_REMOVED, onFriendRemoved)

socket.on(ServerEvents.INBOX_OPENED, onInboxOpened)
socket.on(ServerEvents.NOTIFICATION_DISMISSED, onNotificationDismissed)

socket.on(ServerEvents.MESSAGE_CREATED, onMessageCreated);
socket.on(ServerEvents.MESSAGE_DELETED, onMessageDeleted);


socket.on(ServerEvents.SERVER_JOINED, onServerJoined)
socket.on(ServerEvents.SERVER_UPDATED, onServerUpdated)
socket.on(ServerEvents.SERVER_MEMBER_JOINED, onServerMemberJoined)
socket.on(ServerEvents.SERVER_CHANNEL_CREATED, onServerChannelCreated)
socket.on(ServerEvents.SERVER_CHANNEL_UPDATED, onServerChannelUpdated)