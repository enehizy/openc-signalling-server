import io from 'socket.io-client';
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const socket = io(`${protocol}//${host}`);

export default socket;
