const activeRooms = new Map();

function joinRoom(io, socket, roomId, name, playerType) {
  try {
    const room = activeRooms.get(roomId);
    if (!room) {
      console.error("room not found", roomId);
      return false;
    }
    console.log("room found", room);
    // player joins room
    socket.join(roomId);
    // add player to room
    room.players.set(socket.id, {
      name: name || `Player-${socket.id.slice(-4)}`,
      playerType: playerType,
    });
    // update player count
    room.playerCount = room.players.size;
    console.log("game type", room.game);

    // send updated player count in room
    io.to(roomId).emit("player_count_update", room.playerCount);
    io.to(roomId).emit("game_update", room.game);

    if (room.phase == "playing") {
      console.log("change phase to playing:", room.timeRemaining);
      io.to(roomId).emit("timer_update", room.timeRemaining);
      io.to(roomId).emit("round_start", {
        category: room.category,
        letter: room.letter,
        roundNumber: room.round,
        duration: room.timeRemaining,
        startedAt: room.startedAt,
        game: room.game,
      });
    }
    // send updated phase to player
    io.to(roomId).emit("update_phase", room.phase);

    // send updated players in room
    io.to(roomId).emit(
      "players_update",
      Array.from(room.players.values()).map((player) => ({
        id: player.id,
        name: player.name,
        playerType: player.playerType,
        wins: player.wins,
      }))
    );
    if (!room.scores.has(socket.id)) room.scores.set(socket.id, 0);

    console.log("Room.players: ", room.players);
    console.log("phase updated", room.phase, socket.id);

    // send updated phase to player
    return true;
  } catch (error) {
    console.error("joinRoom error", error);
    throw new Error("joinRoom error");
  }
}
function generateRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

