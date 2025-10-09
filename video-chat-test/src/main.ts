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
const peerVideoFeeds = document.getElementById(
  'peer-video-feeds'
) as HTMLDivElement;
const MyDisplayName = document.getElementById(
  'display-name'
) as HTMLHeadingElement;
const waiting = document.getElementById('waiting') as HTMLDivElement;
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const numberOfParticipants = document.getElementById(
  'number-of-particioants'
) as HTMLParagraphElement;
export let userMedia: MediaStream;

export const getUserAudioOnly = async () => {
  if (!navigator.mediaDevices) {
    console.log('this browser does not support getting usr media');
    return;
  }
  userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  console.log('user media', userMedia);

  // }

  localVideo.autoplay = true;
  localVideo.playsInline = true;
  localVideo.muted = true;
  localVideo.srcObject = userMedia;

  // localVideo.srcObject.getVideoTracks().forEach((track)=> track.)
  // number_of_video_elements += 1;

  socket.emit(JOIN, '');
};
const hostname = location.hostname;
console.log('hostname', hostname);
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:relay1.expressturn.com:3478',
    username: 'efFO9YFJ30BK11FWI6',
    credential: 'U4VbTHpVOqFgYk21',
  },
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
    const currentFigureElement = document.getElementById(
      `figure-${peerId}`
    ) as HTMLDivElement;
    const currentLabelElement = document.getElementById(
      `label-${peerId}`
    ) as HTMLHeadingElement;
    const figcaption = document.createElement('figcaption');
    figcaption.id = `figcaption-${peerId}`;

    const stream = e.streams[0];

    if (currentVideoElement) {
      //  only when video is on
      figcaption.innerText = `peer ${peerId}`.substring(0, 8);
      currentFigureElement.classList.add('relative');
      figcaption.classList.add('fig-caption');
      currentFigureElement.appendChild(figcaption);
      //normal video settingd

      currentVideoElement.autoplay = true;
      currentVideoElement.playsInline = true;
      currentVideoElement.srcObject = stream;
      currentVideoElement.classList.remove('invisible');
      currentFigureElement.classList.remove('invisible', 'absolute');
      currentLabelElement.classList.add('hidden');
      currentLabelElement.classList.remove('caption');
      currentVideoElement.muted = true;
      currentVideoElement
        .play()
        .catch((err) => console.error('Play failed:', err));
      return; // Skip if video element already exists for this peer
    }
    const figure = document.createElement('figure');
    const remoteVideo = document.createElement('video');
    const label = document.createElement('h1');
    label.id = `label-${peerId}`;

    figure.id = `figure-${peerId}`;
    //    when video is off, show label
    peerVideoFeeds.classList.add('relative');
    label.innerText = `peer ${peerId}`.substring(0, 8);
    const mic_muted = document.createElement('img') as HTMLImageElement;
    mic_muted.src = '/mic-muted.svg';
    mic_muted.id = `mic-muted-${peerId}`;
    mic_muted.classList.add('margin-0-auto');
    label.appendChild(mic_muted);
    label.classList.add('peer-video-off-label');
    peerVideoFeeds.appendChild(label);
    figure.classList.add('invisible', 'absolute');
    //these video settings apply whether video is on or off
    remoteVideo.id = `video-${peerId}`;
    remoteVideo.muted = true;
    remoteVideo.controls = false;
    remoteVideo.playsInline = true;
    remoteVideo.autoplay = true;
    remoteVideo.srcObject = stream;
    figure.appendChild(remoteVideo);

    if (number_of_video_elements >= 1) {
      waiting.classList.add('hidden');
    }
    peerVideoFeeds.appendChild(figure);
    number_of_video_elements += 1;
    numberOfParticipants.textContent = `${number_of_video_elements}`;
    remoteVideo.play().catch((err) => console.error('Play failed:', err));
    //new video setting end here
    // console.log('tracks from event', stream);
    // remoteVideo.className = 'video';
    // remoteVideo.id = `video-${peerId}`;
    // remoteVideo.autoplay = true;
    // remoteVideo.muted = true;

    // remoteVideo.playsInline = true;

    // remoteVideo.srcObject = stream;
    // remoteVideo.poster = '/poster.svg';
    // document.documentElement.style.setProperty(
    //   '--grid-col-number',
    //   `${number_of_video_elements < 3 ? number_of_video_elements : 3}`
    // );

    // videoGrid?.appendChild(remoteVideo);
    // number_of_video_elements += 1;
    // remoteVideo.play().catch((err) => console.error('Play failed:', err));
  });

  return newPeer;
};

export let id: string;
// const nameToId = new Map<string, string>();
socket.on('id', (peerId) => {
  id = peerId;
});

export const renegotaition = async () => {
  userMedia = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  MyDisplayName.classList.add('hidden');
  localVideo.srcObject = userMedia;
  localVideo.classList.remove('invisible');
  // videoToggleButton.classList.remove('opacity-30')
  localVideo.muted = true;
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
  const currentLabelElement = document.getElementById(
    `label-${peerId}`
  ) as HTMLHeadingElement;
  const stream = videoElement.srcObject as MediaStream;
  stream.getTracks().forEach((track) => track.stop());
  peerVideoFeeds.removeChild(currentLabelElement);
  peerVideoFeeds.removeChild(videoElement.parentElement!);

  //   videoElement.parentNode?.removeChild(videoElement);
  number_of_video_elements -= 1;
  numberOfParticipants.textContent = `${number_of_video_elements}`;
  if (number_of_video_elements <= 1) {
    waiting.classList.remove('hidden');
  }
  //   document.documentElement.style.setProperty(
  //     '--grid-col-number',
  //     `${number_of_video_elements - 1}`
  //   );
  connections.get(peerId)?.close();
  connections.delete(peerId);
});

document.addEventListener('DOMContentLoaded', async () => {
  await getUserAudioOnly();
});
