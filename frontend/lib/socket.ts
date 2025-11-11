"use client";

import { io, type Socket } from "socket.io-client";
import { GamePhase, Player, useGameStore } from "@/lib/store";
import { JoinRoomStatus } from "@/types/JoinRoomStatus";
import { CreateLobbyFormStatus } from "@/types/FormStatus";

let socket: Socket | null = null;

export function getSocket(): Socket {
  console.log("getSocket");
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "ws://localhost:4000";
    console.log("url", url);

    socket = io(url, {
      transports: ["websocket"],
      autoConnect: false,
    });

    attachCoreListeners(socket);
  }
  return socket;
}

function attachCoreListeners(s: Socket) {
  s.on("connect", () => {
    // Optionally handle connect
  });

  s.on("disconnect", () => {
    // Optionally handle disconnect
  });

  // Incoming game events
  s.on(
    "round_start",
    (payload: {
      category: string;
      letter: string;
      roundNumber: number;
      duration: number;
      startedAt?: number;
      game: "codegories" | "speedstorm" | "trivia";
    }) => {
      useGameStore.setState({
        phase: "playing",
        round: payload.roundNumber,
        currentRound: {
          roundNumber: payload.roundNumber,
          category: payload.category,
          letter: payload.letter,
          timeRemaining: payload.duration,
          startedAt: payload.startedAt,
        },
      });
    }
  );

  s.on("timer_update", (seconds: number) => {
    console.log("update_times", seconds);
    useGameStore.getState().updateTimeRemaining(seconds);
  });

  s.on(
    "score_update",
    (scores: { playerId: string; name: string; score: number }[]) => {
      console.log("score update");
      useGameStore.getState().setScores(scores);
    }
  );

  s.on("round_end", () => {
    console.log("round end");

    useGameStore.setState({ phase: "final_results" });
  });

  s.on("player_count_update", (playerCount: number) => {
    console.log(" update player count");

    useGameStore.setState({ playerCount: playerCount });
  });
  s.on("update_phase", (phase: GamePhase) => {
    console.log("update_phase", phase);
    useGameStore.setState({ phase: phase });
  });

  s.on("players_update", (players: Player[]) => {
    console.log("players_update", players);
    useGameStore.setState({ players: players });
  });
  s.on("start_game", () => {
    console.log("starting game");
    useGameStore.setState({ phase: "playing" });
  });
  s.on("kick_player", (playerId: string) => {
    console.log("kicking player", playerId);
    useGameStore.setState({
      players: useGameStore
        .getState()
        .players.filter((player) => player.id !== playerId),
    });
  });

  s.on("leave_room", () => {
    console.log("leaving room");
    useGameStore.setState({ phase: "None" });
    useGameStore.setState({ playerType: "None" });
    useGameStore.setState({ roomId: undefined });
    useGameStore.setState({ playerName: "" });
    useGameStore.setState({ players: [] });
    useGameStore.setState({ scores: [] });
    useGameStore.setState({ playerCount: 0 });
    useGameStore.setState({ playerInput: [] });
    useGameStore.setState({ currentRound: undefined });
    useGameStore.setState({ game: "codegories" });
  });
  s.on("game_update", (game: "codegories" | "speedstorm" | "trivia") => {
    useGameStore.setState({ game: game });
    console.log("game_update", game);
  });
}

export async function setGame(
  roomId: string,
  game: "codegories" | "speedstorm" | "trivia"
) {
  const s = getSocket();
  console.log("set_game", roomId, game);
  s.connect();
  // useGameStore.setState({ duration: 5 });
  s.emit("set_game", { roomId, game });
}

export async function resetGame(roomId: string) {
  const s = getSocket();
  console.log("resetting game", roomId);
  s.connect();
  try {
    const response = await s.emitWithAck("reset_game", { roomId });
    useGameStore.setState({ playerInput: [] });
    return response.success;
  } catch (error) {
    console.error("resetGame error", error);
    return false;
  }
}

