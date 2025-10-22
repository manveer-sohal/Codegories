"use client";

import { io, type Socket } from "socket.io-client";
import { GamePhase, Player, useGameStore } from "@/lib/store";
import { JoinRoomStatus } from "@/types/JoinRoomStatus";
import { CreateLobbyFormStatus } from "@/types/FormStatus";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "ws://localhost:4000";
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
    useGameStore.getState().updateTimeRemaining(seconds);
  });

  s.on(
    "score_update",
    (scores: { playerId: string; name: string; score: number }[]) => {
      useGameStore.getState().setScores(scores);
    }
  );

  s.on("round_end", () => {
    useGameStore.setState({ phase: "round_results" });
  });

  s.on("player_count_update", (playerCount: number) => {
    useGameStore.setState({ playerCount: playerCount });
  });
  s.on("update_phase", (phase: GamePhase) => {
    console.log("update_phase", phase);
    useGameStore.setState({ phase: phase });
  });

  s.on("players_update", (players: Player[]) => {
    useGameStore.setState({ players: players });
  });
  s.on("start_game", () => {
    useGameStore.setState({ phase: "playing" });
  });
}

export async function startGame(roomId: string) {
  const s = getSocket();
  s.connect();
  s.emit("start_game", { roomId });
}
export async function joinRoom(roomId: string, name: string) {
  const s = getSocket();
  s.connect();
  try {
    const response = await s.emitWithAck("join_room", {
      roomId,
      name: name || "Guest",
    });
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
    useGameStore.setState({ phase: "lobby" });
    useGameStore.setState({ playerName: name });
    return JoinRoomStatus.SUCCESS; // success
  } catch (error) {
    console.error("joinRoom error", error);
    return JoinRoomStatus.JOIN_ERROR; // unknown error
  }
}

export async function leaveRoom(roomId: string) {
  console.log("leaveRoom", roomId);
  const s = getSocket();
  s.connect();
  const response = await s.emitWithAck("leave_room", {
    roomId,
  });
  console.log("leaveRoom response", response);
}

export function submitAnswer(answer: string) {
  const { roomId } = useGameStore.getState();
  if (!roomId) return;
  getSocket().emit("submit_answer", { roomId, answer });
}

export function readyNextRound() {
  const { roomId } = useGameStore.getState();
  if (!roomId) return;
  getSocket().emit("ready_next_round", { roomId });
}

// export function roundEnd() {
//   const { roomId } = useGameStore.getState();
//   if (!roomId) return;
//   getSocket().emit("round_end", { roomId });
// }
// Create lobby helper: emits create_lobby and returns roomId via ack or event
export async function createLobby(name: string, roomIdOverride?: string) {
  const s = getSocket();
  s.connect();

  // Prefer ack pattern if backend supports it

  try {
    const response = await s.emitWithAck("create_lobby", {
      name,
      roomId: roomIdOverride,
    });
    if (response.success) {
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
