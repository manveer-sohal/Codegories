"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { startGame, setGame } from "@/lib/socket";
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
  const [isReady, setIsReady] = useState(false);
  const game = useGameStore((s) => s.game);

  useEffect(() => {
    setIsReady(playerCount >= 2);
  }, [playerCount]);
  useEffect(() => {
    if (phase === "playing" || phase === "round_results") {
      console.log("How did we get here?");
    }
  }, [phase, lobbyId, router]);

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
    startGame(lobbyId, game);
  }
  const setTheGame = (game: "codegories" | "speedstorm" | "trivia") => {
    console.log("setting game", game, lobbyId);
    setGame(lobbyId || "", game);
  };

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
      <div className=" w-full flex flex-col gap-2 p-2">
        <h2 className="text-white">Select A Game</h2>
        <div
          className={`flex flex-row gap-2 cursor-pointer p-1 ${
            game === "codegories" ? "border-4 border-white" : ""
          }`}
          onClick={() => setTheGame("codegories")}
        >
          <div className="h-40 w-2/5 bg-blue-500 rounded-md"></div>
          <div className="h-40 w-4/5 bg-green-500 rounded-md p-2">
            <h1 className="text-white">Codegories</h1>
            <p className="text-white">A game of categories and answers.</p>
          </div>
        </div>
        <div
          className={`flex flex-row gap-2 cursor-pointer p-1 ${
            game === "speedstorm" ? "border-4 border-white" : ""
          }`}
          onClick={() => setTheGame("speedstorm")}
        >
          <div className="h-40 w-2/5 bg-blue-500 rounded-md"></div>
          <div className="h-40 w-4/5 bg-green-500 rounded-md p-2">
            <h1 className="text-white">SpeedStorm</h1>
            <p className="text-white">A game of speed and knowledge.</p>
          </div>
        </div>
        <div
          className={`flex flex-row gap-2 cursor-pointer p-1 ${
            game === "trivia" ? "border-4 border-white" : ""
          }`}
          onClick={() => setTheGame("trivia")}
        >
          <div className="h-40 w-2/5 bg-blue-500 rounded-md"></div>
          <div className="h-40 w-4/5 bg-green-500 rounded-md p-2">
            <h1 className="text-white">Trivia</h1>
            <p className="text-white">A game of trivia and answers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
