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
      <div className="flex justify-center gap-4 items-end">
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">Second Place</p>
          <div className="w-20 h-40 bg-white/10 rounded-full"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">First Place</p>
          <div className="w-20 h-60 bg-white/10 rounded-full"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">Third Place</p>
          <div className="w-20 h-25 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
