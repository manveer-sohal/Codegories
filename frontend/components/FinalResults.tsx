"use client";

import avatar1 from "@/images/avatar1.png";
import avatar2 from "@/images/avatar2.png";
import avatar3 from "@/images/avatar3.png";
import avatar4 from "@/images/avatar4.png";
import avatar5 from "@/images/avatar5.png";
import avatar6 from "@/images/avatar6.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Scoreboard from "@/components/Scoreboard";
import { resetGame } from "@/lib/socket_util";
import { useGameStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const avatarMap = {
  avatar1: avatar1,
  avatar2: avatar2,
  avatar3: avatar3,
  avatar4: avatar4,
  avatar5: avatar5,
  avatar6: avatar6,
};
export default function FinalResults() {
  const roomId = useGameStore((s) => s.roomId);
  const phase = useGameStore((s) => s.phase);
  const router = useRouter();
  const playerType = useGameStore((s) => s.playerType);
  const players = useGameStore((s) => s.players);
  const [sortedScores, setSortedScores] = useState<[string, number, string][]>(
    []
  );

  const sortScores = useCallback(() => {
    const scores = Array.from(players.values()).map((player) => {
      return [player.name, player.score, player.avatar];
    });
    setSortedScores(
      scores.sort((a, b) => (b[1] as number) - (a[1] as number)) as [
        string,
        number,
        string
      ][]
    );
  }, [players]);

  useEffect(() => {
    if (phase == "lobby") {
      router.push(`/game/${roomId}`);
    }
    sortScores();
  }, [phase, router, roomId, sortScores]);

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
          <p className="text-white/70 text-sm">Results:</p>
          <Scoreboard />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button disabled={playerType !== "Host"} onClick={handleResetGame}>
          Play Again
        </Button>
      </div>
      <div className="flex justify-center gap-4 items-end">
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">Second Place</p>
          {sortedScores[1] && (
            <>
              <Image
                src={avatarMap[sortedScores[1][2] as keyof typeof avatarMap]}
                alt={sortedScores[1][0]}
                width={80}
                height={80}
              />
              <p className="text-white/70 text-sm">{sortedScores[1][0]}</p>
              <p className="text-white/70 text-sm">{sortedScores[1][1]}</p>
              <div className="w-20 h-40 bg-white/10 rounded-full"></div>
            </>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">First Place</p>
          {sortedScores[0] && (
            <>
              <Image
                src={avatarMap[sortedScores[0][2] as keyof typeof avatarMap]}
                alt={sortedScores[0][0]}
                width={80}
                height={80}
              />
              <p className="text-white/70 text-sm">{sortedScores[0][0]}</p>
              <p className="text-white/70 text-sm">{sortedScores[0][1]}</p>
              <div className="w-20 h-60 bg-white/10 rounded-full"></div>
            </>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 text-sm">Third Place</p>
          {sortedScores[2] && (
            <>
              <Image
                src={avatarMap[sortedScores[2][2] as keyof typeof avatarMap]}
                alt={sortedScores[2][0]}
                width={80}
                height={80}
              />
              <p className="text-white/70 text-sm">{sortedScores[2][0]}</p>
              <p className="text-white/70 text-sm">{sortedScores[2][1]}</p>
              <div className="w-20 h-25 bg-white/10 rounded-full"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
