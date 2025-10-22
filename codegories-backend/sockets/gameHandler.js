const activeRooms = new Map();

function joinRoom(io, socket, roomId, name) {
  try {
    const room = activeRooms.get(roomId);
    if (!room) {
      console.error("room not found", roomId);
      return false;
    }
    socket.join(roomId);
    room.players.set(socket.id, {
      name: name || `Player-${socket.id.slice(-4)}`,
    });
    console.log("Room.players: ", room.players);
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
    return true;
  } catch (error) {
    console.error("joinRoom error", error);
    throw new Error("joinRoom error");
  }
}
function generateRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

function createRoom(roomId) {
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
    return true;
  }
  return false;
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
    const id = roomId ?? generateRoomId();
    try {
      console.log("create_lobby", name, roomId);
      const success = createRoom(id);
      if (!success) {
        if (ack) return ack({ error: "room_exists" });
        return { error: "room_exists" };
      }

      console.log("room created", id);

      const roomJoinSuccess = joinRoom(io, socket, id, name);
      if (!roomJoinSuccess) {
        if (ack) return ack({ error: "join_room_error" });
        // delete the room
        activeRooms.delete(id);
        console.error("room deleted", id);
        return { error: "join_room_error" };
      }

      if (ack) {
        ack({ roomId: id, success: true });
        return { roomId: id, success: true };
      }
      activeRooms.delete(id);
      console.error("room deleted", id);
      return { error: "create_error" };
    } catch (error) {
      activeRooms.delete(id);
      console.error("room deleted", id);
      console.error("create_lobby error", error);
      if (ack) return ack({ error: "create_error" });
      return { error: "create_error" };
    }
  });

  socket.on("join_room", ({ roomId, name }, ack) => {
    try {
      console.log("join_room", roomId, name);

      const roomJoinSuccess = joinRoom(io, socket, roomId, name);
      if (!roomJoinSuccess) {
        if (ack) return ack({ error: "join_room_error" });
        return { error: "join_room_error" };
      }
      if (ack) {
        ack({ success: true });
        return { success: true };
      }
      return { error: "join_room_error" };
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
  socket.on("check_room_valid", ({ roomId }, ack) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      if (ack) return ack({ valid: false });
      return { valid: false };
    }
    if (ack) return ack({ valid: true });
    return { valid: true };
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
    console.log("player count updated", room.playerCount);
    if (room.playerCount === 0) {
      console.log("room deleted", roomId);
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
