import { Server } from 'socket.io';

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

  const PEER_DISCONNECTED = 'peerdisconnected';
  const peers = new Set();

  io.on('connection', (socket) => {
    console.log('connecting to socket');

    //   peers.add(socket.id);
    // if (peers.size > MAX_PEERS) {
    //   console.log(`${socket.id} disconnected MAXIMUM PEERS IS ${MAX_PEERS}`);
    //   socket.disconnect();
    //   return;
    // }

    socket.on(JOIN, () => {
      // should brodcast new peer message with peer id of new peer to every peer
      console.log('joining');
      const new_peer_id = socket.id;
      peers.add(new_peer_id);
      io.to(new_peer_id).emit('id', new_peer_id);
      socket.broadcast.emit(NEW_PEER, new_peer_id);

      // const id = v4();
      // socket.join(id);
      // peers.set(socket.id, id);
      // peers.keys().forEach((socketId) => {
      //   if (socketId === socket.id) {
      //     return;
      //   }
      //   const peer = io.sockets.sockets.get(socketId as any);
      //   peer?.join(id);
      //   //all peers apart from the new peer should send a new peer event
      //   peer?.to(id).emit(NEW_PEER, id);
      //   socket.to(id).emit(NEW_PEER, id);
      // });
    });

    socket.on(OFFERS, (data) => {
      console.log('got and offer');

      // should recieve an offer from any existing peer and forward it to the new peer with its id
      const existing_peer = socket;
      // console.log({ offers });
      // this means there are no exisying peers
      // if (socket.id == peerId) return;

      existing_peer
        .to(data.peerId)
        .emit(OFFERS, { offers: data.offers, peerId: existing_peer.id });
    });

    socket.on(ANSWERS, (data) => {
      // offer sent to  new peer,it sends an answer , receive answer from new peer and broadcast it to every other peer
      console.log('got an answer');
      const new_peer = socket;
      new_peer
        .to(data.peerId)
        .emit(ANSWERS, { answers: data.answers, peerId: new_peer.id });

      // socket.t(peerId).emit(ANSWERS, { answers, peerId });
    });

    socket.on(CANDIDATES, (data) => {
      // if  candidates from any other peers and send it to new peer,
      //if ice candidate is sent from new peer should brodcast it to all peers
      console.log('got ice candidates');
      //what ever pper id is received is either the existing peer or the new peer has botha can call the icecandidates
      socket.to(data.peerId).emit(CANDIDATES, {
        candidates: data.candidates,
        peerId: socket.id,
      });

      // socket.to(peerId).emit(CANDIDATES, { candidates, peerId });
    });
    socket.on(PEER_DISCONNECTED, () => {
      socket.disconnect();
    });
    socket.on('muted', ({ peerId, muted }) => {
      socket.broadcast.emit('muted', { peerId, muted });
    });
    socket.on('video-off', ({ peerId, videoOff }) => {
      socket.broadcast.emit('video-off', { peerId, videoOff });
    });
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      io.emit(PEER_DISCONNECTED, socket.id);
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
