const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

// Enable CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // This allows all origins (change this to the specific origin you want to allow)
    methods: ["GET", "POST"], // Allow specific methods
  },
});

app.use(express.static("public"));

// Store the members in the room
let members = [];

// Handle socket.io connection
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);
  console.log("Members in the room:", members);

  socket.emit("MEMBERS", members);

  socket.on("JOIN", (data) => {
    socket.broadcast.emit("JOIN", data);
    members.push(data);
  });

  socket.on("POSITION", (data) => {
    console.log("POSITION", data);
    socket.broadcast.emit("POSITION", data);
    members = members.map((member) => {
      if (member.id === data.id) {
        return {
          ...member,
          position: data.position,
        };
      }
      return member;
    });
  });

  socket.on("WEAPON", (data) => {
    console.log("WEAPON", data);
    socket.broadcast.emit("WEAPON", data);
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
    members = members.filter((d) => d.member.id !== socket.id);
    console.log("MEMBERS LEFT", members);
    socket.broadcast.emit("LEAVE", { id: socket.id });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
