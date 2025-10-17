"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { createLobby, joinRoom, startGame } from "@/lib/socket";
import PlayerList from "./PlayerList";

export default function PreGameLobby({
  lobbyId,
  createdLobbyId,
}: {
  lobbyId: string | undefined;
  createdLobbyId: string | undefined;
}) {
  const router = useRouter();
  const playerCount = useGameStore((s) => s.playerCount);
  const phase = useGameStore((s) => s.phase);
  console.log("phase", phase);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(playerCount === 2);
  }, [playerCount]);
  useEffect(() => {
    if (phase === "playing" || phase === "round_results") {
      router.push(`/game/${lobbyId}`);
    }
  }, [phase]);

  function startTheGame() {
    if (!isReady) {
      console.log("not ready");
      alert("Please wait for another player to join the lobby");
      return;
    }
    if (!lobbyId) {
      console.log("no lobby id");
      alert("No lobby id");
      return;
    }
    startGame(lobbyId);

    router.push(`/game/${lobbyId}`);
  }

  return (
    <div className="mx-auto max-w-xl mt-8 ">
      <h1 className="text-3xl font-bold mb-4">Pre Game Lobby</h1>
      <p className="text-white/70 mb-6">
        {lobbyId
          ? `Lobby ID: ${lobbyId}`
          : `Created Lobby ID: ${createdLobbyId}`}
      </p>
      <PlayerList />
      {}
      <button
        disabled={!isReady}
        className={`${
          isReady
            ? "bg-purple-600 text-white hover:bg-purple-500 focus-visible:ring-purple-400"
            : "bg-gray-500 text-white"
        } w-full py-2 rounded-md`}
        onClick={() => startTheGame()}
      >
        start game
      </button>
    </div>
  );
}
