import { id, renegotaition, userMedia } from './main';
import socket from './sockets';
const videoToggleButton = document.getElementById('video-toggle');
const videoToggleIcon = document.querySelector(
  '#video-toggle > img'
) as HTMLImageElement;
const audioToggleButton = document.getElementById('audio-toggle');
const audioToggleIcon = document.querySelector(
  '#audio-toggle > img'
) as HTMLImageElement;
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;

const endCallBtn = document.getElementById('end-call');
// const rejoin = document.getElementById('rejoin');
// const rejoinBtn = document.getElementById('rejoinBtn');
let videoOff = true;
let muted = true;

socket.on('video-off', ({ videoOff: isVideoOff, peerId }) => {
  const remoteVideo = document.getElementById(
    `video-${peerId}`
  ) as HTMLVideoElement;
  const remoteLabel = document.getElementById(
    `label-${peerId}`
  ) as HTMLHeadingElement;
  const remoteFigure = document.getElementById(
    `figure-${peerId}`
  ) as HTMLDivElement;
  if (remoteVideo) {
    if (isVideoOff) {
      const remoteStream = remoteVideo.srcObject as MediaStream;
      const videoTracks = remoteStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.stop();
        remoteStream.removeTrack(track);
      });
      remoteVideo.srcObject = remoteStream;
      remoteFigure.classList.remove('relative');
      remoteFigure.classList.add('absolute', 'invisible');
      remoteLabel.classList.remove('hidden');
      remoteVideo.play();
      return;
    }
  }
  //   alert(`${MyDisplayName.textContent} has turned on their video`);
  //   MyDisplayName.classList.remove('hidden');
});

videoToggleButton?.addEventListener('click', async () => {
  videoOff = !videoOff;
  const MyDisplayName = document.getElementById(
    'display-name'
  ) as HTMLHeadingElement;

  if (videoOff) {
    const videoTrack = userMedia.getVideoTracks();
    videoTrack.forEach((track) => {
      track.stop();
      userMedia.removeTrack(track);
    });
    videoToggleIcon.src = '/video-off.svg';
    localVideo.srcObject = userMedia;
    MyDisplayName.classList.remove('hidden');
    socket.emit('video-off', { videoOff, peerId: id });

    return;
  }
  videoToggleIcon.src = '/video-on.svg';

  await renegotaition();
});

socket.on('muted', ({ peerId, muted: isMuted }) => {
  const videoElement = document.getElementById(
    `video-${peerId}`
  ) as HTMLVideoElement;
  videoElement.muted = isMuted;
});
audioToggleButton?.addEventListener('click', () => {
  muted = !muted;

  if (muted) {
    audioToggleIcon.src = '/sound-off.svg';
  } else {
    audioToggleIcon.src = '/sound-on.svg';
  }

  socket.emit('muted', { peerId: id, muted: muted });
});

endCallBtn?.addEventListener('click', () => {
  //   const videoGrid = document.getElementById('video-grid') as HTMLVideoElement;
  //   const footer = document.querySelector('footer') as any;
  const endCallTone = document.getElementById(
    'end-call-tone'
  ) as HTMLAudioElement;
  endCallTone.play();
  //   socket.emit(PEER_DISCONNECTED);
  //   videoGrid.remove();
  //   footer.remove();
  //   rejoin?.classList.remove('hidden');
  //   rejoin?.classList.add('flex');
  //   userMedia.getTracks().forEach((track) => {
  //     track.stop();
  //     userMedia.removeTrack(track);
  //     endSound.play();
  //   });
  //   for (let [_, peer] of connections) {
  //     peer.getSenders().forEach((sender) => {
  //       sender.track?.stop();
  //       peer.removeTrack(sender);
  //     });
  //     peer.close();
  //   }
  //   connections.clear();
});

// rejoinBtn?.addEventListener('click', () => {
//   window.location.reload();
// });
