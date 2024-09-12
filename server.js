const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Handle socket connection
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);
  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
