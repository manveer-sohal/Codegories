"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/store";
import { useEffect } from "react";

export default function Scoreboard() {
  const players = useGameStore((s) => s.players);
  const playersList = Array.from(players.values());
  useEffect(() => {
    console.log("scores", playersList);
  }, [playersList]);
  return (
    <Card className="w-full bg-black/60">
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {playersList.length === 0 ? (
            <div className="text-white/60 text-sm">Waiting for players...</div>
          ) : (
            playersList.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white/90">{player.name}</span>
                <span className="font-semibold text-purple-300">
                  {player.score}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
