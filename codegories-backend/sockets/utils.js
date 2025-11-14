import { activeRooms } from "./gameHandler.js";
export function getRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) {
    return false;
  }
  return room;
}

export function chooseRandomLetter() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  return randomLetter;
}
export function roundEnd(io, roomId) {
  const room = getRoom(roomId);
  if (!room) return false;

  // find the winner
  const winner = Array.from(room.players.entries()).reduce(
    (max, [playerId, player]) => {
      return player.score > max.score ? { playerId, score: player.score } : max;
    },
    { playerId: null, score: 0 }
  );
  console.log("winner", winner);
  if (winner.playerId) {
    room.players.get(winner.playerId).wins += 1;
  }

  io.to(roomId).emit("wins_update", winner.playerId);
}

export function startRound(io, roomId, duration = 30) {
  const room = getRoom(roomId);

  const category = "Data Structures";

  // choose random letter for the round
  const letter = chooseRandomLetter();

  // set the time remaining for the round
  room.timeRemaining = duration;

  // set the started at time for the round
  const startedAt = Date.now();

  // set the phase to playing
  room.phase = "playing";

  // send round start to all players in the room
  io.to(roomId).emit("round_start", {
    category,
    letter,
    roundNumber: room.round,
    duration,
    startedAt,
    game: room.game,
  });

  // clear the timer if it exists
  if (room.timer) clearInterval(room.timer);

  // set the timer to update the time remaining for the round
  room.timer = setInterval(() => {
    // decrement the time remaining for the round
    room.timeRemaining = room.timeRemaining - 1;

    io.to(roomId).emit("timer_update", room.timeRemaining);
    if (room.timeRemaining == -1) {
      clearInterval(room.timer);
      roundEnd(io, roomId);
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

export function generateRoomId() {
  return Math.random().toString(36).slice(2, 8);
}
