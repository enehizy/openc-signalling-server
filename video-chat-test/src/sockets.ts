import io from 'socket.io-client';
const socket = io(`wss://${location.href}`);

export default socket;