function deleteRoom(io, roomId) {
  const room = activeRooms.get(roomId);
  if (room) {
    console.log("deleting room on delete room", roomId);
    io.to(roomId).emit("update_phase", "None");
    io.to(roomId).emit("players_update", []);
    io.to(roomId).emit("score_update", []);
    io.to(roomId).emit("timer_update", 0);
    io.to(roomId).emit("leave_room", {});
    activeRooms.delete(roomId);
    const roomDeleted = activeRooms.get(roomId);
    console.log("room deleted", roomDeleted);

    return;
  }
  return false;
}
function createRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (room) {
    if (room.players.size == 0) {
      activeRooms.delete(roomId);
    }
  }

  if (!activeRooms.has(roomId)) {
    activeRooms.set(roomId, {
      players: new Map(), // socketId -> { name, playerType, wins }
      scores: new Map(), // socketId -> number
      round: 1,
      timeRemaining: 0,
      timer: null,
      playerCount: 0,
      phase: "lobby",
      game: "codegories",
    });
    return true;
  }
  return false;
}
function ensureRoom(roomId) {
  if (!activeRooms.has(roomId)) {
    activeRooms.set(roomId, {
      players: new Map(), // socketId -> { name, playerType, wins }
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
  console.log("Start Round:", room.timeRemaining);
  room.timeRemaining = duration;
  const startedAt = Date.now();
  room.phase = "playing";
  io.to(roomId).emit("round_start", {
    category,
    letter,
    roundNumber: room.round,
    duration,
    startedAt,
    game: room.game,
  });

  if (room.timer) clearInterval(room.timer);
  room.timer = setInterval(() => {
    room.timeRemaining = room.timeRemaining - 1;

    io.to(roomId).emit("timer_update", room.timeRemaining);
    if (room.timeRemaining == -1) {
      clearInterval(room.timer);
      room.timer = null;
      room.phase = "final_results";
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
  socket.on("delete_lobby", ({ roomId }, ack) => {
    console.log("deleting lobby", roomId);
    const success = deleteRoom(roomId);
    if (!success) {
      if (ack) return ack({ error: "delete_room_error" });
      return { error: "delete_room_error" };
    }
    console.log("room deleted", roomId);
    io.to(roomId).emit("update_phase", "None");

    if (ack) return ack({ success: true });
    return { success: true };
  });
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

      const roomJoinSuccess = joinRoom(io, socket, id, name, "Host");
      if (!roomJoinSuccess) {
        if (ack) return ack({ error: "join_room_error" });
        // delete the room
        activeRooms.delete(id);
        console.error("room deleted on join room error", id);
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

  socket.on("join_room", (data, ack) => {
    try {
      console.log("join_room", data);
      const { roomId, name } = data;

      const roomJoinSuccess = joinRoom(io, socket, roomId, name, "Player");
      console.log("roomJoinSuccess", roomJoinSuccess);
      if (!roomJoinSuccess) {
        console.log("roomJoinSuccess false");
        if (ack) {
          console.log("ack error");
          return ack({ error: "join_room_error" });
        }
        return { error: "join_room_error" };
      }

      console.log("ack value", ack);
      if (ack) {
        console.log("ack success");
        ack({ success: true });
        return { success: true };
      }
      console.log("join_room_error");
      return { error: "join_room_error" };
    } catch (error) {
      console.log("join_room error", error);
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
  socket.on("set_game", ({ roomId, game }) => {
    console.log("set_game", roomId, game);
    const room = activeRooms.get(roomId);
    if (!room) return;
    room.game = game;
    io.to(roomId).emit("game_update", game);
  });

  socket.on("reset_game", ({ roomId }, ack) => {
    console.log("resetting game", roomId);
    const room = activeRooms.get(roomId);
    if (!room) {
      if (ack) return ack({ error: "room_not_found" });
      return { error: "room_not_found" };
    }
    room.phase = "lobby";
    room.round = 1;
    room.timeRemaining = 0;
    room.timer = null;
    console.log("players new 1", room.players.values());
    console.log("SCORES new 1", room.scores);

    for (const [playerId, player] of room.players.entries()) {
      console.log("player", player.id);
      if (room.scores.has(playerId)) {
        room.scores.set(playerId, 0);
      }
    }

    console.log("players new 2", room.players.values());
    console.log("SCORES new 2", room.scores);
    if (ack) {
      console.log("ack success");
      ack({ success: true });
      io.to(roomId).emit("update_phase", "lobby");
      io.to(roomId).emit("score_update", []);
    }
    return { success: false };
  });
  socket.on("round_end", ({ roomId }) => {
    console.log("Round end");
    const room = activeRooms.get(roomId);
    if (!room) return;

    // find the winner
    const winner = Array.from(room.scores.entries()).reduce(
      (max, [playerId, score]) => {
        return score > max.score ? { playerId, score } : max;
      },
      { playerId: null, score: 0 }
    );
    room.players.get(winner.playerId).wins += 1;

    room.phase = "final_results";
    console.log("scores", room.scores);
    console.log("final_results", room.phase);
    io.to(roomId).emit("update_phase", room.phase);
  });

  // socket.on("ready_next_round", ({ roomId }) => {
  //   const room = activeRooms.get(roomId);
  //   if (!room) return;
  //   room.round += 1;
  //   room.phase = "round_results";
  //   io.to(roomId).emit("update_phase", room.phase);
  //   startRound(io, roomId, 30);
  // });
  socket.on("leave_room", ({ roomId, playerType }) => {
    const room = activeRooms.get(roomId);
    if (!room) return;
    socket.leave(roomId);
    if (playerType === "Host") {
      deleteRoom(io, roomId);
      return;
    }
    room.players.delete(socket.id);
    room.scores.delete(socket.id);
    room.playerCount -= 1;
    io.to(roomId).emit("player_count_update", room.playerCount);
    io.to(roomId).emit(
      "players_update",
      Array.from(room.players.values()).map((player) => ({
        id: player.id,
        name: player.name,
        playerType: player.playerType,
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
