const activeRooms = new Map();

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

function ensureRoom(roomId) {
  if (!activeRooms.has(roomId)) {
    activeRooms.set(roomId, {
      players: new Map(), // socketId -> { name }
      scores: new Map(), // socketId -> number
      round: 1,
      timeRemaining: 0,
      timer: null,
      playerCount: 0,
      phase: "lobby",
    });
  }
  return activeRooms.get(roomId);
}

function startRound(io, roomId, duration = 30) {
  const room = ensureRoom(roomId);
  const category = "Data Structures";
  const letter = "S";
  room.timeRemaining = duration;
  const startedAt = Date.now();
  room.phase = "playing";
  io.to(roomId).emit("round_start", {
    category,
    letter,
    roundNumber: room.round,
    duration,
    startedAt,
  });

  if (room.timer) clearInterval(room.timer);
  room.timer = setInterval(() => {
    room.timeRemaining -= 1;
    io.to(roomId).emit("timer_update", room.timeRemaining);
    if (room.timeRemaining <= 0) {
      clearInterval(room.timer);
      room.timer = null;
      room.phase = "round_results";
      io.to(roomId).emit("update_phase", room.phase);
      io.to(roomId).emit("round_end", {
        valid: [],
        invalid: [],
        duplicates: [],
        nextIn: 3,
      });
    }
  }, 1000);
}

export default function gameHandler(io, socket) {
  socket.on("create_lobby", ({ name, roomId }, ack) => {
    console.log("create_lobby", name, roomId);
    const id = roomId || generateRoomId();
    if (activeRooms.has(id)) {
      console.log("room exists", id);
      if (ack) return ack({ error: "room_exists" });
      return { error: "room_exists" };
    }
    console.log("room does not exist", id);
    ensureRoom(id);
    console.log("room ensured", id);
    if (ack) ack({ roomId: id, error: null });
    console.log("lobby created", id);
    io.to(socket.id).emit("lobby_created", { roomId: id, error: null });
    return { roomId: id, error: null };
  });

  socket.on("join_room", ({ roomId, name }, ack) => {
    try {
      const room = ensureRoom(roomId);
      if (!room) {
        if (ack) return ack({ error: "room_not_found" });
        return { error: "room_not_found" };
      }
      socket.join(roomId);
      room.players.set(socket.id, {
        name: name || `Player-${socket.id.slice(-4)}`,
      });
      room.playerCount = room.players.size;
      console.log("player count updated", room.playerCount);
      io.to(roomId).emit("player_count_update", room.playerCount);
      console.log("phase updated", room.phase);
      io.to(roomId).emit("update_phase", room.phase);
      io.to(roomId).emit(
        "players_update",
        Array.from(room.players.values()).map((player) => ({
          id: player.id,
          name: player.name,
        }))
      );
      if (!room.scores.has(socket.id)) room.scores.set(socket.id, 0);
      if (ack) ack({ success: true });
      return { success: true };
    } catch (error) {
      console.error("join_room error", error);
      if (ack) ack({ error: "join_room_error" });
      return { error: "join_room_error" };
    }
  });
  socket.on("start_game", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) return;
    room.phase = "playing";
    room.round = 1;
    room.timeRemaining = 30;
    startRound(io, roomId, 30);
  });

  socket.on("submit_answer", ({ roomId, answer }) => {
    if (!roomId) return;
    const room = activeRooms.get(roomId);
    if (!room) return;
    const prev = room.scores.get(socket.id) || 0;
    room.scores.set(socket.id, prev + 1);
    const scores = Array.from(room.scores.entries()).map(
      ([playerId, score]) => ({
        playerId,
        name: room.players.get(playerId)?.name || "Player",
        score,
      })
    );
    io.to(roomId).emit("score_update", scores);
  });

  // socket.on("round_end", ({ roomId }) => {
  //   const room = activeRooms.get(roomId);
  //   if (!room) return;
  //   room.phase = "round_results";
  //   console.log("round_end", room.phase);
  //   io.to(roomId).emit("update_phase", room.phase);
  // });

  socket.on("ready_next_round", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) return;
    room.round += 1;
    room.phase = "round_results";
    io.to(roomId).emit("update_phase", room.phase);
    startRound(io, roomId, 30);
  });
  socket.on("leave_room", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) return;
    socket.leave(roomId);
    room.players.delete(socket.id);
    room.scores.delete(socket.id);
    room.playerCount -= 1;
    io.to(roomId).emit("player_count_update", room.playerCount);
    io.to(roomId).emit(
      "players_update",
      Array.from(room.players.values()).map((player) => ({
        id: player.id,
        name: player.name,
      }))
    );
    if (room.playerCount === 0) {
      activeRooms.delete(roomId);
    }
  });

  socket.on("disconnect", () => {
    // Clean up player's rooms
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        room.scores.delete(socket.id);

        if (room.players.size === 0) {
          if (room.timer) clearInterval(room.timer);
          activeRooms.delete(roomId);
        }
      }
    }
  });
}
