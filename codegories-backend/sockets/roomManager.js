import { activeRooms } from "./gameHandler.js";
import { getRoom } from "./utils.js";
//createRoom, deleteRoom, ensureRoom, activeRooms
export function createRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (room) {
    if (room.players.size == 0) {
      activeRooms.delete(roomId);
    }
  }

  if (!activeRooms.has(roomId)) {
    activeRooms.set(roomId, {
      players: new Map(), // socketId -> { name, playerType, wins, avatar, score }
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

export function deleteRoom(io, roomId) {
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

    return true;
  }
  return false;
}

export function ensureRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) {
    return createRoom(roomId);
  }
  return room;
}

export function joinRoom(io, socket, roomId, name, playerType, avatar) {
  try {
    const room = getRoom(roomId);
    if (!room) {
      console.error("room not found", roomId);
      return false;
    }

    // player joins room
    socket.join(roomId);

    // add player to room
    room.players.set(socket.id, {
      id: socket.id,
      name: name || `Player-${socket.id.slice(-4)}`,
      playerType: playerType,
      wins: 0,
      avatar: avatar,
      score: 0,
    });

    // update player count
    room.playerCount = room.players.size;

    // send updated player count in room
    io.to(roomId).emit("player_count_update", room.playerCount);

    console.log("sending game type to player who joined", room.game);
    // send game type to player who joined
    io.to(roomId).emit("game_update", room.game);

    if (room.phase == "playing") {
      // send timer update to player who joined
      socket.to(roomId).emit("timer_update", room.timeRemaining);

      // send round start to player who joined
      socket.to(roomId).emit("round_start", {
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

    //removed ass state does not update automatically when a player gets added to player list so might as well send the whole player list to every player in the room
    // send updated players in room
    // io.to(roomId).emit("add_player", {
    //   id: socket.id,
    //   name: name,
    //   playerType: playerType,
    //   wins: 0,
    //   avatar: avatar,
    //   score: 0,
    // });

    console.log("sending players list to player", room.players);
    io.to(roomId).emit("set_players_list", Object.fromEntries(room.players));

    // send updated phase to player
    return true;
  } catch (error) {
    console.error("joinRoom error", error);
    throw new Error("joinRoom error");
  }
}
