"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/store";

export default function Scoreboard() {
  const scores = useGameStore((s) => s.scores);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {scores.length === 0 ? (
            <div className="text-white/60 text-sm">Waiting for players...</div>
          ) : (
            scores
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((s) => (
                <div
                  key={s.playerId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-white/90">{s.name}</span>
                  <span className="font-semibold text-purple-300">
                    {s.score}
                  </span>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
