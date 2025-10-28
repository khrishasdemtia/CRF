const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

let waiting = null;

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  if (waiting) {
    const partner = waiting;
    waiting = null;
    socket.emit("ready");
    partner.emit("ready");
  } else {
    waiting = socket;
  }

  socket.on("offer", (description) => {
    socket.broadcast.emit("offer", socket.id, description);
  });

  socket.on("answer", (id, description) => {
    socket.broadcast.emit("answer", description);
  });

  socket.on("candidate", candidate => {
    socket.broadcast.emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (waiting === socket) waiting = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
