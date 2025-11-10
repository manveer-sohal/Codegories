"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Scoreboard from "@/components/Scoreboard";
import { resetGame } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FinalResults() {
  const roomId = useGameStore((s) => s.roomId);
  const phase = useGameStore((s) => s.phase);
  const router = useRouter();
  const scores = useGameStore((s) => s.scores);

  useEffect(() => {
    if (phase == "lobby") {
      router.push(`/game/${roomId}`);
    }
  }, [phase, router, roomId]);
  const handleResetGame = async () => {
    const success = await resetGame(roomId!);
    console.log("phase", phase);
    if (success) {
      router.push(`/game/${roomId}`);
      console.log("Game reset successfully");
    } else {
      console.error("Failed to reset game");
      alert("Failed to reset game");
    }
  };
  const sortedScores = scores.slice().sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Final Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm">Results:</p>
          <Scoreboard />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleResetGame}>Play Again</Button>
      </div>
      <div className="flex justify-center gap-4 items-end">
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">Second Place</p>
          {sortedScores[1] && (
            <>
              <p className="text-white/70 text-sm">{sortedScores[1].name}</p>
              <p className="text-white/70 text-sm">{sortedScores[1].score}</p>
              <div className="w-20 h-40 bg-white/10 rounded-full"></div>
            </>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">First Place</p>
          {sortedScores[0] && (
            <>
              <p className="text-white/70 text-sm">{sortedScores[0].name}</p>
              <p className="text-white/70 text-sm">{sortedScores[0].score}</p>
              <div className="w-20 h-60 bg-white/10 rounded-full"></div>
            </>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">Third Place</p>
          {sortedScores[2] && (
            <>
              <p className="text-white/70 text-sm">{sortedScores[2].name}</p>
              <p className="text-white/70 text-sm">{sortedScores[2].score}</p>
              <div className="w-20 h-25 bg-white/10 rounded-full"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
