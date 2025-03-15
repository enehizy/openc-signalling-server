import { Server } from 'socket.io';
import { MAX } from 'uuid';
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
  const NEW_PEER = 'newpeer';

  //global variables
  const MAX_PEERS = 7;
  const peerIds = [
    'id_1a2b3c',
    'id_4d5e6f',
    'id_7g8h9i',
    'id_jk10lm',
    'id_nop11q',
  ];
  const peers = new Set();

  io.on('connection', (socket) => {
    peers.add(socket.id);
    console.log('connecting to socket');
    if (peers.size > MAX_PEERS) {
      console.log(`${socket.id} disconnected MAXIMUM PEERS IS ${MAX_PEERS}`);
      socket.disconnect();
      return;
    }

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

  //   const saved_offer: Map<String, { socketId: string; offers: any }> = new Map();
  //   // const joined_users:any[] = [];
  //   const saved_ice_candidate = new Map();
  //   let offer_triggered = false;
  //   io.on('connection', (socket) => {
  //     socket.on(CANDIDATES, (data) => {
  //       console.log('got candidates');
  //       saved_ice_candidate.set(data.roomId, data.candidates);
  //       io.to(data.roomId).emit(CANDIDATES, data.candidates);
  //     });

  //     socket.on(OFFERS, (data) => {
  //       console.log('got offers');
  //       saved_offer.set(data.roomId, data.offers);
  //       io.to(data.roomId).except(socket.id).emit(OFFERS, data.offers);
  //     });
  //     socket.on(ANSWERS, (data: { roomId: string; answers: any }) => {
  //       console.log('got answers');
  //       socket.to(joined_users[0]).emit(OFFERS, data.answers);
  //     });
  //     const getUsersInRoom = (roomId) => {
  //       const room = io.sockets.adapter.rooms.get(roomId);
  //       return room ? Array.from(room) : []; // Convert Set to Array
  //     };
  //     socket.on('join', (roomId) => {
  //       //  socket.leave(roomId)
  //       console.log(`${socket.id} joined ${roomId}`);
  //       socket.join(roomId);
  //       const joined_users = getUsersInRoom(roomId);

  //       if (joined_users.length == 2) {
  //         io.to(joined_users[0]).emit('call');
  //       }
  //       if (joined_users.length > 2) {
  //         socket.to(roomId).emit('call');
  //       }
  //     });

  //     socket.on('disconnect', (socket) => {
  //       saved_offer.clear();
  //     });
  //   });
};
export default connectSocket;