export async function startGame(
  roomId: string,
  game: "codegories" | "speedstorm" | "trivia"
) {
  const s = getSocket();
  console.log("starting game", roomId, game);
  s.connect();
  s.emit("start_game", { roomId });
}
export async function joinRoom(
  roomId: string,
  name: string
): Promise<JoinRoomStatus> {
  const s = getSocket();
  s.connect();
  console.log("Trying to join room", roomId, name);
  try {
    const response = await s.emitWithAck("join_room", { roomId, name });
    console.log("joinRoom response", response);
    if (!response.success) {
      if (response.error === "room_not_found") {
        return JoinRoomStatus.ROOM_NOT_FOUND; // room not found
      }
      if (response.error === "join_room_error") {
        return JoinRoomStatus.JOIN_ERROR; // join room error
      }
      return JoinRoomStatus.JOIN_ERROR; // unknown error
    }
    useGameStore.setState({ roomId: roomId });
    useGameStore.setState({ playerType: "Player" });
    useGameStore.setState({ playerName: name });
    // useGameStore.setState({ phase: "lobby" });
    return JoinRoomStatus.SUCCESS; // success
  } catch (error) {
    console.error("joinRoom error", error);
    return JoinRoomStatus.JOIN_ERROR; // unknown error
  }
}

export async function deleteLobby(roomId: string) {
  console.log("deleteLobby", roomId);
  const s = getSocket();
  s.connect();
  try {
    const response = await s.emitWithAck("delete_lobby", {
      roomId,
    });
    return response.success;
  } catch (error) {
    console.error("deleteLobby error", error);
    return false;
  }
}

export async function leaveRoom(roomId: string) {
  console.log("leaveRoom", roomId);
  const s = getSocket();
  s.connect();
  const response = await s.emitWithAck("leave_room", {
    roomId,
    playerType: useGameStore.getState().playerType,
  });

  useGameStore.setState({ phase: "None" });
  useGameStore.setState({ playerType: "None" });
  useGameStore.setState({ roomId: undefined });
  useGameStore.setState({ playerName: "" });
  useGameStore.setState({ players: [] });
  useGameStore.setState({ scores: [] });
  useGameStore.setState({ playerCount: 0 });
  useGameStore.setState({ playerInput: [] });
  useGameStore.setState({ currentRound: undefined });
  console.log("leaveRoom response", response);
}
export function updateScore(score: number) {
  const { roomId } = useGameStore.getState();
  if (!roomId) return;
  console.log("updateScore", roomId, score);
  getSocket().emit("submit_answer", { roomId, score });
}

// export function readyNextRound() {
//   const { roomId } = useGameStore.getState();
//   if (!roomId) return;
//   getSocket().emit("ready_next_round", { roomId });
// }

export function roundEnd() {
  console.log("end round");
  const { roomId } = useGameStore.getState();
  if (!roomId) return;
  getSocket().emit("round_end", { roomId });
}
// Create lobby helper: emits create_lobby and returns roomId via ack or event
export async function createLobby(name: string, roomIdOverride?: string) {
  const s = getSocket();
  s.connect();

  try {
    console.log("creating lobby", name, roomIdOverride);
    const response = await s.emitWithAck("create_lobby", {
      roomId: roomIdOverride,
      name,
    });
    if (response.success) {
      useGameStore.setState({ roomId: response.roomId ?? "" });
      useGameStore.setState({ phase: "lobby" });
      useGameStore.setState({ playerType: "Host" });
      return {
        roomId: response.roomId ?? "",
        error: CreateLobbyFormStatus.SUCCESS,
      };
    }

    if (response.error === "room_exists") {
      return { roomId: "", error: CreateLobbyFormStatus.ROOM_EXISTS };
    }
    if (response.error === "create_error") {
      return { roomId: "", error: CreateLobbyFormStatus.CREATE_ERROR };
    }
    return { roomId: "", error: CreateLobbyFormStatus.CREATE_ERROR };
  } catch (e) {
    console.error("createLobby error", e);
    return { roomId: "", error: CreateLobbyFormStatus.CREATE_ERROR };
  }
}

export async function checkRoomValid(roomId: string) {
  const s = getSocket();
  s.connect();
  const response = await s.emitWithAck("check_room_valid", {
    roomId,
  });
  return response.valid;
}
