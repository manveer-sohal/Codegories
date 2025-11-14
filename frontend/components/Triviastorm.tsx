import { useGameStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";

import PlayerList from "./PlayerList";
import Timer from "./Timer";

import FinalResults from "./FinalResults";

import Scoreboard from "./Scoreboard";
import Quiz from "./Quiz";
export default function TriviaStorm() {
  const currentRound = useGameStore((s) => s.currentRound);
  const playerCount = useGameStore((s) => s.playerCount);
  const phase = useGameStore((s) => s.phase);
  const roomId = useGameStore((s) => s.roomId);
  return (
    <>
      {phase === "final_results" ? (
        <FinalResults />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="text-white/70 text-sm">
                Player Count: {playerCount}
              </div>
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
                  {currentRound?.timeRemaining && <Timer />}
                </motion.div>
              </AnimatePresence>
              <Quiz />
            </div>
            <div className="space-y-4">
              <PlayerList />
              <Scoreboard />
            </div>
          </div>
        </>
      )}
    </>
  );
}
