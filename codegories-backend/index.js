import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import gameHandler from "./sockets/gameHandler.js";

dotenv.config();
const app = express();
app.use(cors());
app.get("/", (_, res) => res.send("Codegories backend running 🚀"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("🟢 New client:", socket.id);
  gameHandler(io, socket);
  socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
