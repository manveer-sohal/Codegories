"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { useGameStore } from "@/lib/store";

import PreGameLobby from "@/components/PreGameLobby";
import Speedstorm from "@/components/Speedstorm";
import Codegories from "@/components/Codegories";
import TriviaStorm from "@/components/Triviastorm";

export default function GameRoomPage() {
  const router = useRouter();
  const phase = useGameStore((s) => s.phase);
  const setScores = useGameStore((s) => s.setScores);
  const roomId = useGameStore((s) => s.roomId);
  const players = useGameStore((s) => s.players);
  const game = useGameStore((s) => s.game);

  // useEffect(() => {
  //   console.log("phase", phase);
  //   if (players.length > 0 && phase === "playing") {
  //     setScores(
  //       players.map((player) => ({
  //         playerId: player.id,
  //         name: player.name,
  //         score: 0,
  //       }))
  //     );
  //   }
  // }, [players, setScores, phase]);

  useEffect(() => {
    if (phase == "None") {
      router.push("/");
    }
  }, [phase, router]);

  return phase === "None" ? (
    <div>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : phase === "lobby" ? (
    <PreGameLobby lobbyId={roomId} createdLobbyId={roomId} />
  ) : game === "codegories" ? (
    <Codegories />
  ) : game === "speedstorm" ? (
    <Speedstorm />
  ) : game === "trivia" ? (
    <TriviaStorm />
  ) : null;
}
