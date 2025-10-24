"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoryCard from "@/components/CategoryCard";
import GameInput from "@/components/GameInput";
import Scoreboard from "@/components/Scoreboard";
import Timer from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { joinRoom, leaveRoom, readyNextRound } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import PlayerList from "@/components/PlayerList";
import ListAnswers from "@/components/ListAnswers";
import PreGameLobby from "@/components/PreGameLobby";

export default function GameRoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const playerName = useGameStore((s) => s.playerName);
  const phase = useGameStore((s) => s.phase);
  const currentRound = useGameStore((s) => s.currentRound);
  const setScores = useGameStore((s) => s.setScores);
  const playerCount = useGameStore((s) => s.playerCount);
  const roomId = useGameStore((s) => s.roomId);
  const players = useGameStore((s) => s.players);

  useEffect(() => {
    console.log("phase", phase);
    if (players.length > 0) {
      setScores(
        players.map((player) => ({
          playerId: player.id,
          name: player.name,
          score: 0,
        }))
      );
    }
  }, [players, setScores, phase]);

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
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <div className="text-white/70 text-sm">Player Count: {playerCount}</div>
        <div className="text-white/70 text-sm">Room ID: {roomId}</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRound?.roundNumber ?? "lobby"}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <CategoryCard
              category={currentRound?.category ?? "Waiting..."}
              letter={currentRound?.letter ?? "-"}
            />

            {currentRound?.timeRemaining && (
              <Timer duration={currentRound?.timeRemaining} />
            )}
            <GameInput />
            <ListAnswers />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="space-y-4">
        <PlayerList />
        <Scoreboard />

        {phase === "round_results" && (
          <>
            <Button className="w-full" onClick={() => readyNextRound()}>
              Next Round
            </Button>
          </>
        )}
        {phase === "final_results" && (
          <div>
            <Button className="w-full" onClick={() => router.push("/results")}>
              View Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
