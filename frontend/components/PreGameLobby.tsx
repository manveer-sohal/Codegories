"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { startGame, setGame } from "@/lib/socket";
import PlayerList from "./PlayerList";
import { newRound } from "@/lib/utils";

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
  const playerType = useGameStore((s) => s.playerType);
  const games = [
    {
      name: "codegories",
      description: "A game of categories and answers.",
      image: "/images/codegories.png",
    },
    {
      name: "speedstorm",
      description: "A game of speed and knowledge.",
      image: "/images/speedstorm.png",
    },
    {
      name: "trivia",
      description: "A game of trivia and answers.",
      image: "/images/trivia.png",
    },
  ];
  useEffect(() => {
    console.log("game type", game);
    setIsReady(playerCount >= 2);
  }, [playerCount, game]);
  useEffect(() => {
    newRound();
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

      <div className=" w-full flex flex-col gap-2 p-2">
        <div className="bg-white/10 rounded-md p-2">
          <h2 className="text-white text-center">Select A Game</h2>
        </div>
        {games.map((game_item) => (
          <button
            key={game_item.name}
            disabled={playerType !== "Host"}
            className={`flex flex-row gap-2 cursor-pointer p-1 rounded-md ${
              game === game_item.name
                ? "border-4 border-white"
                : "border-2 border-white/10"
            }`}
            onClick={() =>
              setTheGame(
                game_item.name as "codegories" | "speedstorm" | "trivia"
              )
            }
          >
            <div className="h-40 w-2/5 bg-blue-500 rounded-md"></div>
            <div className="h-40 w-4/5 bg-green-500 rounded-md p-2">
              <h1 className="text-white">{game_item.name}</h1>
              <p className="text-white">{game_item.description}</p>
            </div>
          </button>
        ))}
      </div>
      <button
        disabled={!isReady || playerType !== "Host"}
        className={`${
          isReady && playerType === "Host"
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
