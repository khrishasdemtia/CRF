// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Create Express app
const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server for signaling
const io = new Server(server);

let waiting = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Pair two users together
  if (waiting) {
    const partner = waiting;
    waiting = null;
    socket.emit("ready");
    partner.emit("ready");
  } else {
    waiting = socket;
  }

  // Handle WebRTC signaling messages
  socket.on("offer", (description) => {
    socket.broadcast.emit("offer", socket.id, description);
  });

  socket.on("answer", (id, description) => {
    socket.broadcast.emit("answer", description);
  });

  socket.on("candidate", (candidate) => {
    socket.broadcast.emit("candidate", candidate);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (waiting === socket) waiting = null;
  });
});

// Listen on the port Render provides, or 3000 locally
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
