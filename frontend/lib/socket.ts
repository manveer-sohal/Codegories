"use client";

import { io, type Socket } from "socket.io-client";
import { GamePhase, Player, useGameStore } from "@/lib/store";

let socket: Socket | null = null;

export function getSocket(): Socket {
  console.log("getSocket");
  if (!socket) {
    // const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "ws://localhost:4000";
    const url = "ws://localhost:4000";

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

  s.on("score_update", (playerId: string, score: number) => {
    console.log("score update", playerId, score);
    useGameStore.getState().updateScore(playerId, score);
  });

  s.on("wins_update", (playerId: string) => {
    console.log("wins update");
    useGameStore.getState().updateWinner(playerId);
  });

  s.on("add_player", (player: Player) => {
    console.log("add player", player);
    useGameStore.getState().addPlayer(player);
  });

  s.on("set_players_list", (players: Record<string, Player>) => {
    console.log("get players list", players);
    useGameStore.setState({ players: new Map(Object.entries(players)) });
  });

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

  s.on("start_game", () => {
    console.log("starting game");
    useGameStore.setState({ phase: "playing" });
  });

  s.on("kick_player", (playerId: string) => {
    console.log("kicking player", playerId);
    useGameStore.getState().removePlayer(playerId);
  });

  s.on("leave_room", () => {
    console.log("leaving room");
    useGameStore.getState().reset();
  });

  s.on("game_update", (game: "codegories" | "speedstorm" | "trivia") => {
    useGameStore.setState({ game: game });
    console.log("game_update", game);
  });
}
