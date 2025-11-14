import { createRoom, deleteRoom, joinRoom } from "./roomManager.js";
import { generateRoomId, startRound, getRoom } from "./utils.js";
export const activeRooms = new Map();

export default function gameHandler(io, socket) {
  socket.on("delete_lobby", ({ roomId }, ack) => {
    console.log("deleting lobby", roomId);

    const success = deleteRoom(io, roomId);

    if (!success) {
      if (ack) return ack({ error: "delete_room_error" });
      return { error: "delete_room_error" };
    }

    console.log("room deleted", roomId);
    io.to(roomId).emit("update_phase", "None");

    if (ack) return ack({ success: true });
    return { success: true };
  });
  socket.on("create_lobby", ({ name, roomId, avatar }, ack) => {
    console.log("create_lobby", name, roomId, avatar);
    const id = roomId ?? generateRoomId();
    try {
      console.log("create_lobby", name, roomId);
      const success = createRoom(id);
      if (!success) {
        if (ack) return ack({ error: "room_exists" });
        return { error: "room_exists" };
      }

      console.log("room created", id);

      const roomJoinSuccess = joinRoom(io, socket, id, name, "Host", avatar);
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
      const { roomId, name, avatar } = data;
      console.log("avatar", avatar);

      const roomJoinSuccess = joinRoom(
        io,
        socket,
        roomId,
        name,
        "Player",
        avatar
      );
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

  socket.on("submit_answer", ({ roomId, score }) => {
    if (!roomId) return;
    const room = activeRooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    player.score = player.score + score;
    // update the score and send to all of the players in the room except the player himself
    io.to(roomId).emit("score_update", socket.id, player.score);
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

    for (const [playerId, _] of room.players.entries()) {
      if (room.players.has(playerId)) {
        room.players.set(playerId, {
          id: playerId,
          name: room.players.get(playerId).name,
          playerType: room.players.get(playerId).playerType,
          wins: room.players.get(playerId).wins,
          avatar: room.players.get(playerId).avatar,
          score: 0,
        });
      }
    }

    console.log("players new 2", room.players.values());
    console.log("SCORES new 2", room.players);
    if (ack) {
      console.log("ack success");
      ack({ success: true });
      io.to(roomId).emit("update_phase", "lobby");
      io.to(roomId).emit("score_update", []);
    }
    return { success: false };
  });
  socket.on("round_end", ({ roomId }) => {
    console.log("Round ended");
    const room = activeRooms.get(roomId);
    if (!room) return;

    // find the winner
    const winner = Array.from(room.players.entries()).reduce(
      (max, [playerId, player]) => {
        return player.score > max.score
          ? { playerId, score: player.score }
          : max;
      },
      { playerId: null, score: 0 }
    );
    console.log("winner is", winner.playerId, "with score", winner.score);
    room.players.get(winner.playerId).wins += 1;

    io.to(roomId).emit("wins_update", winner.playerId);

    room.phase = "final_results";
    console.log("scores", room.players);
    console.log("final_results", room.phase);
    io.to(roomId).emit("update_phase", room.phase);
  });

  socket.on("leave_room", ({ roomId, playerType }) => {
    console.log("leave room", roomId, playerType);
    const room = getRoom(roomId);
    console.log("leave room", room);
    if (!room) return;

    const playerId = socket.id;
    // leave room from server
    socket.leave(roomId);

    // if the player is the host, delete the room
    if (playerType === "Host") {
      deleteRoom(io, roomId);
      return;
    }
    // remove socket from player list
    room.players.delete(socket.id);
    room.playerCount -= 1;

    // update the player count for all players in the room
    io.to(roomId).emit("player_count_update", room.playerCount);

    // update the players list for all players in the room
    io.to(roomId).emit("kick_player", playerId);

    // if the room is empty, delete the room
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

        if (room.players.size === 0) {
          if (room.timer) clearInterval(room.timer);
          activeRooms.delete(roomId);
        }
      }
    }
  });
}
