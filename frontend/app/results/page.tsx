"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Scoreboard from "@/components/Scoreboard";
import { resetGame } from "@/lib/socket";
import { useGameStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function ResultsPage() {
  const roomId = useGameStore((s) => s.roomId);
  const phase = useGameStore((s) => s.phase);
  const router = useRouter();

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

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Final Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm">
            Results:
            <Scoreboard />
          </p>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleResetGame}>Play Again</Button>
      </div>
    </div>
  );
}
