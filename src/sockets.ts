import { Server } from 'socket.io';
import { v4 } from 'uuid';
const connectSocket = (httpsServer: any) => {
  const io = new Server(httpsServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  //event triggers
  const CANDIDATES = 'icecandidates';
  const OFFERS = 'offers';
  const ANSWERS = 'answers';
  const JOIN = 'join';
  const NEW_PEER = 'newpeer';
  const FIRST_PEERS = 'firstpeers';

  const peers = new Set();

  const peerIds = new Map();
  io.on('connection', (socket) => {
    console.log('connecting to socket');

    //   peers.add(socket.id);
    // if (peers.size > MAX_PEERS) {
    //   console.log(`${socket.id} disconnected MAXIMUM PEERS IS ${MAX_PEERS}`);
    //   socket.disconnect();
    //   return;
    // }

    socket.on(JOIN, (data) => {
      console.log('joining');
      peers.add(socket.id);
      if (peers.size == 1) {
        socket.join(FIRST_PEERS);
      }
      if (peers.size == 2) {
        socket.join(FIRST_PEERS);
        socket.to(FIRST_PEERS).emit(NEW_PEER, FIRST_PEERS);
      }
      if (peers.size >= 3) {
        const id = v4();
        socket.join(id);
        peers.forEach((socketId) => {
          if (socketId === socket.id) {
            return;
          }
          const peer = io.sockets.sockets.get(socketId as any);
          peer?.join(id);
          //all peers apart from the new peer should send a new peer event
          peer?.to(id).emit(NEW_PEER, id);
          socket.to(id).emit(NEW_PEER, id);
        });
      }
    });

    socket.on(OFFERS, (offers, peerId) => {
      console.log('got and offer');
      // console.log({ offers });

      socket.to(peerId).emit(OFFERS, { offers, peerId });
    });

    socket.on(ANSWERS, (answers, peerId) => {
      console.log('got an answer');

      socket.to(peerId).emit(ANSWERS, { answers, peerId });
    });

    socket.on(CANDIDATES, (candidates, peerId) => {
      console.log('got ice candidates');

      socket.to(peerId).emit(CANDIDATES, { candidates, peerId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      peers.delete(socket.id);
      // Check if all users are disconnected
      if (io.engine.clientsCount === 0) {
        peers.clear();
        console.log('🚨 All users have disconnected! Server is empty.');
      }
    });
  });
};
export default connectSocket;
