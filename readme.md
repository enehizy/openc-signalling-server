LINKS : <https://h7vttsuz2c.us-east-1.awsapprunner.com/> ,<https://openc-signalling-server.onrender.com/>

# WebRTC Signaling Server

This is a signaling server designed for a real-time video and chat application using WebRTC. It facilitates the exchange of Session Description Protocol (SDP) offers, answers, and ICE candidates between peers to establish peer-to-peer connections for video calls and text messaging.

## Features

- **WebSocket with SSL**: Secure communication between clients and the server.
- **Peer Connection Setup**: Handles SDP offer/answer exchange for WebRTC peer connections.
- **ICE Candidate Exchange**: Relays ICE candidates for NAT traversal.

## rebuild container

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 195275644944.dkr.ecr.us-east-1.amazonaws.com
```

```bash
docker build -t osas-video-call .
docker buildx build --platform linux/amd64 -t osas-video-call .
```

```bash
docker tag osas-video-call:latest 195275644944.dkr.ecr.us-east-1.amazonaws.com/osas-video-call:latest
```

```bash
docker push 195275644944.dkr.ecr.us-east-1.amazonaws.com/osas-video-call:latest
```
