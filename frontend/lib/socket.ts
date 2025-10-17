"use client";

import { io, type Socket } from "socket.io-client";
import { GamePhase, Player, useGameStore } from "@/lib/store";

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
  const response = await s.emitWithAck("join_room", {
    roomId,
    name: name || "Guest",
  });
  console.log("joinRoom response", response);
}

export async function leaveRoom(roomId: string) {
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
export async function createLobby(
  name: string,
  roomIdOverride?: string
): Promise<string> {
  const s = getSocket();
  s.connect();

  // Prefer ack pattern if backend supports it
  const ackPromise = new Promise<string>((resolve, reject) => {
    let timeoutId: number | NodeJS.Timeout | undefined;
    try {
      s.timeout(5000).emit(
        "create_lobby",
        { name, roomId: roomIdOverride },
        (err: unknown, res?: { roomId?: string }) => {
          if (timeoutId) clearTimeout(timeoutId as NodeJS.Timeout);
          if (err) return reject(err);
          if (!res?.roomId) return reject(new Error("No roomId returned"));
          resolve(res.roomId);
        }
      );
      // Extra guard in case ack never fires
      timeoutId = setTimeout(
        () => reject(new Error("create_lobby timed out")),
        7000
      );
    } catch (e) {
      reject(e);
    }
  });

  try {
    const roomId = await ackPromise;
    return roomId;
  } catch {
    // Fallback: wait for server to broadcast lobby_created
    const eventPromise = new Promise<string>((resolve, reject) => {
      const onCreated = (payload: { roomId: string }) => {
        s.off("lobby_created", onCreated);
        resolve(payload.roomId);
      };
      s.on("lobby_created", onCreated);
      setTimeout(() => {
        s.off("lobby_created", onCreated);
        reject(new Error("lobby_created event timed out"));
      }, 7000);
    });
    s.emit("create_lobby", { name, roomId: roomIdOverride });
    return await eventPromise;
  }
}
