"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/lib/store";
// import { roundEnd } from "@/lib/socket";

interface TimerProps {
  duration?: number; // fallback if store not set
}

export default function Timer({ duration = 30 }: TimerProps) {
  const currentRound = useGameStore((s) => s.currentRound);
  const serverSeconds = currentRound?.timeRemaining ?? duration;
  const startedAt = currentRound?.startedAt;

  // Client-side drift compensation using startedAt if present
  const [seconds, setSeconds] = useState(serverSeconds);

  useEffect(() => {
    setSeconds(serverSeconds);
    console.log("serverSeconds", serverSeconds);
    console.log("serverSeconds <= 0", serverSeconds <= 0);
    if (serverSeconds <= 0) {
      setSeconds(0);
      // roundEnd();
    }
  }, [serverSeconds]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSeconds((s) => Math.max(0, s - 1));
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  const percent = useMemo(() => {
    const total = duration;
    return Math.max(0, Math.min(100, (seconds / total) * 100));
  }, [seconds, duration]);

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-purple-500"
          initial={{ width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ ease: "linear", duration: 0.2 }}
        />
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={seconds}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-2 text-center text-white/90 font-semibold tracking-wider"
        >
          {seconds}s
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
