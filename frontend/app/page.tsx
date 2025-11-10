"use client";

import JoinLobbyForm from "@/components/JoinLobbyForm";
import CreateLobbyForm from "@/components/CreateLobbyForm";
import { useEffect } from "react";
import { useGameStore } from "@/lib/store";
import { useRouter } from "next/navigation";
export default function Home() {
  const lobbyId = useGameStore((s) => s.roomId);
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const router = useRouter();

  //if the lobbyId is set, redirect to the pregame page
  useEffect(() => {
    // In the correct order of phases
    if (phase == "None") return;
  }, [lobbyId, router, phase, setPhase]);
  return (
    <div className="mx-auto max-w-xl mt-8 ">
      <h1 className="text-3xl font-bold mb-4">Welcome to Codegories</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Join Lobby */}
        <div className="col-span-1">
          <JoinLobbyForm />
        </div>

        {/* Create Lobby */}
        <div className="col-span-1">
          <CreateLobbyForm />
        </div>
      </div>
    </div>
  );
}
