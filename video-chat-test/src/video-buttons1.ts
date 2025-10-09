// import {
//   id,
//   renegotaition,
//   userMedia,
//   connections,
//   PEER_DISCONNECTED,
// } from './main';
// import socket from './sockets';
// const videoToggleButton = document.getElementById('video-toggle');
// const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
// const audioToggleButton = document.getElementById('audio-toggle');
// const endBtn = document.getElementById('end');
// const rejoin = document.getElementById('rejoin');
// const rejoinBtn = document.getElementById('rejoinBtn');
// let videoOff = true;
// let muted = true;

// socket.on('video-off', ({ videoOff: isVideoOff, peerId }) => {
//   const remoteVideo = document.getElementById(
//     `video-${peerId}`
//   ) as HTMLVideoElement;
//   if (remoteVideo) {
//     if (isVideoOff) {
//       const remoteStream = remoteVideo.srcObject as MediaStream;
//       const videoTracks = remoteStream.getVideoTracks();
//       videoTracks.forEach((track) => {
//         track.stop();
//         remoteStream.removeTrack(track);
//       });
//       remoteVideo.srcObject = remoteStream;
//       remoteVideo.play();
//       return;
//     }
//   }
// });

// videoToggleButton?.addEventListener('click', async () => {
//   videoOff = !videoOff;
//   const videoTrack = userMedia.getVideoTracks();

//   if (videoOff) {
//     videoTrack.forEach((track) => {
//       track.stop();
//       userMedia.removeTrack(track);
//     });
//     videoToggleButton.classList.add('opacity-30');
//     localVideo.srcObject = userMedia;
//     socket.emit('video-off', { videoOff, peerId: id });

//     return;
//   }
//   videoToggleButton.classList.remove('opacity-30');
//   await renegotaition();
// });

// socket.on('muted', ({ peerId, muted: isMuted }) => {
//   const videoElement = document.getElementById(
//     `video-${peerId}`
//   ) as HTMLVideoElement;
//   videoElement.muted = isMuted;
// });
// audioToggleButton?.addEventListener('click', () => {
//   const muteP = document.querySelector(
//     '#audio-toggle > p'
//   ) as HTMLParagraphElement;
//   muted = !muted;
//   if (muted) {
//     audioToggleButton.classList.add('opacity-30');
//     muteP.textContent = 'muted';
//   } else {
//     audioToggleButton.classList.remove('opacity-30');
//     muteP.textContent = 'mute';
//   }

//   socket.emit('muted', { peerId: id, muted: muted });
// });

// endBtn?.addEventListener('click', () => {
//   const videoGrid = document.getElementById('video-grid') as HTMLVideoElement;
//   const footer = document.querySelector('footer') as any;
//   const endSound = document.getElementById('end-sound') as HTMLAudioElement;
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
// });

// rejoinBtn?.addEventListener('click', () => {
//   window.location.reload();
// });
