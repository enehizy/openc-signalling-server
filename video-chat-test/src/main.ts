import socket from './sockets';

// const connections:{peerConnection:RTCPeerConnection,peerId?:string}[]=[];
export const connections: Map<string, RTCPeerConnection> = new Map();
const CANDIDATES = 'icecandidates';
export const OFFERS = 'offers';
const ANSWERS = 'answers';
const JOIN = 'join';
const NEW_PEER = 'newpeer';
export const PEER_DISCONNECTED = 'peerdisconnected';
let number_of_video_elements = 1;
const videoGrid = document.getElementById('video-grid') as HTMLVideoElement;
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;

export let userMedia: MediaStream;

export const getUserAudioOnly = async () => {
  console.log('clicked');
  userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  // }

  localVideo.autoplay = true;

  localVideo.muted = true;
  localVideo.srcObject = userMedia;
  localVideo.poster = '/poster.svg';
  // localVideo.srcObject.getVideoTracks().forEach((track)=> track.)
  number_of_video_elements += 1;
  socket.emit(JOIN, '');
};

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
];
const createPeer = (peerId: string) => {
  let newPeer: RTCPeerConnection;
  if (connections.has(peerId)) {
    newPeer = connections.get(peerId) as RTCPeerConnection;
    console.log('senders after peer creation', newPeer.getSenders());
  } else {
    newPeer = new RTCPeerConnection({ iceServers });
    userMedia.getTracks().forEach((track) => {
      newPeer.addTrack(track, userMedia);
    });
  }

  console.log(userMedia.getTracks());

  newPeer.addEventListener('icecandidate', (e) => {
    if (e.candidate) {
      console.log(`candidates ${e.candidate}`);
      socket.emit(CANDIDATES, { candidates: e.candidate, peerId: peerId });
    }
  });

  //  // Track event handler for remote tracks
  newPeer.addEventListener('track', (e) => {
    const currentVideoElement = document.getElementById(
      `video-${peerId}`
    ) as HTMLVideoElement;

    const remoteVideo = document.createElement('video');
    const stream = e.streams[0];

    if (currentVideoElement) {
      currentVideoElement.srcObject = stream;
      currentVideoElement.play();
      return; // Skip if video element already exists for this peer
    }

    console.log('tracks from event', stream);
    remoteVideo.className = 'video';
    remoteVideo.id = `video-${peerId}`;
    remoteVideo.autoplay = true;
    remoteVideo.muted = true;

    remoteVideo.playsInline = true;

    remoteVideo.srcObject = stream;
    remoteVideo.poster = '/poster.svg';
    document.documentElement.style.setProperty(
      '--grid-col-number',
      `${number_of_video_elements < 3 ? number_of_video_elements : 3}`
    );

    videoGrid?.appendChild(remoteVideo);
    number_of_video_elements += 1;
    remoteVideo.play().catch((err) => console.error('Play failed:', err));
  });

  return newPeer;
};

export let id: string;
socket.on('id', (peerId) => {
  id = peerId;
});

export const renegotaition = async () => {
  userMedia = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localVideo.srcObject = userMedia;
  // videoToggleButton.classList.remove('opacity-30')

  localVideo.play();

  for (const [peerId, peerConnection] of connections) {
    const senders = peerConnection.getSenders();
    const getTracks = userMedia.getTracks();

    console.log('before senders replaced', peerConnection.getSenders());
    senders.forEach((sender) => {
      if (sender.track) {
        // Stop the track if it exists
        sender.track.stop();
      }
      peerConnection.removeTrack(sender);
    });

    getTracks.forEach((track) => {
      peerConnection.addTrack(track, userMedia);
    });
    console.log('after senders removed', peerConnection.getSenders());

    // console.log('new senders',peerConnection.getSenders())
    const offers = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offers);
    socket.emit(OFFERS, { offers, peerId });
  }
};

socket.on(NEW_PEER, async (peerId) => {
  //should receive a new peer message from a new peer with an id
  //create a loal peer
  //add and offer to it and send it to the server
  const peerConnection = createPeer(peerId);
  connections.set(peerId, peerConnection);
  const offers = await peerConnection.createOffer();
  socket.emit(OFFERS, { offers, peerId });
  await peerConnection.setLocalDescription(offers);
  //-> offer sent to new peer
});

socket.on(OFFERS, async (data) => {
  // await getUserMedia();

  //new peer receives offer snds it to server ,server sends it to existing peers
  console.log('Received offer:', data.offers);
  const peerConnection = createPeer(data.peerId);
  connections.set(data.peerId, peerConnection);
  // const peerConnection = getPeer(data.peerId);

  await peerConnection?.setRemoteDescription(
    new RTCSessionDescription(data.offers)
  );

  const answers = await peerConnection?.createAnswer();
  socket.emit(ANSWERS, { answers, peerId: data.peerId });

  await peerConnection?.setLocalDescription(answers);
  //-> sents offer to exiting peers
});

socket.on(ANSWERS, async (data) => {
  console.log('Received answer:', data.answers);

  if (!connections.has(data.peerId)) {
    console.log('no peer to answer sorry');
    return;
  }
  const peerById = connections.get(data.peerId);
  console.log('Current signaling state:', peerById?.signalingState);
  await peerById?.setRemoteDescription(new RTCSessionDescription(data.answers));
});
socket.on(CANDIDATES, async (data) => {
  if (!connections.has(data.peerId)) {
    return;
  }
  const peerById = connections.get(data.peerId);

  await peerById?.addIceCandidate(new RTCIceCandidate(data.candidates));
});

socket.on(PEER_DISCONNECTED, async (peerId) => {
  console.log('peer id', peerId);
  const videoElement = document.getElementById(
    `video-${peerId}`
  ) as HTMLVideoElement;
  const stream = videoElement.srcObject as MediaStream;
  stream.getTracks().forEach((track) => track.stop());
  videoElement.parentNode?.removeChild(videoElement);
  number_of_video_elements -= 1;

  document.documentElement.style.setProperty(
    '--grid-col-number',
    `${number_of_video_elements - 1}`
  );
  connections.get(peerId)?.close();
  connections.delete(peerId);
});

document.addEventListener('DOMContentLoaded', async () => {
  await getUserAudioOnly();
});
