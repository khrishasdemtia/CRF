const socket = io(); // Connect to server
const peerConnection = new RTCPeerConnection();

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  })
  .catch(err => console.error("Error accessing media:", err));

peerConnection.ontrack = event => {
  remoteVideo.srcObject = event.streams[0];
};

// Signaling events
socket.on("offer", async (id, description) => {
  await peerConnection.setRemoteDescription(description);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", id, peerConnection.localDescription);
});

socket.on("answer", async description => {
  await peerConnection.setRemoteDescription(description);
});

socket.on("candidate", async candidate => {
  try {
    await peerConnection.addIceCandidate(candidate);
  } catch (err) {
    console.error("Error adding ICE candidate:", err);
  }
});

peerConnection.onicecandidate = event => {
  if (event.candidate) socket.emit("candidate", event.candidate);
};

// When connected, try to become caller
socket.on("ready", async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", peerConnection.localDescription);
});
